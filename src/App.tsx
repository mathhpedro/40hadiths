import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Home } from './pages/Home'
import { HadithList } from './pages/HadithList'
import { HadithDetail } from './pages/HadithDetail'
import { Related } from './pages/Related'
import { Classes } from './pages/Classes'
import { Memorize } from './pages/Memorize'
import { SettingsPage } from './pages/Settings'
import { Presentation } from './pages/Presentation'
import { NotFound } from './pages/NotFound'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/hadiths" element={<HadithList />} />
        <Route path="/hadith/:number" element={<HadithDetail />} />
        <Route path="/related" element={<Related />} />
        <Route path="/aulas" element={<Classes />} />
        <Route path="/memorize" element={<Memorize />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* Presentation lives outside the shell (full-screen, no chrome). */}
      <Route path="/present" element={<Presentation />} />
      <Route path="/present/:number" element={<Presentation />} />
    </Routes>
  )
}
