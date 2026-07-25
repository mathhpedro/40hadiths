import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { getHadith, hadiths, hadithOfTheDay, localizeHadith } from '../data'
import { LanguageToggle } from '../components/LanguageToggle'
import { Background } from '../components/layout/Background'
import { TranslationStack } from '../components/hadith/content'
import { cn } from '../lib/cn'

export function Presentation() {
  const { number } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLang()

  const n = number ? Number(number) : hadithOfTheDay().number
  const hadith = getHadith(n)

  const [showArabic, setShowArabic] = useState(true)
  const [showTranslit, setShowTranslit] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)
  const [isFull, setIsFull] = useState(false)

  const go = useCallback(
    (target: number) => {
      if (target >= 1 && target <= hadiths.length) navigate(`/present/${target}`)
    },
    [navigate],
  )

  const toggleFull = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      /* fullscreen may be blocked; ignore */
    }
  }, [])

  useEffect(() => {
    const onFs = () => setIsFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    navigate(`/hadith/${n}`)
  }, [navigate, n])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          go(n + 1)
          break
        case 'ArrowLeft':
          go(n - 1)
          break
        case 'Escape':
          if (!document.fullscreenElement) exit()
          break
        case 'a':
        case 'A':
          setShowArabic((v) => !v)
          break
        case 't':
        case 'T':
          setShowTranslit((v) => !v)
          break
        case 'l':
        case 'L':
          setShowTranslation((v) => !v)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [n, go, exit])

  if (!hadith) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Background />
        <button className="btn btn--primary" onClick={() => navigate('/')}>
          {t('backHome')}
        </button>
      </div>
    )
  }

  const h = localizeHadith(hadith, lang)

  return (
    <div className="relative flex min-h-dvh flex-col">
      <Background />

      {/* Top controls */}
      <div className="pt-safe flex items-center gap-2 p-4">
        <button className="btn btn--ghost btn--icon" onClick={exit} aria-label={t('presExit')}>
          <X size={22} />
        </button>
        <span className="hadith-numeral" style={{ fontSize: '1.3rem' }}>
          {hadith.number}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden gap-1.5 sm:flex">
            <SectionToggle active={showArabic} onClick={() => setShowArabic((v) => !v)} label={t('presArabic')} />
            <SectionToggle active={showTranslit} onClick={() => setShowTranslit((v) => !v)} label={t('presTranslit')} />
            <SectionToggle active={showTranslation} onClick={() => setShowTranslation((v) => !v)} label={t('presTranslation')} />
          </div>
          <LanguageToggle />
          <button className="btn btn--ghost btn--icon" onClick={toggleFull} aria-label="Fullscreen">
            {isFull ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      {/* Section toggles on mobile */}
      <div className="flex flex-wrap justify-center gap-1.5 px-4 sm:hidden">
        <SectionToggle active={showArabic} onClick={() => setShowArabic((v) => !v)} label={t('presArabic')} />
        <SectionToggle active={showTranslit} onClick={() => setShowTranslit((v) => !v)} label={t('presTranslit')} />
        <SectionToggle active={showTranslation} onClick={() => setShowTranslation((v) => !v)} label={t('presTranslation')} />
      </div>

      {/* Stage */}
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-8 text-center sm:px-12">
        <h2 className="hadith-title max-w-4xl" style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.9rem)', color: 'var(--fg-muted)' }}>
          {h.title}
        </h2>

        {showArabic && (
          <p
            lang="ar"
            dir="rtl"
            className="arabic max-w-5xl"
            style={{ fontSize: 'clamp(1.8rem, 5vw, 4rem)', lineHeight: 1.85 }}
          >
            {hadith.arabic}
          </p>
        )}

        {showTranslit && (
          <p
            className="translit max-w-4xl"
            style={{ fontSize: 'clamp(1rem, 2.2vw, 1.9rem)' }}
          >
            {hadith.transliteration}
          </p>
        )}

        {showTranslation && (
          <TranslationStack pt={hadith.translation_pt} en={hadith.translation_en} big />
        )}
      </div>

      {/* Bottom nav */}
      <div className="pb-safe flex items-center justify-between gap-3 p-5">
        <button
          className="btn btn--icon"
          onClick={() => go(n - 1)}
          disabled={n <= 1}
          aria-label={t('detailPrev')}
        >
          <ChevronLeft size={24} />
        </button>
        <p className="hidden text-xs sm:block" style={{ color: 'var(--fg-subtle)' }}>
          {t('presHint')}
        </p>
        <button
          className="btn btn--icon"
          onClick={() => go(n + 1)}
          disabled={n >= hadiths.length}
          aria-label={t('detailNext')}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  )
}

function SectionToggle({
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
      {label}
    </button>
  )
}
