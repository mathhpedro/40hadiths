import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Moon, Sun } from 'lucide-react'
import { useLang } from '../../context/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { LanguageToggle } from '../LanguageToggle'
import { Logo } from '../Logo'

function useTitle(): string | null {
  const { pathname } = useLocation()
  const { t } = useLang()
  if (pathname === '/') return null
  if (pathname.startsWith('/hadith/')) {
    const n = pathname.split('/')[2]
    return t('detailHadithN', { n })
  }
  if (pathname.startsWith('/hadiths')) return t('listTitle')
  if (pathname.startsWith('/related')) return t('relatedTitle')
  if (pathname.startsWith('/memorize')) return t('memTitle')
  if (pathname.startsWith('/settings')) return t('setTitle')
  return null
}

export function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useLang()
  const { resolvedTheme, update } = useSettings()
  const title = useTitle()
  const isHome = pathname === '/'

  const goBack = () => {
    if (window.history.length > 2) navigate(-1)
    else navigate(pathname.startsWith('/hadith/') ? '/hadiths' : '/')
  }

  return (
    <header
      className="pt-safe sticky top-0 z-40 border-b"
      style={{
        background: 'var(--glass-bg-strong)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'blur(22px) saturate(160%)',
        WebkitBackdropFilter: 'blur(22px) saturate(160%)',
      }}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5">
        {isHome ? (
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo size={38} id="hdr" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[0.95rem] font-bold tracking-tight">
                {t('appName')}
              </div>
              <div
                className="truncate text-[0.72rem]"
                style={{ color: 'var(--fg-subtle)' }}
              >
                {t('appTagline')}
              </div>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={goBack}
              className="btn btn--ghost btn--icon"
              aria-label={t('detailPrev')}
            >
              <ChevronLeft size={22} />
            </button>
            <h1 className="min-w-0 flex-1 truncate text-[1.02rem] font-bold tracking-tight">
              {title}
            </h1>
          </>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => update('theme', resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="btn btn--ghost btn--icon"
            aria-label={t('setTheme')}
          >
            {resolvedTheme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </div>
    </header>
  )
}
