"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface OrderStatsData {
  totalOrders: number
  processingOrders: number
  completedOrders: number
  cancelledOrders: number
  confirmedOrders: number
  sentEmailOrders: number
  totalAmount: number
}

export function OrderStats() {
  const [stats, setStats] = useState<OrderStatsData>({
    totalOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    confirmedOrders: 0,
    sentEmailOrders: 0,
    totalAmount: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5190/api/purchaseorder')
        const data = await response.json()
        
        const statsData = {
          totalOrders: data.length,
          processingOrders: data.filter((order: any) => order.status === 'Đang xử lý').length,
          completedOrders: data.filter((order: any) => order.status === 'Đã hoàn thành').length,
          confirmedOrders: data.filter((order: any) => order.status === 'Đã xác nhận').length,
          cancelledOrders: data.filter((order: any) => order.status === 'Đã hủy').length,
          sentEmailOrders: data.filter((order: any) => order.status === 'Đã gửi email').length,
          totalAmount: data.reduce((sum: number, order: any) => sum + order.totalAmount, 0)
        }
        
        setStats(statsData)
      } catch (error) {
        console.error('Error fetching order stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê đơn hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Tổng số đơn hàng:</p>
            <p className="text-xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Đơn hàng đang xử lý:</p>
            <p className="text-xl font-bold text-yellow-500">{stats.processingOrders}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Đơn hàng đã gửi email:</p>
            <p className="text-xl font-bold text-blue-500">{stats.sentEmailOrders}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Đơn hàng đã xác nhận:</p>
            <p className="text-xl font-bold text-green-500">{stats.confirmedOrders}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Đơn hàng hoàn thành:</p>
            <p className="text-xl font-bold text-green-500">{stats.completedOrders}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Đơn hàng đã hủy:</p>
            <p className="text-xl font-bold text-red-500">{stats.cancelledOrders}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Tổng giá trị:</p>
            <p className="text-xl font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalAmount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 