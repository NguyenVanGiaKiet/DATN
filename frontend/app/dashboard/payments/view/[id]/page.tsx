"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer, Download, Edit } from "lucide-react"
import toast from "react-hot-toast"

interface Payment {
  paymentID: number
  invoiceID: number
  paymentDate: string
  amountPaid: number
  paymentMethod: string
  processedBy: string
  invoice: {
    invoiceID: number
    purchaseOrderID: string
    invoiceDate: string
    totalAmount: number
    paymentStatus: string
    dueDate: string
    purchaseOrder: {
      supplier: {
        supplierName: string
        contactPerson: string
        phone: string
        email: string
        address: string
      }
    } | null
  }
}

export default function ViewPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayment()
  }, [params.id])

  const fetchPayment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/payment/${params.id}`)
      if (!response.ok) {
        throw new Error("Không thể tải thông tin thanh toán")
      }
      const data = await response.json()
      setPayment(data)
    } catch (error) {
      console.error("Lỗi khi tải thông tin thanh toán:", error)
      toast.error("Không thể tải thông tin thanh toán. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge variant="success">Đã thanh toán</Badge>
      case "Pending":
        return <Badge variant="warning">Đang xử lý</Badge>
      case "Cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy thanh toán</h1>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết Thanh toán</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push(`/dashboard/payments/edit/${params.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã thanh toán</p>
                <p className="font-medium">{payment.paymentID}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã hóa đơn</p>
                <p className="font-medium">{payment.invoiceID}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="font-medium">{payment.invoice.purchaseOrderID}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày thanh toán</p>
                <p className="font-medium">{formatDate(payment.paymentDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <div className="font-medium">{getStatusBadge(payment.invoice.paymentStatus)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                <p className="font-medium">{payment.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số tiền</p>
                <p className="font-medium">{formatCurrency(payment.amountPaid)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Người xử lý</p>
                <p className="font-medium">{payment.processedBy}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin hóa đơn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Ngày hóa đơn</p>
                <p className="font-medium">{formatDate(payment.invoice.invoiceDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hạn thanh toán</p>
                <p className="font-medium">{formatDate(payment.invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng tiền hóa đơn</p>
                <p className="font-medium">{formatCurrency(payment.invoice.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {payment.invoice.purchaseOrder && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin nhà cung cấp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tên nhà cung cấp</p>
                  <p className="font-medium">{payment.invoice.purchaseOrder.supplier.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Người liên hệ</p>
                  <p className="font-medium">{payment.invoice.purchaseOrder.supplier.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Điện thoại</p>
                  <p className="font-medium">{payment.invoice.purchaseOrder.supplier.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{payment.invoice.purchaseOrder.supplier.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p className="font-medium">{payment.invoice.purchaseOrder.supplier.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 