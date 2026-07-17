import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Trash2, CalendarDays, BookOpen } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { useClasses } from '../context/ClassesContext'
import { hadiths, meta } from '../data'
import { parseHadithNumbers, type ClassSession } from '../lib/classes'
import { cn } from '../lib/cn'
import { Glass } from '../components/glass/Glass'
import { ConfirmButtons, AttendanceSummary, formatWhen } from '../components/classes/parts'

const GRACE_MS = 3 * 60 * 60 * 1000 // keep a class "current" for 3h after start

export function Classes() {
  const { t } = useLang()
  const { signedIn, loading, sessions } = useClasses()
  const [showForm, setShowForm] = useState(false)

  if (!signedIn) return <SignInPrompt />

  const now = Date.now()
  const upcoming = sessions.filter((s) => new Date(s.scheduled_at).getTime() >= now - GRACE_MS)
  const past = sessions
    .filter((s) => new Date(s.scheduled_at).getTime() < now - GRACE_MS)
    .reverse()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="min-w-0">
          <h1 className="hadith-title text-xl">{t('classesTitle')}</h1>
          <p className="text-sm" style={{ color: 'var(--fg-subtle)' }}>
            {t('classesSubtitle')}
          </p>
        </div>
        <button
          className={cn('btn ml-auto', !showForm && 'btn--primary')}
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus size={17} />
          {showForm ? t('classCancelForm') : t('classesNew')}
        </button>
      </div>

      {showForm && <NewClassForm onDone={() => setShowForm(false)} />}

      {!loading && sessions.length === 0 && !showForm && (
        <Glass className="px-6 py-12 text-center">
          <CalendarDays size={30} className="mx-auto" style={{ color: 'var(--fg-subtle)' }} />
          <p className="mt-3 font-semibold">{t('classesEmpty')}</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--fg-subtle)' }}>
            {t('classesEmptyHint')}
          </p>
        </Glass>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="eyebrow px-1">{t('classesUpcoming')}</h2>
          {upcoming.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="eyebrow px-1">{t('classesPast')}</h2>
          {past.map((s) => (
            <SessionCard key={s.id} session={s} past />
          ))}
        </section>
      )}
    </div>
  )
}

function SignInPrompt() {
  const { t } = useLang()
  return (
    <Glass className="mt-6 px-6 py-14 text-center">
      <CalendarDays size={32} className="mx-auto" style={{ color: 'var(--accent)' }} />
      <p className="mt-4 font-semibold">{t('classesTitle')}</p>
      <p className="mx-auto mt-1 max-w-xs text-sm" style={{ color: 'var(--fg-muted)' }}>
        {t('classesSignIn')}
      </p>
      <Link to="/settings" className="btn btn--primary mt-5">
        {t('classesGoToAccount')}
      </Link>
    </Glass>
  )
}

function SessionCard({ session, past }: { session: ClassSession; past?: boolean }) {
  const { lang, t } = useLang()
  const { confirm, myStatus, attendeesFor, removeSession, userId } = useClasses()
  const status = myStatus(session.id)
  const rows = attendeesFor(session.id)
  const isOwner = session.created_by === userId

  return (
    <Glass className={cn('space-y-3.5 p-5', past && 'opacity-75')}>
      <div className="flex items-start gap-3">
        <div
          className="flex flex-col items-center rounded-2xl px-3 py-2 text-center"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)', minWidth: '3.4rem' }}
        >
          <CalendarDays size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
            {formatWhen(session.scheduled_at, lang)}
          </div>
          <h3 className="hadith-title text-lg leading-tight">{session.title}</h3>
          {session.location && (
            <div
              className="mt-1 flex items-center gap-1 text-sm"
              style={{ color: 'var(--fg-subtle)' }}
            >
              <MapPin size={13} />
              {session.location}
            </div>
          )}
        </div>
        {isOwner && (
          <button
            className="btn btn--ghost btn--icon"
            aria-label={t('classDelete')}
            onClick={() => {
              if (window.confirm(t('classDeleteConfirm'))) void removeSession(session.id)
            }}
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>

      {session.hadith_numbers.length > 0 && (
        <div>
          <div className="eyebrow mb-1.5 flex items-center gap-1.5">
            <BookOpen size={12} />
            {t('classHadithsLabel')}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {session.hadith_numbers.map((n) => (
              <Link key={n} to={`/hadith/${n}`} className="chip chip--gold">
                {n}
              </Link>
            ))}
          </div>
        </div>
      )}

      {session.notes && <p className="prose-content text-[0.92rem]">{session.notes}</p>}

      <AttendanceSummary rows={rows} />

      {!past && <ConfirmButtons status={status} onPick={(s) => void confirm(session.id, s)} />}
    </Glass>
  )
}

function NewClassForm({ onDone }: { onDone: () => void }) {
  const { t } = useLang()
  const { addSession } = useClasses()
  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('')
  const [hadithStr, setHadithStr] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputClass = 'w-full rounded-xl px-3 py-2.5 text-[0.95rem] outline-none'
  const inputStyle = {
    background: 'var(--chip-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--fg)',
  } as const

  const save = async () => {
    if (!title.trim() || !when) {
      setError(t('authNeedFields'))
      return
    }
    setSaving(true)
    setError(null)
    const res = await addSession({
      title: title.trim(),
      scheduled_at: new Date(when).toISOString(),
      hadith_numbers: parseHadithNumbers(hadithStr, hadiths.length),
      location: location.trim() || null,
      notes: notes.trim() || null,
    })
    setSaving(false)
    if (res.error) setError(res.error)
    else onDone()
  }

  return (
    <Glass strong className="fade-in space-y-3 p-5">
      <input
        className={inputClass}
        style={inputStyle}
        placeholder={t('classFormTitle')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label={t('classFormTitle')}
      />
      <div>
        <label className="eyebrow mb-1 block">{t('classFormWhen')}</label>
        <input
          type="datetime-local"
          className={inputClass}
          style={inputStyle}
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          aria-label={t('classFormWhen')}
        />
      </div>
      <input
        className={inputClass}
        style={inputStyle}
        placeholder={t('classFormHadiths')}
        inputMode="numeric"
        value={hadithStr}
        onChange={(e) => setHadithStr(e.target.value)}
        aria-label={t('classFormHadiths')}
      />
      <input
        className={inputClass}
        style={inputStyle}
        placeholder={t('classFormLocation')}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        aria-label={t('classFormLocation')}
      />
      <textarea
        className={cn(inputClass, 'resize-y')}
        style={inputStyle}
        placeholder={t('classFormNotes')}
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        aria-label={t('classFormNotes')}
      />
      {error && (
        <p className="text-sm" style={{ color: '#f87171' }}>
          {error}
        </p>
      )}
      <div className="flex gap-2.5">
        <button className="btn btn--primary flex-1" disabled={saving} onClick={() => void save()}>
          {saving ? t('classFormSaving') : t('classFormSave')}
        </button>
        <button className="btn" disabled={saving} onClick={onDone}>
          {t('classCancelForm')}
        </button>
      </div>
      <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
        {meta.total_hadiths} hadiths · 1–{hadiths.length}
      </p>
    </Glass>
  )
}
