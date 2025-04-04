"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, ClipboardList, FileText, Home, Menu, Package, RefreshCcw, ShoppingCart, Truck } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export function MobileNav() {
  const [open, setOpen] = useState(false)
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
      href: "/dashboard/goods-received",
      label: t("goodsReceived"),
      icon: ClipboardList,
      active: pathname?.startsWith("/dashboard/goods-received"),
    },
    {
      href: "/dashboard/returns",
      label: t("returns"),
      icon: RefreshCcw,
      active: pathname?.startsWith("/dashboard/returns"),
    },
    {
      href: "/dashboard/contracts",
      label: t("contracts"),
      icon: FileText,
      active: pathname?.startsWith("/dashboard/contracts"),
    },
    {
      href: "/dashboard/reports",
      label: t("reports"),
      icon: BarChart3,
      active: pathname?.startsWith("/dashboard/reports"),
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="px-2 py-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
            <Package className="h-6 w-6" />
            <span>Procurement System</span>
          </Link>
        </div>
        <nav className="grid gap-2 text-lg font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent",
                route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

