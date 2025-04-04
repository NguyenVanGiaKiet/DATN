"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Home, Package, RefreshCcw, ShoppingCart, Truck, CreditCard, CheckCircle, Settings } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname()
  const { t } = useTranslation()

  const routes = [
    {
      href: "/dashboard",
      label: t("dashboard"),
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/purchase-orders",
      label: t("purchaseOrders"),
      icon: ShoppingCart,
      active: pathname?.startsWith("/dashboard/purchase-orders"),
    },
    {
      href: "/dashboard/suppliers",
      label: t("suppliers"),
      icon: Truck,
      active: pathname?.startsWith("/dashboard/suppliers"),
    },
    {
      href: "/dashboard/products",
      label: t("products"),
      icon: Package,
      active: pathname?.startsWith("/dashboard/products"),
    },
    {
      href: "/dashboard/payments",
      label: t("payments"),
      icon: CreditCard,
      active: pathname?.startsWith("/dashboard/payments"),
    },
    {
      href: "/dashboard/returns",
      label: t("returns"),
      icon: RefreshCcw,
      active: pathname?.startsWith("/dashboard/returns"),
    },
    {
      href: "/dashboard/approvals",
      label: t("approvals"),
      icon: CheckCircle,
      active: pathname?.startsWith("/dashboard/approvals"),
    },
    {
      href: "/dashboard/reports",
      label: t("reports"),
      icon: BarChart3,
      active: pathname?.startsWith("/dashboard/reports"),
    },
    {
      href: "/dashboard/settings",
      label: t("settings"),
      icon: Settings,
      active: pathname?.startsWith("/dashboard/settings"),
    },
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}
    </nav>
  )
}

