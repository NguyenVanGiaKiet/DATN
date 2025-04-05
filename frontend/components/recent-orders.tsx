"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface RecentOrder {
  purchaseOrderID: string
  orderDate: string
  supplierName: string
  totalAmount: number
  status: string
}

export function RecentOrders() {
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:5190/api/purchaseorder')
        const data = await response.json()

        // Sắp xếp theo ngày mới nhất và lấy 5 đơn hàng
        const recentOrders = data
          .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
          .slice(0, 5)
          .map((order: any) => ({
            purchaseOrderID: order.purchaseOrderID,
            orderDate: new Date(order.orderDate).toLocaleDateString('vi-VN'),
            supplierName: order.supplier?.supplierName || 'Không xác định',
            totalAmount: order.totalAmount || 0,
            status: order.status || 'Đang xử lý'
          }))

        setOrders(recentOrders)
      } catch (error) {
        console.error('Error fetching recent orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return 'text-green-500'
      case 'Đã gửi email':
        return 'text-blue-500'
      case 'Đang xử lý':
        return 'text-yellow-500'
      case 'Đã hủy':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {orders.length === 0 ? (
            <div className="flex items-center justify-center">
              <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.purchaseOrderID} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {order.supplierName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mã đơn: {order.purchaseOrderID}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-medium">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(order.totalAmount)}
                  </p>
                  <p className={`text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.orderDate}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

