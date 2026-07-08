import { useState, type ReactNode } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Layers,
  MonitorPlay,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { useSettings } from '../context/SettingsContext'
import { useStudy } from '../context/StudyContext'
import {
  getHadith,
  hadiths,
  relatedHadiths,
  localizeHadith,
  localizeRelated,
  connectionNumbers,
} from '../data'
import type { Hadith } from '../types'
import type { MemoStatus } from '../lib/srs'
import { cn } from '../lib/cn'
import { Glass } from '../components/glass/Glass'
import { StatusBadge } from '../components/hadith/StatusBadge'
import { ArabicText, TranslitText, TranslationText, Ornament } from '../components/hadith/content'
import { NotFound } from './NotFound'

export function HadithDetail() {
  const { number } = useParams()
  const n = Number(number)
  const hadith = getHadith(n)
  if (!hadith) return <NotFound />
  // key remounts per hadith → local toggles + note reinitialise cleanly.
  return <DetailBody key={n} hadith={hadith} />
}

type Tab = 'about' | 'teachings' | 'themes'

function DetailBody({ hadith }: { hadith: Hadith }) {
  const { lang, t } = useLang()
  const { settings } = useSettings()
  const study = useStudy()
  const h = localizeHadith(hadith, lang)

  const [showTranslit, setShowTranslit] = useState(settings.showTransliteration)
  const [showTranslation, setShowTranslation] = useState(settings.showTranslation)
  const [tab, setTab] = useState<Tab>('about')
  const [note, setNote] = useState(() => study.getNote(hadith.number))

  const status = study.status(hadith.number)
  const prev = hadith.number > 1 ? hadith.number - 1 : null
  const next = hadith.number < hadiths.length ? hadith.number + 1 : null
  const related = relatedHadiths.filter((r) => connectionNumbers(r).includes(hadith.number))

  const onNote = (value: string) => {
    setNote(value)
    study.setNote(hadith.number, value)
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <header className="fade-in px-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="hadith-numeral" style={{ fontSize: '1.6rem' }}>
            {hadith.number}
          </span>
          <span className="eyebrow">{t('detailHadithN', { n: hadith.number })}</span>
          <StatusBadge status={status} className="ml-auto" />
        </div>
        <h1 className="hadith-title text-2xl">{h.title}</h1>
      </header>

      {/* Reading panel */}
      <Glass strong className="fade-in p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <ToggleChip
            active={showTranslit}
            onClick={() => setShowTranslit((v) => !v)}
            label={showTranslit ? t('detailHideTranslit') : t('detailShowTranslit')}
          />
          <ToggleChip
            active={showTranslation}
            onClick={() => setShowTranslation((v) => !v)}
            label={showTranslation ? t('detailHideTranslation') : t('detailShowTranslation')}
          />
        </div>

        <ArabicText text={hadith.arabic} large />

        {showTranslit && (
          <>
            <Ornament className="my-4" />
            <TranslitText text={hadith.transliteration} />
          </>
        )}
        {showTranslation && (
          <>
            <Ornament className="my-4" />
            <TranslationText text={h.translation} />
          </>
        )}
      </Glass>

      {/* Actions */}
      {/* TODO (fase 3): botão + player de ÁUDIO DE RECITAÇÃO por hadith aqui.
          O JSON ganharia um campo `audio` (URL/arquivo) por hadith e este bloco
          renderizaria um <audio> controlado. */}
      <div className="fade-in flex flex-wrap gap-2">
        <Link to="/memorize" className="btn">
          <Layers size={17} />
          {t('detailFlashcard')}
        </Link>
        <Link to={`/present/${hadith.number}`} className="btn">
          <MonitorPlay size={17} />
          {t('detailPresent')}
        </Link>
      </div>

      {/* Status selector */}
      <StatusSelector
        value={status}
        onChange={(s) => study.setStatus(hadith.number, s)}
      />

      {/* Section tabs */}
      <div className="fade-in">
        <div className="mb-3 flex gap-1.5">
          <TabButton active={tab === 'about'} onClick={() => setTab('about')}>
            {t('detailAbout')}
          </TabButton>
          <TabButton active={tab === 'teachings'} onClick={() => setTab('teachings')}>
            {t('detailTeachings')}
          </TabButton>
          <TabButton active={tab === 'themes'} onClick={() => setTab('themes')}>
            {t('detailThemes')}
          </TabButton>
        </div>

        <Glass className="p-5">
          {tab === 'about' && (
            <dl className="space-y-3.5">
              <Row label={t('detailNarrator')}>{h.narrator}</Row>
              <Row label={t('detailGrade')}>
                <span className="chip chip--gold">{h.grade}</span>
              </Row>
              <Row label={t('detailSources')}>
                <span className="flex flex-wrap gap-1.5">
                  {h.sources.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </span>
              </Row>
              <div>
                <dt className="eyebrow mb-1">{t('detailChain')}</dt>
                <dd className="prose-content">{h.chainNote}</dd>
              </div>
            </dl>
          )}

          {tab === 'teachings' && (
            <ul className="space-y-3">
              {h.teachings.map((teaching, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 shrink-0"
                    style={{ color: 'var(--gold)', fontSize: '0.6rem' }}
                  >
                    ◆
                  </span>
                  <span className="prose-content" style={{ color: 'var(--fg)' }}>
                    {teaching}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {tab === 'themes' && (
            <div className="flex flex-wrap gap-2">
              {h.themes.map((theme) => (
                <span key={theme} className="chip">
                  {theme}
                </span>
              ))}
            </div>
          )}
        </Glass>
      </div>

      {/* Notes */}
      <div className="fade-in">
        <h2 className="eyebrow mb-2 px-1">{t('detailNotes')}</h2>
        <Glass className="p-4">
          <textarea
            value={note}
            onChange={(e) => onNote(e.target.value)}
            placeholder={t('detailNotesPlaceholder')}
            rows={3}
            className="w-full resize-y bg-transparent text-[0.95rem] leading-relaxed outline-none placeholder:opacity-60"
            style={{ color: 'var(--fg)' }}
          />
          {note.trim() && (
            <p className="mt-1 text-xs" style={{ color: 'var(--fg-subtle)' }}>
              {t('detailNotesSaved')}
            </p>
          )}
        </Glass>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="fade-in">
          <div className="mb-2 flex items-center gap-2 px-1">
            <Sparkles size={15} style={{ color: 'var(--gold)' }} />
            <h2 className="eyebrow">{t('detailRelated')}</h2>
          </div>
          <div className="space-y-3">
            {related.map((r) => {
              const rl = localizeRelated(r, lang)
              return (
                <Glass key={r.id} className="p-4">
                  <h3 className="font-semibold">{rl.title}</h3>
                  <ArabicText
                    text={r.arabic}
                    className="mt-1.5 line-clamp-2"
                  />
                  <p className="prose-content mt-2 text-[0.9rem]">{rl.connection}</p>
                </Glass>
              )
            })}
          </div>
        </div>
      )}

      {/* Prev / Next */}
      <nav className="fade-in flex gap-3 pt-1">
        <NavCard dir="prev" number={prev} />
        <NavCard dir="next" number={next} />
      </nav>
    </div>
  )
}

function ToggleChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button className={cn('chip', active && 'chip--active')} onClick={onClick} aria-pressed={active}>
      {active ? <Eye size={14} /> : <EyeOff size={14} />}
      {label}
    </button>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn('chip', active && 'chip--active')}
      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
    >
      {children}
    </button>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="eyebrow shrink-0 pt-0.5 sm:w-28">{label}</dt>
      <dd className="prose-content flex-1" style={{ color: 'var(--fg)' }}>
        {children}
      </dd>
    </div>
  )
}

function StatusSelector({
  value,
  onChange,
}: {
  value: MemoStatus
  onChange: (s: MemoStatus) => void
}) {
  const { t } = useLang()
  const options: { key: MemoStatus; label: 'detailStatusNew' | 'detailStatusLearning' | 'detailStatusMemorized' }[] = [
    { key: 'new', label: 'detailStatusNew' },
    { key: 'learning', label: 'detailStatusLearning' },
    { key: 'memorized', label: 'detailStatusMemorized' },
  ]
  return (
    <Glass className="fade-in flex items-center gap-1 p-1.5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className={cn('chip flex-1', value === o.key && 'chip--active')}
          style={{ justifyContent: 'center', padding: '0.55rem 0.5rem' }}
        >
          {t(o.label)}
        </button>
      ))}
    </Glass>
  )
}

function NavCard({ dir, number }: { dir: 'prev' | 'next'; number: number | null }) {
  const { lang, t } = useLang()
  if (!number) return <div className="flex-1" />
  const target = getHadith(number)
  const title = target ? localizeHadith(target, lang).title : ''
  return (
    <Link to={`/hadith/${number}`} className="min-w-0 flex-1">
      <Glass interactive className={cn('flex items-center gap-2 p-3.5', dir === 'next' && 'flex-row-reverse text-right')}>
        {dir === 'prev' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        <div className="min-w-0">
          <div className="eyebrow">{dir === 'prev' ? t('detailPrev') : t('detailNext')}</div>
          <div className="truncate text-sm font-medium">{title}</div>
        </div>
      </Glass>
    </Link>
  )
}
