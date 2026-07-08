import { CheckCircle2, CircleDashed, Sparkle } from 'lucide-react'
import type { MemoStatus } from '../../lib/srs'
import { useLang } from '../../context/LanguageContext'
import { cn } from '../../lib/cn'

const CONFIG: Record<
  MemoStatus,
  { icon: typeof CheckCircle2; label: 'detailStatusNew' | 'detailStatusLearning' | 'detailStatusMemorized'; chip?: string }
> = {
  new: { icon: CircleDashed, label: 'detailStatusNew' },
  learning: { icon: Sparkle, label: 'detailStatusLearning', chip: 'chip--gold' },
  memorized: { icon: CheckCircle2, label: 'detailStatusMemorized', chip: 'chip--active' },
}

export function StatusBadge({ status, className }: { status: MemoStatus; className?: string }) {
  const { t } = useLang()
  const { icon: Icon, label, chip } = CONFIG[status]
  return (
    <span className={cn('chip', chip, className)}>
      <Icon size={13} />
      {t(label)}
    </span>
  )
}

/** Compact coloured dot (for dense list rows). */
export function StatusDot({ status }: { status: MemoStatus }) {
  const color =
    status === 'memorized'
      ? 'var(--accent)'
      : status === 'learning'
        ? 'var(--gold)'
        : 'var(--fg-subtle)'
  return (
    <span
      aria-hidden="true"
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        background: color,
        opacity: status === 'new' ? 0.4 : 1,
        flex: 'none',
      }}
    />
  )
}
