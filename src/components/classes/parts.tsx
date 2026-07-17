import { Check, HelpCircle, X } from 'lucide-react'
import { useLang } from '../../context/LanguageContext'
import type { Lang } from '../../types'
import type { StringKey } from '../../i18n/strings'
import type { AttendanceRow, AttendanceStatus } from '../../lib/classes'

export function formatWhen(iso: string, lang: Lang): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

const OPTIONS: { key: AttendanceStatus; label: StringKey; color: string; Icon: typeof Check }[] = [
  { key: 'going', label: 'classGoing', color: 'var(--accent)', Icon: Check },
  { key: 'maybe', label: 'classMaybe', color: 'var(--gold)', Icon: HelpCircle },
  { key: 'declined', label: 'classDeclined', color: 'var(--fg-muted)', Icon: X },
]

export function ConfirmButtons({
  status,
  onPick,
}: {
  status: AttendanceStatus | null
  onPick: (s: AttendanceStatus) => void
}) {
  const { t } = useLang()
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ key, label, color, Icon }) => {
        const active = status === key
        return (
          <button
            key={key}
            onClick={() => onPick(key)}
            aria-pressed={active}
            className="btn flex-col gap-1 py-2.5"
            style={
              active
                ? {
                    borderColor: color,
                    color,
                    background: `color-mix(in srgb, ${color} 15%, transparent)`,
                  }
                : undefined
            }
          >
            <Icon size={17} />
            <span className="text-xs font-semibold">{t(label)}</span>
          </button>
        )
      })}
    </div>
  )
}

export function AttendanceSummary({ rows }: { rows: AttendanceRow[] }) {
  const { t } = useLang()
  if (rows.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--fg-subtle)' }}>
        {t('classNobody')}
      </p>
    )
  }
  const going = rows.filter((r) => r.status === 'going')
  const names = [...going, ...rows.filter((r) => r.status === 'maybe')].map(
    (r) => r.display_name || '—',
  )
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="chip chip--active">{t('classConfirmedN', { n: going.length })}</span>
      <span className="text-sm" style={{ color: 'var(--fg-subtle)' }}>
        {names.join(' · ')}
      </span>
    </div>
  )
}
