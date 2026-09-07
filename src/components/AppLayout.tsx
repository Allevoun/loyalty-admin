import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { t } from '@/lib/dict'
import { useTheme } from '@/store/theme'
import { useExports } from '@/store/exports'
import { SmartSearch } from './SmartSearch'
import { Tooltip } from './ui/overlays'

const NAV = [
  { to: '/search', label: t.nav.search },
  { to: '/user', label: t.nav.user },
  { to: '/promos', label: t.nav.promos },
  { to: '/segments', label: t.nav.segments },
  { to: '/blocked', label: t.nav.blocked },
  { to: '/exports', label: t.nav.exports },
]

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <Tooltip content={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
      <button
        type="button"
        onClick={toggle}
        className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-border-strong bg-surface text-text-muted hover:text-text"
      >
        {theme === 'dark' ? (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M13 3l-1.4 1.4M4.4 11.6L3 13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M13.5 9.5A5.5 5.5 0 016 3a5.5 5.5 0 103 9.5 5.5 5.5 0 004.5-3z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </Tooltip>
  )
}

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function AppLayout() {
  const { jobs } = useExports()
  const activeJobs = jobs.filter((j) => j.status === 'queued' || j.status === 'preparing').length

  return (
    <div className="flex min-h-full flex-col">
      <ScrollReset />
      <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-4 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-primary text-primary-text">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.3 4.2 13.3l.7-4.3-3.1-3 4.3-.6z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold text-text">{t.appName}</div>
              <div className="text-[10.5px] text-text-subtle">{t.appSub}</div>
            </div>
          </div>

          <nav className="ml-3 flex items-center gap-0.5">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-[var(--radius-md)] px-2.5 py-1.5 text-[12.5px] font-medium transition-colors',
                    isActive
                      ? 'bg-surface-2 text-text'
                      : 'text-text-muted hover:bg-surface-2/60 hover:text-text',
                  )
                }
              >
                {n.label}
                {n.to === '/exports' && activeJobs > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-text">
                    {activeJobs}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <SmartSearch variant="compact" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-5 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-border px-5 py-3 text-center text-[11px] text-text-subtle">
        Прототип · данные синтетические · время указано в МСК
      </footer>
    </div>
  )
}
