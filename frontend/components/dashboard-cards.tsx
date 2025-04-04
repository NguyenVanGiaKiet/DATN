"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Package, ShoppingCart, Truck } from "lucide-react"
import { useEffect, useState } from "react"

interface DashboardStats {
  totalOrders: number
  activeSuppliers: number
  pendingDeliveries: number
  monthlySpend: number
  orderGrowth: number
  supplierGrowth: number
  deliveryGrowth: number
  spendGrowth: number
}

export function DashboardCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeSuppliers: 0,
    pendingDeliveries: 0,
    monthlySpend: 0,
    orderGrowth: 0,
    supplierGrowth: 0,
    deliveryGrowth: 0,
    spendGrowth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Lấy dữ liệu đơn hàng
        const ordersResponse = await fetch('http://localhost:5190/api/purchaseorder')
        const orders = await ordersResponse.json()

        // Lấy dữ liệu nhà cung cấp
        const suppliersResponse = await fetch('http://localhost:5190/api/supplier')
        const suppliers = await suppliersResponse.json()

        // Tính toán thống kê
        const now = new Date()
        const thisMonth = now.getMonth()
        const lastMonth = thisMonth - 1
        
        const currentMonthOrders = orders.filter((order: any) => 
          new Date(order.orderDate).getMonth() === thisMonth
        )
        const lastMonthOrders = orders.filter((order: any) => 
          new Date(order.orderDate).getMonth() === lastMonth
        )

        const currentMonthSpend = currentMonthOrders.reduce((sum: number, order: any) => 
          sum + (order.totalAmount || 0), 0
        )
        const lastMonthSpend = lastMonthOrders.reduce((sum: number, order: any) => 
          sum + (order.totalAmount || 0), 0
        )

        const pendingDeliveries = orders.filter((order: any) => 
          order.status === 'Đang xử lý'
        ).length

        const activeSuppliers = suppliers.filter((supplier: any) => 
          supplier.status
        ).length

        // Tính % tăng trưởng
        const orderGrowth = lastMonthOrders.length > 0 
          ? ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 
          : 0

        const spendGrowth = lastMonthSpend > 0
          ? ((currentMonthSpend - lastMonthSpend) / lastMonthSpend) * 100
          : 0

        setStats({
          totalOrders: orders.length,
          activeSuppliers,
          pendingDeliveries,
          monthlySpend: currentMonthSpend,
          orderGrowth,
          supplierGrowth: 0, // Có thể tính nếu có dữ liệu lịch sử
          deliveryGrowth: 0, // Có thể tính nếu có dữ liệu lịch sử
          spendGrowth
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang tải...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <div className="flex items-center pt-1">
            {stats.orderGrowth > 0 ? (
              <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
            )}
            <p className="text-xs text-muted-foreground">
              {stats.orderGrowth.toFixed(1)}% so với tháng trước
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nhà cung cấp đang hoạt động</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSuppliers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đơn hàng đang xử lý</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingDeliveries}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chi tiêu tháng này</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.monthlySpend)}
          </div>
          <div className="flex items-center pt-1">
            {stats.spendGrowth > 0 ? (
              <ArrowUpIcon className="h-3 w-3 text-red-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-green-500 mr-1" />
            )}
            <p className="text-xs text-muted-foreground">
              {Math.abs(stats.spendGrowth).toFixed(1)}% so với tháng trước
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

