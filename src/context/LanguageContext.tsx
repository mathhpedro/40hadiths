import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Lang } from '../types'
import { loadJSON, saveJSON, STORAGE_KEYS } from '../lib/storage'
import { translate, type StringKey } from '../i18n/strings'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
  t: (key: StringKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    loadJSON<Lang>(STORAGE_KEYS.lang, 'pt'),
  )

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    saveJSON(STORAGE_KEYS.lang, next)
  }, [])

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'pt' ? 'en' : 'pt'
      saveJSON(STORAGE_KEYS.lang, next)
      return next
    })
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }, [lang])

  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
