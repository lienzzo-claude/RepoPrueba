"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

export const THEMES = [
  { value: "light", label: "Claro", swatch: "oklch(0.985 0 0)" },
  { value: "dark", label: "Oscuro", swatch: "oklch(0.205 0 0)" },
  { value: "nordic", label: "Nórdico", swatch: "oklch(0.5 0.11 235)" },
  { value: "sunset", label: "Atardecer", swatch: "oklch(0.62 0.17 30)" },
  { value: "forest", label: "Bosque", swatch: "oklch(0.42 0.11 148)" },
  { value: "cyberpunk", label: "Cyberpunk", swatch: "oklch(0.7 0.27 330)" },
  { value: "minimal", label: "Minimal", swatch: "oklch(0.48 0 0)" },
] as const

export type ThemeValue = (typeof THEMES)[number]["value"]

const THEME_VALUES = THEMES.map((t) => t.value) as unknown as string[]

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      themes={THEME_VALUES}
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key?.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      const currentIdx = THEMES.findIndex((t) => t.value === theme)
      const nextIdx = (currentIdx + 1) % THEMES.length
      setTheme(THEMES[nextIdx].value)
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [theme, setTheme])

  return null
}

export { ThemeProvider }
