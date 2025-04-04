"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"

interface PurchaseOrder {
  purchaseOrderID: string
  supplier: {
    supplierName: string
    contactPerson: string
    phone: string
    email: string
    address: string
  }
  totalAmount: number
  paidAmount: number
  status: string
}

const paymentSchema = z.object({
  purchaseOrderID: z.string().min(1, "Đơn hàng là bắt buộc"),
  paymentDate: z.string().min(1, "Ngày thanh toán là bắt buộc"),
  amount: z.number().min(1, "Số tiền phải lớn hơn 0"),
  paymentMethod: z.string().min(1, "Phương thức thanh toán là bắt buộc"),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
  notes: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

export default function CreatePaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      purchaseOrderID: "",
      paymentDate: new Date().toISOString().split("T")[0],
      amount: 0,
      paymentMethod: "",
      status: "Đang xử lý",
      notes: "",
    },
  })

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/purchaseorder")
      if (!response.ok) {
        throw new Error("Không thể tải đơn hàng")
      }
      const data = await response.json()
      setPurchaseOrders(data)
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error)
      toast.error("Không thể tải đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleOrderSelect = (orderId: string) => {
    const order = purchaseOrders.find(o => o.purchaseOrderID === orderId)
    if (order) {
      setSelectedOrder(order)
      form.setValue("amount", order.totalAmount - order.paidAmount)
    }
  }

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Không thể tạo thanh toán")
      }

      toast.success("Thanh toán đã được tạo thành công")
      router.push("/dashboard/payments")
    } catch (error) {
      console.error("Lỗi khi tạo thanh toán:", error)
      toast.error("Không thể tạo thanh toán. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Tạo Thanh toán</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Thanh toán</CardTitle>
          <CardDescription>Nhập thông tin chi tiết về thanh toán mới</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="purchaseOrderID">Đơn hàng</Label>
                <Select
                  onValueChange={(value) => {
                    form.setValue("purchaseOrderID", value)
                    handleOrderSelect(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đơn hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrders.map((order) => (
                      <SelectItem key={order.purchaseOrderID} value={order.purchaseOrderID}>
                        {order.purchaseOrderID} - {order.supplier.supplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.purchaseOrderID && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.purchaseOrderID.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">Ngày thanh toán</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  {...form.register("paymentDate")}
                />
                {form.formState.errors.paymentDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.paymentDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền</Label>
                <Input
                  id="amount"
                  type="number"
                  {...form.register("amount", { valueAsNumber: true })}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                <Select
                  onValueChange={(value) => form.setValue("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                    <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                    <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentMethod && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.paymentMethod.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  onValueChange={(value) => form.setValue("status", value)}
                  defaultValue="Đang xử lý"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                    <SelectItem value="Đã thanh toán">Đã thanh toán</SelectItem>
                    <SelectItem value="Đã hủy">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            </div>

            {selectedOrder && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tổng tiền đơn hàng</Label>
                  <p className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Đã thanh toán</Label>
                  <p className="font-medium">{formatCurrency(selectedOrder.paidAmount)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Còn lại</Label>
                  <p className="font-medium">
                    {formatCurrency(selectedOrder.totalAmount - selectedOrder.paidAmount)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Nhà cung cấp</Label>
                  <p className="font-medium">{selectedOrder.supplier.supplierName}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Nhập ghi chú"
                {...form.register("notes")}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo thanh toán"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 