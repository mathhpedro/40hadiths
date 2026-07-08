import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loadJSON, saveJSON, STORAGE_KEYS } from '../lib/storage'

export type Theme = 'light' | 'dark' | 'system'
export type FontSize = 'sm' | 'md' | 'lg' | 'xl'
export type ArabicFont = 'amiri' | 'scheherazade'

export interface Settings {
  theme: Theme
  fontSize: FontSize
  arabicFont: ArabicFont
  reduceMotion: boolean
  showTransliteration: boolean
  showTranslation: boolean
}

const DEFAULTS: Settings = {
  theme: 'dark',
  fontSize: 'md',
  arabicFont: 'amiri',
  reduceMotion: false,
  showTransliteration: true,
  showTranslation: true,
}

const FONT_SCALE: Record<FontSize, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.15,
  xl: 1.32,
}

const ARABIC_FAMILY: Record<ArabicFont, string> = {
  amiri: "'Amiri', 'Scheherazade New', serif",
  scheherazade: "'Scheherazade New', 'Amiri', serif",
}

interface SettingsContextValue {
  settings: Settings
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  resolvedTheme: 'light' | 'dark'
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({
    ...DEFAULTS,
    ...loadJSON<Partial<Settings>>(STORAGE_KEYS.settings, {}),
  }))

  // Track the OS preference so `theme: 'system'` resolves live.
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme: 'light' | 'dark' =
    settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : settings.theme

  const update = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        saveJSON(STORAGE_KEYS.settings, next)
        return next
      })
    },
    [],
  )

  // Reflect settings onto <html> so CSS can react to them.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolvedTheme
    root.style.setProperty('--font-scale', String(FONT_SCALE[settings.fontSize]))
    root.style.setProperty('--font-arabic', ARABIC_FAMILY[settings.arabicFont])
    root.dataset.reduceMotion = String(settings.reduceMotion)
    const themeColor = resolvedTheme === 'dark' ? '#04140f' : '#e7f2ec'
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((m) => m.setAttribute('content', themeColor))
  }, [resolvedTheme, settings.fontSize, settings.arabicFont, settings.reduceMotion])

  const value = useMemo(
    () => ({ settings, update, resolvedTheme }),
    [settings, update, resolvedTheme],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
