import { DashboardCards } from "@/components/dashboard-cards"
import { DashboardCharts } from "@/components/dashboard-charts"
import { RecentOrders } from "@/components/recent-orders"
import { SupplierStats } from "@/components/supplier-stats"
import { OrderStats } from "../../components/order-stats"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
      </div>
      
      {/* Thống kê tổng quan */}
      <DashboardCards />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <DashboardCharts />
        <RecentOrders />
      </div>
    </div>
  )
}

