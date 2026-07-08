import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { relatedHadiths, localizeRelated, connectionNumbers } from '../data'
import { Glass } from '../components/glass/Glass'
import { ArabicText, TranslitText, TranslationText, Ornament } from '../components/hadith/content'

export function Related() {
  const { lang, t } = useLang()

  return (
    <div className="space-y-4">
      <Glass className="fade-in p-5">
        <h1 className="hadith-title text-xl">{t('relatedTitle')}</h1>
        <p className="prose-content mt-1.5 text-[0.92rem]">{t('relatedIntro')}</p>
      </Glass>

      <div className="space-y-4">
        {relatedHadiths.map((r, i) => {
          const rl = localizeRelated(r, lang)
          const links = connectionNumbers(r)
          return (
            <Glass
              key={r.id}
              strong
              className="fade-in p-5"
              style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="hadith-title flex-1 text-lg">{rl.title}</h2>
                <span className="chip chip--gold">{rl.grade}</span>
              </div>

              <ArabicText text={r.arabic} />
              <Ornament className="my-3.5" />
              <TranslitText text={r.transliteration} />
              <TranslationText text={rl.translation} className="mt-2.5" />

              <div className="mt-4 flex flex-wrap gap-1.5">
                {rl.sources.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>

              <div
                className="mt-4 rounded-2xl p-3.5"
                style={{ background: 'var(--gold-soft)' }}
              >
                <div className="eyebrow mb-1" style={{ color: 'var(--gold)' }}>
                  {t('relatedConnection')}
                </div>
                <p className="prose-content text-[0.9rem]" style={{ color: 'var(--fg)' }}>
                  {rl.connection}
                </p>
                {links.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {links.map((n) => (
                      <Link
                        key={n}
                        to={`/hadith/${n}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold"
                        style={{ color: 'var(--accent)' }}
                      >
                        {t('relatedSeeHadith', { n })}
                        <ArrowRight size={14} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Glass>
          )
        })}
      </div>
    </div>
  )
}
