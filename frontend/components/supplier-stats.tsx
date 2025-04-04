"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface SupplierData {
  supplierID: number
  supplierName: string
  totalOrders: number
  totalAmount: number
}

export function SupplierStats() {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSupplierStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('http://localhost:5190/api/purchaseorder')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const orders = await response.json()
        
        // Tính toán thống kê cho từng nhà cung cấp
        const supplierStats = orders.reduce((acc: any, order: any) => {
          const { supplierID, supplier, totalAmount } = order
          if (!supplierID || !supplier) return acc
          
          if (!acc[supplierID]) {
            acc[supplierID] = {
              supplierID,
              supplierName: supplier?.supplierName || 'Không xác định',
              totalOrders: 0,
              totalAmount: 0
            }
          }
          
          acc[supplierID].totalOrders++
          acc[supplierID].totalAmount += totalAmount || 0
          
          return acc
        }, {})
        
        // Chuyển đổi object thành array và sắp xếp theo tổng giá trị
        const sortedSuppliers = Object.values(supplierStats)
          .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
          .slice(0, 5) // Chỉ lấy top 5 nhà cung cấp
        
        setSuppliers(sortedSuppliers as SupplierData[])
      } catch (error) {
        console.error('Error fetching supplier stats:', error)
        setError('Không thể tải dữ liệu nhà cung cấp')
      } finally {
        setLoading(false)
      }
    }

    fetchSupplierStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 5 nhà cung cấp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 5 nhà cung cấp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (suppliers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 5 nhà cung cấp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Chưa có dữ liệu nhà cung cấp</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 nhà cung cấp</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <div key={supplier.supplierID} className="border-b pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{supplier.supplierName}</h3>
                <span className="text-sm text-muted-foreground">
                  {supplier.totalOrders} đơn hàng
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Tổng giá trị: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(supplier.totalAmount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 