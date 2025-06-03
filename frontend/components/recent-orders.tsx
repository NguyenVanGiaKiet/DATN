"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n"

// Kiểu dữ liệu cho mỗi đơn hàng
interface PurchaseOrder {
  purchaseOrderID: string;
  supplierName: string;
  imageUrl?: string;
  totalAmount: number;
}

export function RecentOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const { t } = useTranslation()
  useEffect(() => {
    // Thay link này bằng URL API thật của bạn
    fetch("http://localhost:5190/api/purchaseorder/recent")
      .then((res) => res.json())
      .then((data) => setOrders(data.slice(0, 5))) // lấy 5 đơn hàng mới nhất
      .catch((err) => console.error("Error fetching orders:", err))
  }, [])

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Đơn đặt hàng gần đây</CardTitle>
        <CardDescription>5 đơn hàng gần đây nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.purchaseOrderID} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={order.imageUrl || "/placeholder.svg"} alt={order.supplierName} />
                <AvatarFallback>
                  {order.supplierName
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{order.purchaseOrderID}</p>
                <p className="text-sm text-muted-foreground">{order.supplierName}</p>
              </div>
              <div className="ml-auto font-medium">
                {order.totalAmount.toLocaleString()} VND
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
