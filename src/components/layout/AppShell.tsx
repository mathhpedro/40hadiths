import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Background } from './Background'
import { Header } from './Header'
import { TabBar } from './TabBar'
import { PwaPrompt } from '../PwaPrompt'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

/** Persistent chrome (background, header, tab bar) wrapping the routed pages. */
export function AppShell() {
  return (
    <>
      <Background />
      <ScrollToTop />
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-32">
        <Outlet />
      </main>
      <TabBar />
      <PwaPrompt />
    </>
  )
}
