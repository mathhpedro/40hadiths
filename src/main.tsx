import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import './index.css'
// Self-hosted fonts (bundled → cached by the service worker for offline use).
import '@fontsource-variable/inter/index.css'
import '@fontsource/amiri/400.css'
import '@fontsource/amiri/700.css'
import '@fontsource/scheherazade-new/400.css'
import '@fontsource/scheherazade-new/700.css'

import { App } from './App'
import { SettingsProvider } from './context/SettingsContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { StudyProvider } from './context/StudyContext'
import { ClassesProvider } from './context/ClassesContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <LanguageProvider>
        <AuthProvider>
          <StudyProvider>
            <ClassesProvider>
              {/* HashRouter keeps deep links working on any static host / sub-path. */}
              <HashRouter>
                <App />
              </HashRouter>
            </ClassesProvider>
          </StudyProvider>
        </AuthProvider>
      </LanguageProvider>
    </SettingsProvider>
  </StrictMode>,
)
