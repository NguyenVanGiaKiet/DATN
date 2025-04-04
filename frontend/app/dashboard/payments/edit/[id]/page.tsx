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

const formSchema = z.object({
  paymentDate: z.string().min(1, "Vui lòng chọn ngày thanh toán"),
  amountPaid: z.number().min(0, "Số tiền phải lớn hơn 0"),
  paymentMethod: z.string().min(1, "Vui lòng chọn phương thức thanh toán"),
  processedBy: z.string().min(1, "Vui lòng nhập người xử lý"),
})

type PaymentFormValues = z.infer<typeof formSchema>

export default function EditPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState<Payment | null>(null)

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentDate: "",
      amountPaid: 0,
      paymentMethod: "",
      processedBy: "",
    },
  })

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
      form.reset({
        paymentDate: data.paymentDate.split("T")[0],
        amountPaid: data.amountPaid,
        paymentMethod: data.paymentMethod,
        processedBy: data.processedBy || "",
      })
    } catch (error) {
      console.error("Lỗi khi tải thông tin thanh toán:", error)
      toast.error("Không thể tải thông tin thanh toán. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/payment/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payment,
          ...values,
        }),
      })

      if (!response.ok) {
        throw new Error("Không thể cập nhật thanh toán")
      }

      toast.success("Cập nhật thanh toán thành công")
      router.push("/dashboard/payments")
    } catch (error) {
      console.error("Lỗi khi cập nhật thanh toán:", error)
      toast.error("Không thể cập nhật thanh toán. Vui lòng thử lại sau.")
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Đã thanh toán":
        return <div className="text-green-500 font-medium">{status}</div>
      case "Đã hủy":
        return <div className="text-red-500 font-medium">{status}</div>
      default:
        return <div className="text-yellow-500 font-medium">{status}</div>
    }
  }

  if (loading && !payment) {
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
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Thanh toán</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin thanh toán</CardTitle>
            <CardDescription>Cập nhật thông tin thanh toán</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
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
                  <Label htmlFor="amountPaid">Số tiền</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    {...form.register("amountPaid", { valueAsNumber: true })}
                  />
                  {form.formState.errors.amountPaid && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.amountPaid.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                  <Select
                    onValueChange={(value) => form.setValue("paymentMethod", value)}
                    defaultValue={payment.paymentMethod}
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
                  <Label htmlFor="processedBy">Người xử lý</Label>
                  <Input
                    id="processedBy"
                    {...form.register("processedBy")}
                  />
                  {form.formState.errors.processedBy && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.processedBy.message}
                    </p>
                  )}
                </div>
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
                  {loading ? "Đang cập nhật..." : "Cập nhật thanh toán"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin hóa đơn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã hóa đơn</p>
                <p className="font-medium">{payment.invoiceID}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="font-medium">{payment.invoice.purchaseOrderID}</p>
              </div>
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
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <div className="font-medium">{getStatusBadge(payment.invoice.paymentStatus)}</div>
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