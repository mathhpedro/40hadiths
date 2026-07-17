import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Layers, Sparkles, MonitorPlay, CalendarCheck } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { useStudy } from '../context/StudyContext'
import { useClasses } from '../context/ClassesContext'
import { hadiths, meta, hadithOfTheDay, localizeHadith } from '../data'
import { Glass } from '../components/glass/Glass'
import { Logo } from '../components/Logo'
import { Bismillah, Ornament } from '../components/hadith/content'
import { ConfirmButtons, formatWhen } from '../components/classes/parts'

export function Home() {
  const { lang, t } = useLang()
  const { memorizedCount, learningCount, dueCount } = useStudy()
  const { signedIn, sessions, myStatus, confirm } = useClasses()

  const nextClass = signedIn
    ? sessions.find((s) => new Date(s.scheduled_at).getTime() >= Date.now() - 3 * 60 * 60 * 1000)
    : undefined

  const today = hadithOfTheDay()
  const todayL = localizeHadith(today, lang)
  const allNumbers = hadiths.map((h) => h.number)
  const due = dueCount(allNumbers)
  const collection = lang === 'pt' ? meta.colecao : meta.colecao_en

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="fade-in">
        <Glass strong className="overflow-hidden px-6 py-8 text-center">
          <div className="mx-auto mb-4 w-fit">
            <Logo size={76} id="hero" />
          </div>
          <Bismillah className="mb-4" />
          <h1 className="hadith-title text-3xl sm:text-4xl">{t('appName')}</h1>
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>
            {collection}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--fg-subtle)' }}>
            {meta.autor}
          </p>
          <Ornament className="mx-auto mt-5 max-w-[220px]" />
          <Link to="/hadiths" className="btn btn--primary mt-5">
            {t('homeStart')}
            <ArrowRight size={18} />
          </Link>
        </Glass>
      </section>

      {/* Next class (when signed in) */}
      {nextClass && (
        <section className="fade-in" style={{ animationDelay: '40ms' }}>
          <div className="mb-2 flex items-center gap-2 px-1">
            <CalendarCheck size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="eyebrow flex-1">{t('classNext')}</h2>
            <Link
              to="/aulas"
              className="text-xs font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              {t('classViewAll')}
            </Link>
          </div>
          <Glass className="space-y-3 p-5">
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                {formatWhen(nextClass.scheduled_at, lang)}
              </div>
              <h3 className="hadith-title text-lg">{nextClass.title}</h3>
            </div>
            <ConfirmButtons
              status={myStatus(nextClass.id)}
              onPick={(s) => void confirm(nextClass.id, s)}
            />
          </Glass>
        </section>
      )}

      {/* Hadith of the day */}
      <section className="fade-in" style={{ animationDelay: '60ms' }}>
        <div className="mb-2 flex items-center gap-2 px-1">
          <Sparkles size={15} style={{ color: 'var(--gold)' }} />
          <h2 className="eyebrow">{t('homeHadithOfDay')}</h2>
        </div>
        <Link to={`/hadith/${today.number}`} className="block">
          <Glass interactive className="p-5">
            <div className="flex items-start gap-4">
              <span className="hadith-numeral" style={{ fontSize: '2.4rem' }}>
                {today.number}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="hadith-title text-lg">{todayL.title}</h3>
                <p
                  lang="ar"
                  dir="rtl"
                  className="arabic mt-2 line-clamp-2"
                  style={{ fontSize: '1.25rem', lineHeight: 1.9 }}
                >
                  {today.arabic}
                </p>
                <span
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: 'var(--accent)' }}
                >
                  {t('homeReadThis')}
                  <ArrowRight size={15} />
                </span>
              </div>
            </div>
          </Glass>
        </Link>
      </section>

      {/* Progress */}
      {(memorizedCount > 0 || learningCount > 0) && (
        <section className="fade-in" style={{ animationDelay: '120ms' }}>
          <Glass className="flex items-center justify-around gap-2 px-4 py-4">
            <Stat value={memorizedCount} label={t('homeMemorized')} color="var(--accent)" />
            <div className="h-8 w-px" style={{ background: 'var(--glass-border)' }} />
            <Stat value={learningCount} label={t('homeLearning')} color="var(--gold)" />
            <div className="h-8 w-px" style={{ background: 'var(--glass-border)' }} />
            <Stat value={hadiths.length} label={t('homeCollection')} color="var(--fg-muted)" />
          </Glass>
        </section>
      )}

      {/* Quick access */}
      <section className="fade-in" style={{ animationDelay: '160ms' }}>
        <h2 className="eyebrow mb-2 px-1">{t('homeQuickAccess')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard
            to="/hadiths"
            icon={<BookOpen size={22} />}
            title={t('homeBrowseAll')}
            desc={t('homeBrowseAllDesc')}
          />
          <QuickCard
            to="/memorize"
            icon={<Layers size={22} />}
            title={t('homeMemorize')}
            desc={t('homeMemorizeDesc')}
            badge={due > 0 ? String(due) : undefined}
          />
          <QuickCard
            to="/related"
            icon={<Sparkles size={22} />}
            title={t('navRelated')}
            desc={t('homeRelatedDesc')}
          />
          <QuickCard
            to={`/present/${today.number}`}
            icon={<MonitorPlay size={22} />}
            title={t('homePresent')}
            desc={t('homePresentDesc')}
          />
        </div>
      </section>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-[0.72rem]" style={{ color: 'var(--fg-subtle)' }}>
        {label}
      </div>
    </div>
  )
}

function QuickCard({
  to,
  icon,
  title,
  desc,
  badge,
}: {
  to: string
  icon: ReactNode
  title: string
  desc: string
  badge?: string
}) {
  return (
    <Link to={to} className="block">
      <Glass interactive className="relative flex h-full flex-col gap-2 p-4">
        {badge && (
          <span
            className="absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold"
            style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
          >
            {badge}
          </span>
        )}
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          {icon}
        </span>
        <h3 className="font-semibold leading-tight">{title}</h3>
        <p className="text-[0.8rem] leading-snug" style={{ color: 'var(--fg-subtle)' }}>
          {desc}
        </p>
      </Glass>
    </Link>
  )
}
