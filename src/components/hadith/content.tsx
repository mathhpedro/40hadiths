import { cn } from '../../lib/cn'
import { useLang } from '../../context/LanguageContext'

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

/**
 * Both translations stacked and labelled, primary (current UI language) first.
 * For a PT-default Brazilian class this shows Português first, then English.
 * `big` uses projector-sized type for the presentation screen.
 */
export function TranslationStack({
  pt,
  en,
  big,
  className,
}: {
  pt: string
  en: string
  big?: boolean
  className?: string
}) {
  const { lang, t } = useLang()
  const items =
    lang === 'pt'
      ? [
          { code: 'pt', label: t('setLangPt'), text: pt },
          { code: 'en', label: t('setLangEn'), text: en },
        ]
      : [
          { code: 'en', label: t('setLangEn'), text: en },
          { code: 'pt', label: t('setLangPt'), text: pt },
        ]
  return (
    <div className={cn(big ? 'space-y-5' : 'space-y-4', className)}>
      {items.map((it, i) => (
        <div key={it.code} className={big ? 'text-center' : undefined}>
          <div
            className={cn('eyebrow mb-1', big && 'flex justify-center')}
            style={i > 0 ? { opacity: 0.7 } : undefined}
          >
            {it.label}
          </div>
          {big ? (
            <p
              className="mx-auto max-w-4xl"
              style={{
                fontSize:
                  i === 0 ? 'clamp(1.1rem, 2.6vw, 2.2rem)' : 'clamp(1rem, 2.1vw, 1.7rem)',
                lineHeight: 1.6,
                color: i === 0 ? 'var(--fg)' : 'var(--fg-muted)',
              }}
            >
              {it.text}
            </p>
          ) : (
            <p className="translation" style={i > 0 ? { color: 'var(--fg-muted)' } : undefined}>
              {it.text}
            </p>
          )}
        </div>
      ))}
    </div>
  )
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
