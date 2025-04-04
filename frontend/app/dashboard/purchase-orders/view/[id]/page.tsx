"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Printer, Edit, CheckCircle, XCircle, AlertCircle, Mail } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailContent, setEmailContent] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

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
      case "Đã gửi email":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "Đã xác nhận":
        return <CheckCircle className="h-4 w-4 text-green-500" />
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
      case "Đã gửi email":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Đã xác nhận":
        return "bg-green-100 text-green-800 border-green-300"
      case "Đã hủy":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleSendEmailClick = () => {
    if (!order) return

    const content = `
Kính gửi ${order.supplier.supplierName},

Đơn đặt hàng: ${order.purchaseOrderID}
Ngày đặt: ${format(new Date(order.orderDate), "dd/MM/yyyy", { locale: vi })}
Ngày giao dự kiến: ${format(new Date(order.expectedDeliveryDate), "dd/MM/yyyy", { locale: vi })}
Tổng giá trị: ${new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
}).format(order.totalAmount)}

Chi tiết đơn hàng:
${order.purchaseOrderDetails.map(detail => 
  `- ${detail.product.productName}: ${detail.quantity} ${detail.product.unit} x ${new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(detail.unitPrice)}`
).join('\n')}

Trân trọng,
[Tên công ty của bạn]`
    setEmailContent(content)
    setIsEmailModalOpen(true)
  }

  const handleSendEmail = async () => {
    if (!order) return

    try {
      setIsSendingEmail(true)
      const response = await fetch(`http://localhost:5190/api/purchaseorder/${order.purchaseOrderID}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailContent }),
      })

      if (!response.ok) {
        throw new Error("Gửi email thất bại")
      }

      toast.success("Email đã được gửi thành công!")
      setIsEmailModalOpen(false)
      fetchOrder()
    } catch (error) {
      console.error("Lỗi khi gửi email:", error)
      toast.error("Không thể gửi email. Vui lòng thử lại sau.")
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleConfirmOrder = async () => {
    try {
      setIsConfirming(true)
      const response = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...order,
          status: "Đã xác nhận"
        })
      })

      if (!response.ok) {
        throw new Error("Không thể xác nhận đơn hàng")
      }

      toast.success("Đơn hàng đã được xác nhận thành công!")
      fetchOrder()
    } catch (error) {
      console.error("Lỗi khi xác nhận đơn hàng:", error)
      toast.error("Không thể xác nhận đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setIsConfirming(false)
    }
  }

  const handleCancelOrder = async () => {
    try {
      setIsCancelling(true)
      const response = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...order,
          status: "Đã hủy"
        })
      })

      if (!response.ok) {
        throw new Error("Không thể hủy đơn hàng")
      }

      toast.success("Đơn hàng đã được hủy thành công!")
      setShowCancelDialog(false)
      fetchOrder()
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error)
      toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setIsCancelling(false)
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
          <Button
            variant={order?.status === "Đã gửi email" ? "outline" : "default"}
            size="sm"
            onClick={handleSendEmailClick}
            disabled={isSendingEmail}
          >
            <Mail className="mr-2 h-4 w-4" />
            {isSendingEmail ? "Đang gửi..." : order?.status === "Đã gửi email" ? "Gửi lại email" : "Gửi email"}
          </Button>
          <Button
            variant={order?.status === "Đã gửi email" ? "default" : "outline"}
            size="sm"
            onClick={handleConfirmOrder}
            disabled={isConfirming || order?.status !== "Đã gửi email"}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isConfirming ? "Đang xác nhận..." : "Xác nhận đơn hàng"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCancelDialog(true)}
            disabled={isCancelling || order?.status === "Đã hủy" || order?.status === "Đã xác nhận"}
            className="text-red-500 hover:text-red-700"
          >
            <XCircle className="mr-2 h-4 w-4" />
            {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
          </Button>
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

      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gửi Email Đơn Hàng</DialogTitle>
            <DialogDescription>
              Xem trước và chỉnh sửa nội dung email trước khi gửi
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailModalOpen(false)}
              disabled={isSendingEmail}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Đang gửi...
                </>
              ) : (
                "Gửi Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Không, giữ lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="bg-red-500 hover:bg-red-600"
            >
              {isCancelling ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Đang hủy...
                </>
              ) : (
                "Có, hủy đơn hàng"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 