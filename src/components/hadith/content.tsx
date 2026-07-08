import { cn } from '../../lib/cn'

/** Arabic scripture text — always RTL, in the calligraphic font. */
export function ArabicText({
  text,
  large,
  className,
}: {
  text: string
  large?: boolean
  className?: string
}) {
  return (
    <p lang="ar" dir="rtl" className={cn('arabic', large && 'arabic--lg', className)}>
      {text}
    </p>
  )
}

export function TranslitText({ text, className }: { text: string; className?: string }) {
  return (
    <p dir="ltr" className={cn('translit', className)}>
      {text}
    </p>
  )
}

export function TranslationText({ text, className }: { text: string; className?: string }) {
  return <p className={cn('translation', className)}>{text}</p>
}

/** Manuscript-style divider with a centred gold diamond. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn('ornament', className)} aria-hidden="true">
      <span style={{ fontSize: '0.7rem', letterSpacing: '0.3em' }}>◆</span>
    </div>
  )
}

/** Bismillah flourish for headers. */
export function Bismillah({ className }: { className?: string }) {
  return (
    <p
      lang="ar"
      dir="rtl"
      className={cn('arabic text-center', className)}
      style={{ fontSize: 'calc(1.4rem * var(--font-scale))', color: 'var(--gold)' }}
    >
      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    </p>
  )
}
