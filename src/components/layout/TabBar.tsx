import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Layers, CalendarCheck, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLang } from '../../context/LanguageContext'
import type { StringKey } from '../../i18n/strings'
import { cn } from '../../lib/cn'

interface Tab {
  to: string
  icon: LucideIcon
  label: StringKey
  match: (path: string) => boolean
}

const TABS: Tab[] = [
  { to: '/', icon: Home, label: 'navHome', match: (p) => p === '/' },
  {
    to: '/hadiths',
    icon: BookOpen,
    label: 'navList',
    match: (p) => p.startsWith('/hadiths') || p.startsWith('/hadith/'),
  },
  { to: '/memorize', icon: Layers, label: 'navMemorize', match: (p) => p.startsWith('/memorize') },
  { to: '/aulas', icon: CalendarCheck, label: 'navClasses', match: (p) => p.startsWith('/aulas') },
  { to: '/settings', icon: Settings, label: 'navSettings', match: (p) => p.startsWith('/settings') },
]

export function TabBar() {
  const { pathname } = useLocation()
  const { t } = useLang()

  return (
    <nav
      className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4"
      aria-label={t('navHome')}
    >
      <div className="glass-bar no-scrollbar pointer-events-auto mb-3 flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1.5 shadow-lg">
        {TABS.map((tab) => {
          const active = tab.match(pathname)
          const Icon = tab.icon
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-full px-2.5 py-2 transition-colors sm:px-5',
              )}
              style={{ color: active ? 'var(--accent)' : 'var(--fg-subtle)' }}
            >
              {active && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'var(--accent-soft)' }}
                  aria-hidden="true"
                />
              )}
              <Icon size={20} className="relative" strokeWidth={active ? 2.4 : 2} />
              <span className="relative text-[0.58rem] font-semibold tracking-wide sm:text-[0.62rem]">
                {t(tab.label)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
