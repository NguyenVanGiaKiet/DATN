"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, XCircle, Eye, Calendar, Package } from "lucide-react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PurchaseOrder {
  purchaseOrderID: string
  supplierID: number
  supplier: {
    supplierName: string
  }
  orderDate: string
  expectedDeliveryDate: string
  totalAmount: number
  status: string
  notes: string
  purchaseOrderDetails: {
    productID: number
    product: {
      productName: string
      unit: string
    }
    quantity: number
    receivedQuantity: number
    unitPrice: number
  }[]
}

export default function PurchaseOrderReceiptsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [receiptQuantities, setReceiptQuantities] = useState<Record<number, number>>({})

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/purchaseorder/approved")
      if (!response.ok) {
        throw new Error("Không thể tải danh sách đơn hàng đã phê duyệt")
      }
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error)
      toast.error("Không thể tải danh sách đơn hàng đã phê duyệt. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleView = (orderId: string) => {
    router.push(`/dashboard/purchase-orders/view/${orderId}`)
  }

  const handleReceipt = (order: PurchaseOrder) => {
    setSelectedOrder(order)
    const initialQuantities = order.purchaseOrderDetails.reduce((acc, detail) => {
      acc[detail.productID] = detail.quantity - detail.receivedQuantity
      return acc
    }, {} as Record<number, number>)
    setReceiptQuantities(initialQuantities)
    setReceiptDialogOpen(true)
  }

  const handleQuantityChange = (productID: number, value: string) => {
    const quantity = parseInt(value) || 0
    setReceiptQuantities(prev => ({
      ...prev,
      [productID]: quantity
    }))
  }

  const handleSubmitReceipt = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`http://localhost:5190/api/purchaseorder/${selectedOrder.purchaseOrderID}/receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptDetails: Object.entries(receiptQuantities).map(([productID, quantity]) => ({
            productID: parseInt(productID),
            quantity: quantity
          }))
        }),
      })

      if (!response.ok) {
        throw new Error("Không thể cập nhật số lượng nhập hàng")
      }

      toast.success("Đã cập nhật số lượng nhập hàng thành công")
      setReceiptDialogOpen(false)
      fetchOrders()
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng nhập hàng:", error)
      toast.error("Không thể cập nhật số lượng nhập hàng. Vui lòng thử lại sau.")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đã phê duyệt":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Đã nhập một phần":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Đã hoàn tất":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý nhập hàng</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng đã phê duyệt</CardTitle>
          <CardDescription>
            Danh sách các đơn hàng đã được phê duyệt và đang chờ nhập hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Ngày giao dự kiến</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Không có đơn hàng nào đã phê duyệt
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.purchaseOrderID}>
                      <TableCell className="font-medium">{order.purchaseOrderID}</TableCell>
                      <TableCell>{order.supplier.supplierName}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>{formatDate(order.expectedDeliveryDate)}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusClass(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(order.purchaseOrderID)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReceipt(order)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nhập hàng</DialogTitle>
            <DialogDescription>
              Cập nhật số lượng hàng đã nhập cho đơn hàng #{selectedOrder?.purchaseOrderID}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Đơn vị tính</TableHead>
                    <TableHead>Số lượng đặt</TableHead>
                    <TableHead>Đã nhập</TableHead>
                    <TableHead>Số lượng nhập</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder?.purchaseOrderDetails.map((detail) => (
                    <TableRow key={detail.productID}>
                      <TableCell>{detail.product.productName}</TableCell>
                      <TableCell>{detail.product.unit}</TableCell>
                      <TableCell>{detail.quantity}</TableCell>
                      <TableCell>{detail.receivedQuantity}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={detail.quantity - detail.receivedQuantity}
                          value={receiptQuantities[detail.productID] || 0}
                          onChange={(e) => handleQuantityChange(detail.productID, e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitReceipt}>Xác nhận nhập hàng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 