import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { loadJSON, saveJSON, STORAGE_KEYS } from '../lib/storage'
import {
  initCard,
  review,
  statusFromCard,
  isDue,
  MAX_BOX,
  type CardState,
  type SrsGrade,
  type MemoStatus,
} from '../lib/srs'
import { useAuth } from './AuthContext'
import { pullRemote, pushProgress, pushNote, clearRemote } from '../lib/sync'

type SrsMap = Record<number, CardState>
type NotesMap = Record<number, string>
type TimeMap = Record<number, number>

interface CloudState {
  active: boolean
  syncing: boolean
}

interface StudyContextValue {
  getCard: (n: number) => CardState | undefined
  reviewCard: (n: number, grade: SrsGrade) => void
  status: (n: number) => MemoStatus
  setStatus: (n: number, status: MemoStatus) => void
  getNote: (n: number) => string
  setNote: (n: number, text: string) => void
  dueCount: (numbers: number[]) => number
  memorizedCount: number
  learningCount: number
  resetAll: () => void
  cloud: CloudState
}

const StudyContext = createContext<StudyContextValue | null>(null)

export function StudyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const [srs, setSrs] = useState<SrsMap>(() => loadJSON<SrsMap>(STORAGE_KEYS.srs, {}))
  const [notes, setNotes] = useState<NotesMap>(() => loadJSON<NotesMap>(STORAGE_KEYS.notes, {}))
  const [srsTimes, setSrsTimes] = useState<TimeMap>(() =>
    loadJSON<TimeMap>(STORAGE_KEYS.srsTimes, {}),
  )
  const [noteTimes, setNoteTimes] = useState<TimeMap>(() =>
    loadJSON<TimeMap>(STORAGE_KEYS.noteTimes, {}),
  )
  const [syncing, setSyncing] = useState(false)

  // Refs so async sync reads the latest values without re-subscribing.
  const srsRef = useRef(srs)
  const notesRef = useRef(notes)
  const srsTimesRef = useRef(srsTimes)
  const noteTimesRef = useRef(noteTimes)
  const userIdRef = useRef(userId)
  srsRef.current = srs
  notesRef.current = notes
  srsTimesRef.current = srsTimes
  noteTimesRef.current = noteTimes
  userIdRef.current = userId

  const noteTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const syncInFlight = useRef(false)

  // --- local writers (write-through to cloud when signed in) ---------------
  const reviewCard = useCallback((n: number, grade: SrsGrade) => {
    const now = Date.now()
    const card = review(srsRef.current[n], grade, now)
    setSrs((prev) => {
      const next = { ...prev, [n]: card }
      saveJSON(STORAGE_KEYS.srs, next)
      return next
    })
    setSrsTimes((prev) => {
      const next = { ...prev, [n]: now }
      saveJSON(STORAGE_KEYS.srsTimes, next)
      return next
    })
    if (userIdRef.current) void pushProgress(userIdRef.current, n, card, now)
  }, [])

  const setStatus = useCallback((n: number, next: MemoStatus) => {
    const now = Date.now()
    const base = srsRef.current[n] ?? initCard(now)
    let card: CardState
    if (next === 'memorized') {
      card = { box: MAX_BOX, due: now + 35 * 86_400_000, last: now, reps: Math.max(base.reps, 1) }
    } else if (next === 'learning') {
      card = {
        box: Math.max(1, Math.min(base.box, MAX_BOX - 1)),
        due: now + 86_400_000,
        last: now,
        reps: Math.max(base.reps, 1),
      }
    } else {
      card = initCard(now)
    }
    setSrs((prev) => {
      const merged = { ...prev, [n]: card }
      saveJSON(STORAGE_KEYS.srs, merged)
      return merged
    })
    setSrsTimes((prev) => {
      const merged = { ...prev, [n]: now }
      saveJSON(STORAGE_KEYS.srsTimes, merged)
      return merged
    })
    if (userIdRef.current) void pushProgress(userIdRef.current, n, card, now)
  }, [])

  const setNote = useCallback((n: number, text: string) => {
    const now = Date.now()
    setNotes((prev) => {
      const next = { ...prev }
      if (text.trim()) next[n] = text
      else delete next[n]
      saveJSON(STORAGE_KEYS.notes, next)
      return next
    })
    setNoteTimes((prev) => {
      const next = { ...prev, [n]: now }
      saveJSON(STORAGE_KEYS.noteTimes, next)
      return next
    })
    // Debounce the cloud write so we don't upsert on every keystroke.
    const uid = userIdRef.current
    if (uid) {
      clearTimeout(noteTimers.current[n])
      noteTimers.current[n] = setTimeout(() => {
        void pushNote(uid, n, text.trim() ? text : '', now)
      }, 800)
    }
  }, [])

  // --- cloud merge (last-writer-wins by timestamp) -------------------------
  const syncNow = useCallback(async () => {
    const uid = userIdRef.current
    if (!uid || syncInFlight.current) return
    syncInFlight.current = true
    setSyncing(true)
    try {
      const remote = await pullRemote(uid)

      const localSrs = srsRef.current
      const localSrsT = srsTimesRef.current
      const mergedSrs: SrsMap = { ...localSrs }
      const mergedSrsT: TimeMap = { ...localSrsT }
      const progressToPush: number[] = []
      const pNums = new Set<number>([
        ...Object.keys(localSrs).map(Number),
        ...Object.keys(remote.progress).map(Number),
      ])
      for (const n of pNums) {
        const localTs = localSrs[n] ? (localSrsT[n] ?? localSrs[n].last) : -1
        const r = remote.progress[n]
        if (r && r.ts >= localTs) {
          mergedSrs[n] = r.card
          mergedSrsT[n] = r.ts
        } else if (localSrs[n] && localTs > (r?.ts ?? -1)) {
          progressToPush.push(n)
        }
      }

      const localNotes = notesRef.current
      const localNoteT = noteTimesRef.current
      const mergedNotes: NotesMap = { ...localNotes }
      const mergedNoteT: TimeMap = { ...localNoteT }
      const notesToPush: number[] = []
      const nNums = new Set<number>([
        ...Object.keys(localNotes).map(Number),
        ...Object.keys(remote.notes).map(Number),
      ])
      for (const n of nNums) {
        const localTs = localNotes[n] != null ? (localNoteT[n] ?? 0) : -1
        const r = remote.notes[n]
        if (r && r.ts >= localTs) {
          if (r.body) mergedNotes[n] = r.body
          else delete mergedNotes[n]
          mergedNoteT[n] = r.ts
        } else if (localNotes[n] != null && localTs > (r?.ts ?? -1)) {
          notesToPush.push(n)
        }
      }

      setSrs(mergedSrs)
      saveJSON(STORAGE_KEYS.srs, mergedSrs)
      setSrsTimes(mergedSrsT)
      saveJSON(STORAGE_KEYS.srsTimes, mergedSrsT)
      setNotes(mergedNotes)
      saveJSON(STORAGE_KEYS.notes, mergedNotes)
      setNoteTimes(mergedNoteT)
      saveJSON(STORAGE_KEYS.noteTimes, mergedNoteT)

      await Promise.all([
        ...progressToPush.map((n) =>
          pushProgress(uid, n, mergedSrs[n], mergedSrsT[n] ?? Date.now()),
        ),
        ...notesToPush.map((n) =>
          pushNote(uid, n, mergedNotes[n] ?? '', mergedNoteT[n] ?? Date.now()),
        ),
      ])
    } catch {
      /* offline / transient — local stays authoritative until next sync */
    } finally {
      syncInFlight.current = false
      setSyncing(false)
    }
  }, [])

  // Sync on sign-in.
  useEffect(() => {
    if (userId) void syncNow()
  }, [userId, syncNow])

  // Re-pull when the tab regains focus (e.g. phone ↔ projected screen).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void syncNow()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [syncNow])

  // --- reads / derived -----------------------------------------------------
  const getCard = useCallback((n: number) => srs[n], [srs])
  const status = useCallback((n: number) => statusFromCard(srs[n]), [srs])
  const getNote = useCallback((n: number) => notes[n] ?? '', [notes])

  const dueCount = useCallback(
    (numbers: number[]) => {
      const now = Date.now()
      return numbers.filter((n) => isDue(srs[n], now)).length
    },
    [srs],
  )

  const { memorizedCount, learningCount } = useMemo(() => {
    let memorized = 0
    let learning = 0
    for (const card of Object.values(srs)) {
      const s = statusFromCard(card)
      if (s === 'memorized') memorized++
      else if (s === 'learning') learning++
    }
    return { memorizedCount: memorized, learningCount: learning }
  }, [srs])

  const resetAll = useCallback(() => {
    for (const key of [
      STORAGE_KEYS.srs,
      STORAGE_KEYS.notes,
      STORAGE_KEYS.srsTimes,
      STORAGE_KEYS.noteTimes,
    ]) {
      saveJSON(key, {})
    }
    setSrs({})
    setNotes({})
    setSrsTimes({})
    setNoteTimes({})
    if (userIdRef.current) void clearRemote(userIdRef.current)
  }, [])

  const value = useMemo(
    () => ({
      getCard,
      reviewCard,
      status,
      setStatus,
      getNote,
      setNote,
      dueCount,
      memorizedCount,
      learningCount,
      resetAll,
      cloud: { active: Boolean(userId), syncing },
    }),
    [
      getCard,
      reviewCard,
      status,
      setStatus,
      getNote,
      setNote,
      dueCount,
      memorizedCount,
      learningCount,
      resetAll,
      userId,
      syncing,
    ],
  )

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error('useStudy must be used within StudyProvider')
  return ctx
}
