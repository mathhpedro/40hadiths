import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, Check, CheckCheck, BookOpen, ArrowRight } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { useStudy } from '../context/StudyContext'
import { hadiths, getHadith } from '../data'
import { isDue } from '../lib/srs'
import type { SrsGrade } from '../lib/srs'
import { cn } from '../lib/cn'
import { Glass } from '../components/glass/Glass'
import { ArabicText, TranslationText } from '../components/hadith/content'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Mode = 'due' | 'all'

export function Memorize() {
  const { t } = useLang()
  const study = useStudy()
  const allNumbers = useMemo(() => hadiths.map((h) => h.number), [])
  const dueNow = study.dueCount(allNumbers)

  const [mode, setMode] = useState<Mode>(dueNow > 0 ? 'due' : 'all')
  const [session, setSession] = useState(0)
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Build the queue once per (mode, session); grading mid-session won't reshuffle.
  const queue = useMemo(() => {
    const now = Date.now()
    if (mode === 'due') return allNumbers.filter((n) => isDue(study.getCard(n), now))
    return shuffle(allNumbers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, session, allNumbers])

  useEffect(() => {
    setIdx(0)
    setFlipped(false)
  }, [mode, session])

  const restart = () => setSession((s) => s + 1)
  const studyAll = () => {
    setMode('all')
    setSession((s) => s + 1)
  }

  // Empty deck (nothing due)
  if (queue.length === 0) {
    return (
      <Completion
        title={t('memAllCaughtUp')}
        hint={t('memAllCaughtUpHint')}
        onStudyAll={studyAll}
      />
    )
  }

  // Finished the session
  if (idx >= queue.length) {
    return (
      <Completion
        title={t('memAllCaughtUp')}
        hint={t('memAllCaughtUpHint')}
        onStudyAll={mode === 'due' ? studyAll : undefined}
        onRestart={restart}
      />
    )
  }

  const current = queue[idx]
  const hadith = getHadith(current)!

  const grade = (g: SrsGrade) => {
    study.reviewCard(current, g)
    setFlipped(false)
    setIdx((i) => i + 1)
  }

  const progress = ((idx) / queue.length) * 100

  return (
    <div className="space-y-4">
      {/* Header: mode + progress */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <button
            className={cn('chip', mode === 'due' && 'chip--active')}
            onClick={() => setMode('due')}
          >
            {t('memDueOnly')}
            {dueNow > 0 && <span style={{ opacity: 0.7 }}>{dueNow}</span>}
          </button>
          <button
            className={cn('chip', mode === 'all' && 'chip--active')}
            onClick={() => setMode('all')}
          >
            {t('memAll')}
          </button>
        </div>
        <button
          onClick={restart}
          className="btn btn--ghost btn--icon ml-auto"
          aria-label={t('memRestart')}
        >
          <RotateCcw size={17} />
        </button>
      </div>

      <div className="px-1">
        <div className="mb-1.5 flex items-center justify-between text-xs" style={{ color: 'var(--fg-subtle)' }}>
          <span>{t('memCardOf', { i: idx + 1, n: queue.length })}</span>
          <span className="hadith-numeral" style={{ fontSize: '0.95rem' }}>
            {t('detailHadithN', { n: current })}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--chip-bg)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--gold))' }}
          />
        </div>
      </div>

      {/* Card */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flip-card block w-full text-left"
        aria-label={t('memFlip')}
      >
        <div className={cn('flip-inner', flipped && 'flip-inner--back')}>
          {/* Front — Arabic */}
          <Glass strong className="flip-face flex min-h-[42vh] flex-col items-center justify-center p-6">
            <span className="eyebrow mb-4">{t('memFront')}</span>
            <ArabicText text={hadith.arabic} large className="text-center" />
            {!flipped && (
              <span className="mt-6 text-xs" style={{ color: 'var(--fg-subtle)' }}>
                {t('memFlip')}
              </span>
            )}
          </Glass>
          {/* Back — Translation */}
          <Glass strong className="flip-face flip-face--back flex min-h-[42vh] flex-col justify-center p-6">
            <span className="eyebrow mb-3">{t('memBack')}</span>
            <h3 className="hadith-title mb-3 text-lg">{hadith.title_pt}</h3>
            <TranslationText text={hadith.translation_pt} />
          </Glass>
        </div>
      </button>

      {/* Controls */}
      {flipped ? (
        <div className="fade-in grid grid-cols-3 gap-2.5">
          <GradeButton grade="dont" onClick={() => grade('dont')} label={t('memDont')} />
          <GradeButton grade="almost" onClick={() => grade('almost')} label={t('memAlmost')} />
          <GradeButton grade="know" onClick={() => grade('know')} label={t('memKnow')} />
        </div>
      ) : (
        <button className="btn btn--primary w-full" onClick={() => setFlipped(true)}>
          {t('memShowAnswer')}
        </button>
      )}

      <p className="px-1 text-center text-xs" style={{ color: 'var(--fg-subtle)' }}>
        {t('memIntro')}
      </p>
    </div>
  )
}

function GradeButton({
  grade,
  onClick,
  label,
}: {
  grade: SrsGrade
  onClick: () => void
  label: string
}) {
  const color =
    grade === 'know' ? 'var(--accent)' : grade === 'almost' ? 'var(--gold)' : 'var(--fg-muted)'
  const Icon = grade === 'know' ? CheckCheck : grade === 'almost' ? Check : RotateCcw
  return (
    <button
      onClick={onClick}
      className="btn flex-col gap-1 py-3"
      style={{ borderColor: color, color }}
    >
      <Icon size={20} />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  )
}

function Completion({
  title,
  hint,
  onStudyAll,
  onRestart,
}: {
  title: string
  hint: string
  onStudyAll?: () => void
  onRestart?: () => void
}) {
  const { t } = useLang()
  return (
    <Glass strong className="fade-in mt-4 flex flex-col items-center px-6 py-14 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        <CheckCheck size={30} />
      </span>
      <h2 className="hadith-title mt-4 text-xl">{title}</h2>
      <p className="prose-content mt-1.5 text-sm">{hint}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        {onRestart && (
          <button className="btn" onClick={onRestart}>
            <RotateCcw size={17} />
            {t('memRestart')}
          </button>
        )}
        {onStudyAll && (
          <button className="btn btn--primary" onClick={onStudyAll}>
            <BookOpen size={17} />
            {t('memStudyAll')}
          </button>
        )}
        <Link to="/hadiths" className="btn btn--ghost">
          {t('homeBrowseAll')}
          <ArrowRight size={16} />
        </Link>
      </div>
    </Glass>
  )
}
