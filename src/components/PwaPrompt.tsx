import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, Check, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

/** Small glass toast for "offline ready" and "update available". */
export function PwaPrompt() {
  const { t } = useLang()
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  // "Offline ready" is informational — auto-dismiss it after a few seconds.
  useEffect(() => {
    if (!offlineReady) return
    const id = setTimeout(() => setOfflineReady(false), 6000)
    return () => clearTimeout(id)
  }, [offlineReady, setOfflineReady])

  if (!offlineReady && !needRefresh) return null

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div className="glass glass-strong pointer-events-auto flex items-center gap-3 rounded-full py-2.5 pr-2.5 pl-4 fade-in">
        {needRefresh ? (
          <>
            <RefreshCw size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium">{t('updateAvailable')}</span>
            <button className="btn btn--primary" onClick={() => updateServiceWorker(true)}>
              {t('reload')}
            </button>
          </>
        ) : (
          <>
            <Check size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium">{t('offlineReady')}</span>
            <button
              className="btn btn--ghost btn--icon"
              onClick={close}
              aria-label={t('close')}
            >
              <X size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
