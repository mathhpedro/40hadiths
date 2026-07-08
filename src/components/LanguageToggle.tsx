import { useLang } from '../context/LanguageContext'
import { cn } from '../lib/cn'

/** Segmented PT / EN switch. */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang()
  return (
    <div
      className={cn('inline-flex items-center gap-1 rounded-full p-1', className)}
      role="group"
      aria-label="Language / Idioma"
    >
      {(['pt', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn('chip', lang === l && 'chip--active')}
          style={{ minWidth: '2.6rem', justifyContent: 'center' }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
