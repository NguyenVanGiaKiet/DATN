"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import en from "./locales/en.json"  // Import English translations
import vi from "./locales/vi.json"  // Import Vietnamese translations

type LanguageContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const translations = {
  en,
  vi,
}

const LanguageContext = createContext<LanguageContextType>({
  language: "vi",
  setLanguage: () => {},
  t: (key: string) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("vi")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "vi"
    setLanguage(savedLanguage)
  }, [])

  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: string) => {
    // @ts-ignore
    return translations[language]?.[key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)

export const useTranslation = () => {
  const { t } = useLanguage()
  return { t }
}

