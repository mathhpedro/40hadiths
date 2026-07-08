import { useMemo, useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import {
  hadiths,
  themeIndex,
  sourceIndex,
  themeIdsOf,
  hadithMatches,
} from '../data'
import { foldText } from '../lib/text'
import { cn } from '../lib/cn'
import { HadithCard } from '../components/hadith/HadithCard'
import { Glass } from '../components/glass/Glass'

export function HadithList() {
  const { lang, t } = useLang()
  const [query, setQuery] = useState('')
  const [themeId, setThemeId] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [showSources, setShowSources] = useState(false)

  const results = useMemo(() => {
    const folded = foldText(query)
    return hadiths.filter(
      (h) =>
        hadithMatches(h, folded) &&
        (!themeId || themeIdsOf(h).includes(themeId)) &&
        (!source || h.sources.includes(source)),
    )
  }, [query, themeId, source])

  const hasFilters = Boolean(query || themeId || source)
  const clearAll = () => {
    setQuery('')
    setThemeId(null)
    setSource(null)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Glass className="flex items-center gap-2 px-3.5 py-2.5">
        <Search size={18} style={{ color: 'var(--fg-subtle)' }} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('listSearch')}
          aria-label={t('listSearch')}
          className="min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:opacity-60"
          style={{ color: 'var(--fg)' }}
        />
        <button
          type="button"
          onClick={() => setShowSources((s) => !s)}
          aria-pressed={showSources}
          aria-label={t('listFilterSource')}
          className={cn('btn btn--ghost btn--icon', (showSources || source) && 'chip--active')}
          style={source ? { color: 'var(--accent)' } : undefined}
        >
          <SlidersHorizontal size={18} />
        </button>
      </Glass>

      {/* Theme chips */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          className={cn('chip whitespace-nowrap', !themeId && 'chip--active')}
          onClick={() => setThemeId(null)}
        >
          {t('listAllThemes')}
        </button>
        {themeIndex.map((th) => (
          <button
            key={th.id}
            className={cn('chip whitespace-nowrap', themeId === th.id && 'chip--active')}
            onClick={() => setThemeId((cur) => (cur === th.id ? null : th.id))}
          >
            {lang === 'pt' ? th.pt : th.en}
            <span style={{ opacity: 0.6 }}>{th.count}</span>
          </button>
        ))}
      </div>

      {/* Source filter (collapsible) */}
      {showSources && (
        <Glass className="fade-in flex flex-wrap gap-2 p-3">
          <button
            className={cn('chip', !source && 'chip--active')}
            onClick={() => setSource(null)}
          >
            {t('listAllSources')}
          </button>
          {sourceIndex.map((s) => (
            <button
              key={s.name}
              className={cn('chip', source === s.name && 'chip--active')}
              onClick={() => setSource((cur) => (cur === s.name ? null : s.name))}
            >
              {s.name}
              <span style={{ opacity: 0.6 }}>{s.count}</span>
            </button>
          ))}
        </Glass>
      )}

      {/* Result count + clear */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm" style={{ color: 'var(--fg-subtle)' }}>
          {t('listResults', { n: results.length, total: hadiths.length })}
        </span>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            <X size={14} />
            {t('listClear')}
          </button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((h, i) => (
            <HadithCard key={h.number} hadith={h} index={i} />
          ))}
        </div>
      ) : (
        <Glass className="px-6 py-12 text-center">
          <p className="font-semibold">{t('listNoResults')}</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--fg-subtle)' }}>
            {t('listNoResultsHint')}
          </p>
        </Glass>
      )}
    </div>
  )
}
