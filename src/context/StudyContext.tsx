import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

type SrsMap = Record<number, CardState>
type NotesMap = Record<number, string>

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
}

const StudyContext = createContext<StudyContextValue | null>(null)

// TODO (fase 3): SINCRONIZAÇÃO EM GRUPO. Hoje progresso (srs) e anotações (notes)
// são locais ao dispositivo (localStorage). Para compartilhar entre a turma,
// plugar um back-end leve (ex.: Supabase): manter o estado local como cache e
// espelhar leituras/escritas com o usuário autenticado.
export function StudyProvider({ children }: { children: ReactNode }) {
  const [srs, setSrs] = useState<SrsMap>(() => loadJSON<SrsMap>(STORAGE_KEYS.srs, {}))
  const [notes, setNotes] = useState<NotesMap>(() =>
    loadJSON<NotesMap>(STORAGE_KEYS.notes, {}),
  )

  const persistSrs = useCallback((next: SrsMap) => {
    saveJSON(STORAGE_KEYS.srs, next)
    return next
  }, [])

  const getCard = useCallback((n: number) => srs[n], [srs])

  const reviewCard = useCallback(
    (n: number, grade: SrsGrade) => {
      setSrs((prev) => persistSrs({ ...prev, [n]: review(prev[n], grade, Date.now()) }))
    },
    [persistSrs],
  )

  const setStatus = useCallback(
    (n: number, status: MemoStatus) => {
      setSrs((prev) => {
        const now = Date.now()
        const base = prev[n] ?? initCard(now)
        let card: CardState
        if (status === 'memorized') {
          card = { box: MAX_BOX, due: now + 35 * 86_400_000, last: now, reps: Math.max(base.reps, 1) }
        } else if (status === 'learning') {
          card = { box: Math.max(1, Math.min(base.box, MAX_BOX - 1)), due: now + 86_400_000, last: now, reps: Math.max(base.reps, 1) }
        } else {
          card = initCard(now)
        }
        return persistSrs({ ...prev, [n]: card })
      })
    },
    [persistSrs],
  )

  const status = useCallback((n: number) => statusFromCard(srs[n]), [srs])

  const getNote = useCallback((n: number) => notes[n] ?? '', [notes])

  const setNote = useCallback((n: number, text: string) => {
    setNotes((prev) => {
      const next = { ...prev }
      if (text.trim()) next[n] = text
      else delete next[n]
      saveJSON(STORAGE_KEYS.notes, next)
      return next
    })
  }, [])

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
    setSrs(persistSrs({}))
    setNotes(() => {
      saveJSON(STORAGE_KEYS.notes, {})
      return {}
    })
  }, [persistSrs])

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
    }),
    [getCard, reviewCard, status, setStatus, getNote, setNote, dueCount, memorizedCount, learningCount, resetAll],
  )

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error('useStudy must be used within StudyProvider')
  return ctx
}
