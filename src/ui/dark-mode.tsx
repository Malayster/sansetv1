'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark'

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const stored = localStorage.getItem('election-theme') as Theme | null
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('election-theme', theme)
  }, [theme])

  const toggle = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), [])

  return <ThemeCtx value={{ theme, toggle }}>{children}</ThemeCtx>
}

export function useTheme() {
  return useContext(ThemeCtx)
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-200 border
        bg-white text-gray-600 border-gray-200 hover:bg-gray-50
        dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      {theme === 'light' ? (
        <><span className="text-base">🌙</span> Dark</>
      ) : (
        <><span className="text-base">☀️</span> Light</>
      )}
    </button>
  )
}
