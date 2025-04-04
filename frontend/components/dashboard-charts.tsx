"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface ChartData {
  name: string
  total: number
}

export function DashboardCharts() {
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:5190/api/purchaseorder')
        const orders = await response.json()

        // Tạo map để lưu trữ tổng giá trị theo tháng
        const monthlyTotals = new Map<string, number>()
        
        // Xử lý dữ liệu theo tháng
        orders.forEach((order: any) => {
          const date = new Date(order.orderDate)
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
          
          const currentTotal = monthlyTotals.get(monthYear) || 0
          monthlyTotals.set(monthYear, currentTotal + (order.totalAmount || 0))
        })

        // Chuyển đổi dữ liệu cho biểu đồ
        const sortedData = Array.from(monthlyTotals.entries())
          .sort(([a], [b]) => {
            const [monthA, yearA] = a.split('/')
            const [monthB, yearB] = b.split('/')
            return new Date(+yearA, +monthA - 1).getTime() - new Date(+yearB, +monthB - 1).getTime()
          })
          .slice(-6) // Chỉ lấy 6 tháng gần nhất
          .map(([month, total]) => ({
            name: month,
            total: total
          }))

        setMonthlyData(sortedData)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê theo tháng</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê theo tháng</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('vi-VN', {
                    notation: 'compact',
                    compactDisplay: 'short',
                    maximumFractionDigits: 1
                  }).format(value)
                }
              />
              <Tooltip 
                formatter={(value: any) => 
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(value)
                }
              />
              <Bar
                dataKey="total"
                fill="#adfa1d"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

