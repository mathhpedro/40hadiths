import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  fetchSessions,
  fetchAttendance,
  createSession,
  deleteSession,
  setAttendance,
  type ClassSession,
  type AttendanceRow,
  type AttendanceStatus,
  type NewSession,
} from '../lib/classes'

interface ClassesContextValue {
  configured: boolean
  signedIn: boolean
  userId: string | null
  loading: boolean
  sessions: ClassSession[]
  attendance: AttendanceRow[]
  refresh: () => Promise<void>
  addSession: (input: NewSession) => Promise<{ error: string | null }>
  removeSession: (id: string) => Promise<void>
  confirm: (sessionId: string, status: AttendanceStatus) => Promise<void>
  myStatus: (sessionId: string) => AttendanceStatus | null
  attendeesFor: (sessionId: string) => AttendanceRow[]
}

const ClassesContext = createContext<ClassesContextValue | null>(null)

export function ClassesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    null

  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [attendance, setAttendance_] = useState<AttendanceRow[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!userId) {
      setSessions([])
      setAttendance_([])
      return
    }
    setLoading(true)
    try {
      const [s, a] = await Promise.all([fetchSessions(), fetchAttendance()])
      setSessions(s)
      setAttendance_(a)
    } catch {
      /* offline / transient */
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Re-pull when the tab regains focus (someone may have added a class).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && userId) void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh, userId])

  const addSession = useCallback(
    async (input: NewSession) => {
      if (!userId) return { error: 'offline' }
      const res = await createSession(userId, input)
      if (!res.error) await refresh()
      return res
    },
    [userId, refresh],
  )

  const removeSession = useCallback(
    async (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id))
      await deleteSession(id)
      await refresh()
    },
    [refresh],
  )

  const confirm = useCallback(
    async (sessionId: string, status: AttendanceStatus) => {
      if (!userId) return
      // Optimistic update so the tap feels instant.
      setAttendance_((prev) => {
        const others = prev.filter(
          (a) => !(a.session_id === sessionId && a.user_id === userId),
        )
        return [
          ...others,
          {
            session_id: sessionId,
            user_id: userId,
            status,
            display_name: displayName,
            updated_at: new Date().toISOString(),
          },
        ]
      })
      await setAttendance(sessionId, userId, status, displayName)
    },
    [userId, displayName],
  )

  const myStatus = useCallback(
    (sessionId: string): AttendanceStatus | null =>
      attendance.find((a) => a.session_id === sessionId && a.user_id === userId)?.status ??
      null,
    [attendance, userId],
  )

  const attendeesFor = useCallback(
    (sessionId: string) =>
      attendance.filter((a) => a.session_id === sessionId && a.status !== 'declined'),
    [attendance],
  )

  const value = useMemo(
    () => ({
      configured: isSupabaseConfigured,
      signedIn: Boolean(userId),
      userId,
      loading,
      sessions,
      attendance,
      refresh,
      addSession,
      removeSession,
      confirm,
      myStatus,
      attendeesFor,
    }),
    [userId, loading, sessions, attendance, refresh, addSession, removeSession, confirm, myStatus, attendeesFor],
  )

  return <ClassesContext.Provider value={value}>{children}</ClassesContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useClasses(): ClassesContextValue {
  const ctx = useContext(ClassesContext)
  if (!ctx) throw new Error('useClasses must be used within ClassesProvider')
  return ctx
}
