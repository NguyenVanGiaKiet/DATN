"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, XCircle, Eye, Calendar } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
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
    quantity: number
  }[]
}

export default function PurchaseOrderApprovalPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/purchaseorder/pending")
      if (!response.ok) {
        throw new Error("Không thể tải danh sách đơn hàng chờ phê duyệt")
      }
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error)
      toast.error("Không thể tải danh sách đơn hàng chờ phê duyệt. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleView = (orderId: string) => {
    router.push(`/dashboard/purchase-orders/view/${orderId}`)
  }

  const handleApprove = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`http://localhost:5190/api/purchaseorder/${selectedOrder.purchaseOrderID}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: approvalNotes,
        }),
      })

      if (!response.ok) {
        throw new Error("Không thể phê duyệt đơn hàng")
      }

      toast.success("Đơn hàng đã được phê duyệt thành công")
      setApprovalDialogOpen(false)
      setApprovalNotes("")
      fetchOrders()
    } catch (error) {
      console.error("Lỗi khi phê duyệt đơn hàng:", error)
      toast.error("Không thể phê duyệt đơn hàng. Vui lòng thử lại sau.")
    }
  }

  const handleReject = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch(`http://localhost:5190/api/purchaseorder/${selectedOrder.purchaseOrderID}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: rejectionReason,
        }),
      })

      if (!response.ok) {
        throw new Error("Không thể từ chối đơn hàng")
      }

      toast.success("Đơn hàng đã được từ chối thành công")
      setRejectionDialogOpen(false)
      setRejectionReason("")
      fetchOrders()
    } catch (error) {
      console.error("Lỗi khi từ chối đơn hàng:", error)
      toast.error("Không thể từ chối đơn hàng. Vui lòng thử lại sau.")
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Phê duyệt đơn hàng</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng chờ phê duyệt</CardTitle>
          <CardDescription>
            Danh sách các đơn hàng đang chờ phê duyệt
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
                  <TableHead>Số lượng sản phẩm</TableHead>
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
                      Không có đơn hàng nào chờ phê duyệt
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
                        {order.purchaseOrderDetails.reduce((total, item) => total + item.quantity, 0)}
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
                            onClick={() => {
                              setSelectedOrder(order)
                              setApprovalDialogOpen(true)
                            }}
                            className="h-8 w-8 text-green-600 hover:text-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order)
                              setRejectionDialogOpen(true)
                            }}
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
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

      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phê duyệt đơn hàng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn phê duyệt đơn hàng này không?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approvalNotes">Ghi chú phê duyệt</Label>
              <Textarea
                id="approvalNotes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Nhập ghi chú phê duyệt (nếu có)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleApprove}>Phê duyệt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối đơn hàng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn từ chối đơn hàng này không?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Lý do từ chối</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 