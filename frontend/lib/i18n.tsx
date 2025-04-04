"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Translations
const translations = {
  en: {
    dashboard: "Dashboard",
    purchaseOrders: "Purchase Orders",
    suppliers: "Suppliers",
    products: "Products",
    goodsReceived: "Goods Received",
    returns: "Returns",
    contracts: "Contracts",
    reports: "Reports",
    // Add more translations as needed
  },
  vi: {
    dashboard: "Tổng quan",
    purchaseOrders: "Đơn hàng mua",
    suppliers: "Nhà cung cấp",
    products: "Sản phẩm",
    goodsReceived: "Hàng nhập kho",
    returns: "Trả hàng",
    contracts: "Hợp đồng",
    reports: "Báo cáo",
    // Add more translations as needed
  },
}

type LanguageContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
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

