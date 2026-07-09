import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthResult {
  error: string | null
  needsConfirmation?: boolean
}

interface AuthContextValue {
  configured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
      if (!supabase) return { error: 'offline' }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: displayName ? { data: { display_name: displayName } } : undefined,
      })
      if (error) return { error: error.message }
      // With email confirmation enabled, there is no session until confirmed.
      return { error: null, needsConfirmation: !data.session }
    },
    [],
  )

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { error: 'offline' }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error ? error.message : null }
    },
    [],
  )

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      signUp,
      signIn,
      signOut,
    }),
    [loading, session, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
