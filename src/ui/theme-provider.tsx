'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeCtx = createContext<{ theme: string; setTheme: (t: string) => void }>({ theme: 'dark', setTheme: () => {} })
export const useTheme = () => useContext(ThemeCtx)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored) setThemeState(stored)
  }, [])

  const setTheme = (t: string) => {
    setThemeState(t)
    localStorage.setItem('theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>
}
