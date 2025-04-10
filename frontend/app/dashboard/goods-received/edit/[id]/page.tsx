"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, ChevronLeft, Package, Building2, DollarSign, Box, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

interface GoodsReceived {
  goodsReceivedID: number
  purchaseOrderID: string
  receivedDate: string
  receiver: string
  status: string
  remarks: string
  purchaseOrder: {
    purchaseOrderID: string
    supplierID: number
    orderDate: string
    expectedDeliveryDate: string
    totalAmount: number
    status: string
    approvedBy: string
    notes: string
    supplier: {
      supplierID: number
      supplierName: string
      contactPerson: string
      phone: string
      email: string
      address: string
    } | null
    purchaseOrderDetails: {
      purchaseOrderDetailID: number
      productID: number
      quantity: number
      unitPrice: number
      totalPrice: number
      product: {
        productID: number
        productName: string
        unit: string
      }
    }[]
  }
}

const goodsReceivedSchema = z.object({
  receivedDate: z.string().min(1, "Ngày nhận là bắt buộc"),
  receiver: z.string().min(1, "Người nhận là bắt buộc"),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
  remarks: z.string().optional(),
  receivedQuantities: z.array(z.number().min(0, "Số lượng không được âm")),
})

type GoodsReceivedFormValues = z.infer<typeof goodsReceivedSchema>

export default function EditGoodsReceivedPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [goodsReceived, setGoodsReceived] = useState<GoodsReceived | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<GoodsReceivedFormValues>({
    resolver: zodResolver(goodsReceivedSchema),
    defaultValues: {
      receivedDate: "",
      receiver: "",
      status: "",
      remarks: "",
      receivedQuantities: [],
    },
  })

  useEffect(() => {
    const fetchGoodsReceived = async () => {
      try {
        const response = await fetch(`http://localhost:5190/api/goodsreceived/${params.id}`)
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu phiếu nhận hàng")
        }
        const data = await response.json()
        setGoodsReceived(data)
        form.reset({
          receivedDate: data.receivedDate,
          receiver: data.receiver,
          status: data.status,
          remarks: data.remarks,
          
        })
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
        toast.error("Không thể tải dữ liệu phiếu nhận hàng")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoodsReceived()
  }, [params.id, form])

  const onSubmit = async (data: GoodsReceivedFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:5190/api/goodsreceived/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...goodsReceived,
          ...data,
        }),
      })

      if (!response.ok) {
        throw new Error("Không thể cập nhật phiếu nhận hàng")
      }

      toast.success("Cập nhật phiếu nhận hàng thành công")
      router.push("/dashboard/goods-received")
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error)
      toast.error("Không thể cập nhật phiếu nhận hàng")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!goodsReceived) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">Không tìm thấy phiếu nhận hàng</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa phiếu nhận hàng</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đơn hàng</CardTitle>
              <CardDescription>Cập nhật thông tin cơ bản cho đơn hàng này</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nhà cung cấp</Label>
                <Select disabled value={goodsReceived.purchaseOrder.supplier?.supplierID.toString() || ""}>
                  <SelectTrigger>
                    <SelectValue>{goodsReceived.purchaseOrder.supplier?.supplierName}</SelectValue>
                  </SelectTrigger>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày đặt hàng</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(goodsReceived.purchaseOrder.orderDate), "dd/MM/yyyy", { locale: vi })}
                      </Button>
                    </PopoverTrigger>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Ngày giao hàng dự kiến</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(goodsReceived.purchaseOrder.expectedDeliveryDate), "dd/MM/yyyy", { locale: vi })}
                      </Button>
                    </PopoverTrigger>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea
                  {...form.register("remarks")}
                  placeholder="Thông tin bổ sung về đơn hàng này"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm</CardTitle>
              <CardDescription>Cập nhật sản phẩm trong đơn hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Sản phẩm</th>
                      <th className="p-2 text-right">Số lượng</th>
                      <th className="p-2 text-right">Đơn giá</th>
                      <th className="p-2 text-right">Thành tiền</th>
                      <th className="w-[52px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {goodsReceived.purchaseOrder.purchaseOrderDetails?.map((detail, index) => (
                      <tr key={detail.purchaseOrderDetailID} className="border-b">
                        <td className="p-2">
                          <Select disabled value={detail.productID.toString()}>
                            <SelectTrigger>
                              <SelectValue>{detail.product.productName}</SelectValue>
                            </SelectTrigger>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min={0}
                            className="w-24 text-right"
                            value={form.watch(`receivedQuantities.${index}`)}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0
                              const quantities = [...form.watch("receivedQuantities")]
                              quantities[index] = value
                              form.setValue("receivedQuantities", quantities)
                            }}
                          />
                        </td>
                        <td className="p-2 text-right">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(detail.unitPrice)}
                        </td>
                        <td className="p-2 text-right">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(detail.totalPrice)}
                        </td>
                        <td className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa sản phẩm</span>
                          </Button>
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="p-2 text-center text-muted-foreground">
                          Không có sản phẩm nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={5} className="p-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          disabled
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Thêm sản phẩm
                        </Button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-base font-medium">Tổng giá trị:</div>
                <div className="text-lg font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(goodsReceived.purchaseOrder.totalAmount)}
                </div>
              </div>

              <div className="mt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
} 