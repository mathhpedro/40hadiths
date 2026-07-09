import { useEffect, useState, type ReactNode } from 'react'
import { Download, Trash2, Info } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import {
  useSettings,
  type Theme,
  type FontSize,
  type ArabicFont,
} from '../context/SettingsContext'
import { useStudy } from '../context/StudyContext'
import { useAuth } from '../context/AuthContext'
import { meta } from '../data'
import { cn } from '../lib/cn'
import { Glass } from '../components/glass/Glass'
import { AuthPanel } from '../components/AuthPanel'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}

function useInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  const install = async () => {
    if (!event) return
    await event.prompt()
    await event.userChoice
    setEvent(null)
  }
  return { canInstall: Boolean(event), install }
}

export function SettingsPage() {
  const { lang, setLang, t } = useLang()
  const { settings, update } = useSettings()
  const { resetAll } = useStudy()
  const { configured } = useAuth()
  const { canInstall, install } = useInstallPrompt()

  const reset = () => {
    if (window.confirm(t('setResetConfirm'))) resetAll()
  }

  return (
    <div className="space-y-5">
      {/* Display */}
      <Section title={t('setDisplay')}>
        <Field label={t('setTheme')}>
          <Segmented<Theme>
            value={settings.theme}
            onChange={(v) => update('theme', v)}
            options={[
              { key: 'light', label: t('setThemeLight') },
              { key: 'dark', label: t('setThemeDark') },
              { key: 'system', label: t('setThemeSystem') },
            ]}
          />
        </Field>

        <Field label={t('setFontSize')}>
          <Segmented<FontSize>
            value={settings.fontSize}
            onChange={(v) => update('fontSize', v)}
            options={[
              { key: 'sm', label: <span style={{ fontSize: '0.8rem' }}>A</span> },
              { key: 'md', label: <span style={{ fontSize: '1rem' }}>A</span> },
              { key: 'lg', label: <span style={{ fontSize: '1.2rem' }}>A</span> },
              { key: 'xl', label: <span style={{ fontSize: '1.45rem' }}>A</span> },
            ]}
          />
        </Field>

        <Field label={t('setArabicFont')}>
          <Segmented<ArabicFont>
            value={settings.arabicFont}
            onChange={(v) => update('arabicFont', v)}
            options={[
              {
                key: 'amiri',
                label: <span style={{ fontFamily: "'Amiri', serif", fontSize: '1.05rem' }}>Amiri أميري</span>,
              },
              {
                key: 'scheherazade',
                label: (
                  <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '1.05rem' }}>
                    Scheherazade
                  </span>
                ),
              },
            ]}
          />
        </Field>

        <Switch
          checked={settings.reduceMotion}
          onChange={(v) => update('reduceMotion', v)}
          label={t('setReduceMotion')}
          desc={t('setReduceMotionDesc')}
        />
      </Section>

      {/* Content */}
      <Section title={t('setContent')}>
        <Field label={t('setLanguage')}>
          <Segmented
            value={lang}
            onChange={(v) => setLang(v)}
            options={[
              { key: 'pt', label: t('setLangPt') },
              { key: 'en', label: t('setLangEn') },
            ]}
          />
        </Field>
        <Switch
          checked={settings.showTransliteration}
          onChange={(v) => update('showTransliteration', v)}
          label={t('setShowTranslit')}
        />
        <Switch
          checked={settings.showTranslation}
          onChange={(v) => update('showTranslation', v)}
          label={t('setShowTranslation')}
        />
      </Section>

      {/* Account / cloud sync */}
      {configured && (
        <Section title={t('setAccount')}>
          <AuthPanel />
        </Section>
      )}

      {/* About */}
      <Section title={t('setAbout')}>
        <div className="flex items-center justify-between">
          <span className="prose-content" style={{ color: 'var(--fg)' }}>
            {t('setVersion')}
          </span>
          <span className="chip chip--gold">{meta.versao}</span>
        </div>

        {canInstall && (
          <button className="btn btn--primary w-full" onClick={install}>
            <Download size={17} />
            {t('setInstall')}
          </button>
        )}
        {canInstall && (
          <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
            {t('setInstallDesc')}
          </p>
        )}

        <div
          className="flex gap-2.5 rounded-2xl p-3.5"
          style={{ background: 'var(--gold-soft)' }}
        >
          <Info size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--gold)' }} />
          <div>
            <div className="eyebrow mb-1" style={{ color: 'var(--gold)' }}>
              {t('setReviewNote')}
            </div>
            <p className="prose-content text-[0.85rem]">{t('setDataNote')}</p>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <button
        onClick={reset}
        className="btn w-full"
        style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.4)' }}
      >
        <Trash2 size={17} />
        {t('setReset')}
      </button>

      <p className="pb-2 text-center text-xs" style={{ color: 'var(--fg-subtle)' }}>
        {t('appName')} · v{meta.versao}
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="eyebrow mb-2 px-1">{title}</h2>
      <Glass className="space-y-4 p-5">{children}</Glass>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      {children}
    </div>
  )
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { key: T; label: ReactNode }[]
}) {
  return (
    <div className="flex gap-1 rounded-full p-1" style={{ background: 'var(--chip-bg)' }}>
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className={cn('chip flex-1', value === o.key && 'chip--active')}
          style={{ justifyContent: 'center', padding: '0.55rem 0.5rem' }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Switch({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  desc?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 text-left"
    >
      <span className="flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {desc && (
          <span className="block text-xs" style={{ color: 'var(--fg-subtle)' }}>
            {desc}
          </span>
        )}
      </span>
      <span
        className="relative shrink-0 rounded-full transition-colors"
        style={{
          width: 46,
          height: 27,
          background: checked ? 'var(--accent)' : 'var(--chip-bg)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <span
          className="absolute rounded-full transition-transform"
          style={{
            top: 2,
            left: 2,
            width: 21,
            height: 21,
            background: checked ? 'var(--accent-contrast)' : 'var(--fg-muted)',
            transform: checked ? 'translateX(19px)' : 'translateX(0)',
          }}
        />
      </span>
    </button>
  )
}
