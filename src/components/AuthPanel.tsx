import { useState } from 'react'
import { Cloud, LogOut, RefreshCw, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStudy } from '../context/StudyContext'
import { useLang } from '../context/LanguageContext'

const inputClass = 'w-full rounded-xl px-3 py-2.5 text-[0.95rem] outline-none'
const inputStyle = {
  background: 'var(--chip-bg)',
  border: '1px solid var(--glass-border)',
  color: 'var(--fg)',
} as const

/** Sign-in / sign-up form + signed-in status, for the Settings "Account" section. */
export function AuthPanel() {
  const { t } = useLang()
  const { user, signIn, signUp, signOut } = useAuth()
  const { cloud } = useStudy()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null)

  if (user) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <Cloud size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
              {t('authSignedInAs')}
            </div>
            <div className="truncate text-sm font-medium">{user.email}</div>
          </div>
          <span
            className="ml-auto inline-flex items-center gap-1.5 text-xs"
            style={{ color: cloud.syncing ? 'var(--gold)' : 'var(--accent)' }}
          >
            {cloud.syncing ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            {cloud.syncing ? t('authSyncing') : t('authSynced')}
          </span>
        </div>
        <button className="btn w-full" onClick={() => void signOut()}>
          <LogOut size={16} />
          {t('authSignOut')}
        </button>
      </div>
    )
  }

  const submit = async (mode: 'in' | 'up') => {
    if (!email.trim() || !password) {
      setMessage({ kind: 'error', text: t('authNeedFields') })
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      const res =
        mode === 'in'
          ? await signIn(email.trim(), password)
          : await signUp(email.trim(), password, name.trim() || undefined)
      if (res.error) {
        setMessage({ kind: 'error', text: res.error })
      } else if (res.needsConfirmation) {
        setMessage({ kind: 'info', text: t('authConfirmEmail') })
      }
      // On success the auth listener flips this component to the signed-in view.
    } catch {
      setMessage({ kind: 'error', text: t('authError') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
        {t('syncDesc')}
      </p>
      <input
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder={t('authEmail')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
        style={inputStyle}
        aria-label={t('authEmail')}
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder={t('authPassword')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClass}
        style={inputStyle}
        aria-label={t('authPassword')}
      />
      <input
        type="text"
        autoComplete="name"
        placeholder={t('authName')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClass}
        style={inputStyle}
        aria-label={t('authName')}
      />
      {message && (
        <p
          className="text-sm"
          style={{ color: message.kind === 'error' ? '#f87171' : 'var(--accent)' }}
        >
          {message.text}
        </p>
      )}
      <div className="flex gap-2.5">
        <button className="btn btn--primary flex-1" disabled={busy} onClick={() => void submit('in')}>
          {t('authSignIn')}
        </button>
        <button className="btn flex-1" disabled={busy} onClick={() => void submit('up')}>
          {t('authSignUp')}
        </button>
      </div>
    </div>
  )
}
