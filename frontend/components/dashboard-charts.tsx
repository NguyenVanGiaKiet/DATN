"use client"

import { useEffect, useState } from "react"
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface PaymentData {
  paymentDate: string;
  amountPaid: number;
}

interface PurchaseOrder {
  purchaseOrderID: string;
  supplier: {
    supplierID: number;
    supplierName: string;
  };
}

export function DashboardCharts() {
  const [spendingData, setSpendingData] = useState<{ name: string; amount: number }[]>([])
  const [supplierData, setSupplierData] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    fetch("http://localhost:5190/api/payment")
      .then((res) => res.json())
      .then((data: PaymentData[]) => {
        const grouped: { [monthYear: string]: number } = {}
      
        data.forEach((item) => {
          const date = new Date(item.paymentDate)
          const key = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
          grouped[key] = (grouped[key] || 0) + item.amountPaid
        })
      
        const finalData = Object.entries(grouped)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => {
            const [monthA, yearA] = a.name.split("/").map(Number)
            const [monthB, yearB] = b.name.split("/").map(Number)
            return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime()
          })
      
        setSpendingData(finalData)
      })      
      .catch((err) => console.error("Lỗi khi lấy dữ liệu thanh toán:", err))
  }, [])

  useEffect(() => {
    fetch("http://localhost:5190/api/purchaseorder")
      .then((res) => res.json())
      .then((data: PurchaseOrder[]) => {
        const totalOrders = data.length
        const grouped: { [supplierName: string]: number } = {}

        data.forEach((order) => {
          grouped[order.supplier.supplierName] = (grouped[order.supplier.supplierName] || 0) + 1
        })

        const supplierArray = Object.entries(grouped).map(([name, count]) => ({
          name,
          value: Number(((count / totalOrders) * 100).toFixed(2)),
        }))

        setSupplierData(supplierArray)
      })
      .catch((err) => console.error("Lỗi khi lấy dữ liệu nhà cung cấp:", err))
  }, [])

  function formatCurrencyShort(value: number): string {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}T`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return `${value}`;
  }

  const formatCurrency = (value: number): string => {
    return `${value.toLocaleString()} VND`
  }


  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Thống kê</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <Tabs defaultValue="spending">
          <TabsList>
            <TabsTrigger value="spending">Chi tiêu</TabsTrigger>
            <TabsTrigger value="suppliers">Nhà cung cấp</TabsTrigger>
          </TabsList>
          <TabsContent value="spending" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
                  <Tooltip
                    formatter={(value) => [`${formatCurrency(Number(value))}`, "Số tiền"]}
                    labelFormatter={(label) => `Tháng: ${label}`}
                  />
                  <Bar dataKey="amount" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="suppliers" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={supplierData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {supplierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Tỷ lệ"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
