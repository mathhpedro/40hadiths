import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Hadith } from '../../types'
import { useLang } from '../../context/LanguageContext'
import { useStudy } from '../../context/StudyContext'
import { localizeHadith } from '../../data'
import { Glass } from '../glass/Glass'
import { StatusDot } from './StatusBadge'

export function HadithCard({ hadith, index = 0 }: { hadith: Hadith; index?: number }) {
  const { lang, t } = useLang()
  const { status } = useStudy()
  const h = localizeHadith(hadith, lang)
  const st = status(hadith.number)

  return (
    <Link
      to={`/hadith/${hadith.number}`}
      className="block fade-in"
      style={{ animationDelay: `${Math.min(index, 12) * 24}ms` }}
    >
      <Glass interactive className="flex items-stretch gap-3.5 p-4">
        <div className="flex flex-col items-center justify-center pr-1" style={{ minWidth: '2.4rem' }}>
          <span className="hadith-numeral" style={{ fontSize: '1.85rem' }}>
            {hadith.number}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="eyebrow">{t('detailHadithN', { n: hadith.number })}</span>
            <StatusDot status={st} />
          </div>
          <h3 className="hadith-title line-clamp-2 text-[1.05rem]">{h.title}</h3>
          <p
            lang="ar"
            dir="rtl"
            className="arabic mt-1.5 line-clamp-1"
            style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--fg-subtle)' }}
          >
            {hadith.arabic}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {h.themes.slice(0, 2).map((theme) => (
              <span key={theme} className="chip">
                {theme}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center" style={{ color: 'var(--fg-subtle)' }}>
          <ChevronRight size={20} />
        </div>
      </Glass>
    </Link>
  )
}
