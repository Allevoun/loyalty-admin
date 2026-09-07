import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'la.theme'

function initial(): Theme {
  try {
    const s = localStorage.getItem(KEY)
    if (s === 'light' || s === 'dark') return s
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  return (
    <Ctx.Provider value={{ theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>
      {children}
    </Ctx.Provider>
  )
}

export const useTheme = () => useContext(Ctx)
