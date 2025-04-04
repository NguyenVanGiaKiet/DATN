"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Printer, Edit, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface PurchaseOrderDetail {
  productID: number
  product: {
    productName: string
    unit: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface PurchaseOrder {
  purchaseOrderID: string
  supplierID: number
  supplier: {
    supplierName: string
    contactPerson: string
    phone: string
    email: string
    address: string
  }
  orderDate: string
  expectedDeliveryDate: string
  totalAmount: number
  status: string
  approvedBy: string
  notes: string
  purchaseOrderDetails: PurchaseOrderDetail[]
}

export default function ViewPurchaseOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
      if (!response.ok) {
        throw new Error("Không thể tải thông tin đơn hàng")
      }
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error)
      toast.error("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Đang xử lý":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "Đã phê duyệt":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case "Đã hoàn tất":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "Đã hủy":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Đã phê duyệt":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Đã hoàn tất":
        return "bg-green-100 text-green-800 border-green-300"
      case "Đã hủy":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Không tìm thấy thông tin đơn hàng</p>
        <Button onClick={() => router.push("/dashboard/purchase-orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/purchase-orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Đơn hàng #{order.purchaseOrderID}</h1>
            <p className="text-muted-foreground">
              Ngày đặt: {format(new Date(order.orderDate), "dd/MM/yyyy", { locale: vi })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            In đơn hàng
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
          <Link href={`/dashboard/purchase-orders/edit/${order.purchaseOrderID}`}>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              <Badge variant="outline" className={getStatusClass(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{order.status}</span>
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ngày đặt</span>
              <span>{format(new Date(order.orderDate), "dd/MM/yyyy", { locale: vi })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ngày giao dự kiến</span>
              <span>{format(new Date(order.expectedDeliveryDate), "dd/MM/yyyy", { locale: vi })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Người phê duyệt</span>
              <span>{order.approvedBy || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tổng tiền</span>
              <span className="font-medium">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.totalAmount)}
              </span>
            </div>
            {order.notes && (
              <div className="space-y-2">
                <span className="text-muted-foreground">Ghi chú</span>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhà cung cấp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tên nhà cung cấp</span>
              <span>{order.supplier.supplierName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Người liên hệ</span>
              <span>{order.supplier.contactPerson}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Số điện thoại</span>
              <span>{order.supplier.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{order.supplier.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Địa chỉ</span>
              <span>{order.supplier.address}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Đơn vị tính</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.purchaseOrderDetails.map((detail) => (
                <TableRow key={detail.productID}>
                  <TableCell>{detail.product.productName}</TableCell>
                  <TableCell>{detail.product.unit}</TableCell>
                  <TableCell className="text-right">{detail.quantity}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(detail.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(detail.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 