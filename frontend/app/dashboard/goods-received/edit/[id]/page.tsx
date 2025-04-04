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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface GoodsReceived {
  goodsReceivedID: string
  purchaseOrderID: string
  receivedDate: string
  totalAmount: number
  status: string
  notes: string
  goodsReceivedDetails: {
    productID: number
    product: {
      productName: string
      unit: string
    }
    quantity: number
    unitPrice: number
    amount: number
  }[]
  purchaseOrder: {
    supplier: {
      supplierName: string
      contactPerson: string
      phone: string
      email: string
      address: string
    }
  }
}

const goodsReceivedSchema = z.object({
  receivedDate: z.string().min(1, "Ngày nhập là bắt buộc"),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
  notes: z.string().optional(),
  goodsReceivedDetails: z.array(z.object({
    productID: z.number(),
    quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
    unitPrice: z.number().min(0, "Đơn giá phải lớn hơn 0"),
  })).min(1, "Phải có ít nhất một sản phẩm"),
})

type GoodsReceivedFormValues = z.infer<typeof goodsReceivedSchema>

export default function EditGoodsReceivedPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [goodsReceived, setGoodsReceived] = useState<GoodsReceived | null>(null)

  const form = useForm<GoodsReceivedFormValues>({
    resolver: zodResolver(goodsReceivedSchema),
    defaultValues: {
      receivedDate: "",
      status: "",
      notes: "",
      goodsReceivedDetails: [],
    },
  })

  useEffect(() => {
    fetchGoodsReceived()
  }, [params.id])

  const fetchGoodsReceived = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/goodsreceived/${params.id}`)
      if (!response.ok) {
        throw new Error("Không thể tải thông tin phiếu nhập hàng")
      }
      const data = await response.json()
      setGoodsReceived(data)
      form.reset({
        receivedDate: data.receivedDate.split("T")[0],
        status: data.status,
        notes: data.notes,
        goodsReceivedDetails: data.goodsReceivedDetails.map((detail: any) => ({
          productID: detail.productID,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
        })),
      })
    } catch (error) {
      console.error("Lỗi khi tải thông tin phiếu nhập hàng:", error)
      toast.error("Không thể tải thông tin phiếu nhập hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (index: number, value: number) => {
    const details = [...form.getValues("goodsReceivedDetails")]
    if (goodsReceived) {
      const maxQuantity = goodsReceived.purchaseOrder.purchaseOrderDetails[index].quantity - 
                         goodsReceived.purchaseOrder.purchaseOrderDetails[index].receivedQuantity
      details[index].quantity = Math.min(value, maxQuantity)
      form.setValue("goodsReceivedDetails", details)
    }
  }

  const onSubmit = async (data: GoodsReceivedFormValues) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/goodsreceived/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Không thể cập nhật phiếu nhập hàng")
      }

      toast.success("Phiếu nhập hàng đã được cập nhật thành công")
      router.push("/dashboard/goods-received")
    } catch (error) {
      console.error("Lỗi khi cập nhật phiếu nhập hàng:", error)
      toast.error("Không thể cập nhật phiếu nhập hàng. Vui lòng thử lại sau.")
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

  if (loading && !goodsReceived) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!goodsReceived) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-lg text-muted-foreground">Không tìm thấy phiếu nhập hàng</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Phiếu Nhập Hàng</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Phiếu Nhập</CardTitle>
          <CardDescription>Cập nhật thông tin chi tiết về phiếu nhập hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="receivedDate">Ngày nhập</Label>
                <Input
                  id="receivedDate"
                  type="date"
                  {...form.register("receivedDate")}
                />
                {form.formState.errors.receivedDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.receivedDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  onValueChange={(value) => form.setValue("status", value)}
                  defaultValue={goodsReceived.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                    <SelectItem value="Đã nhập">Đã nhập</SelectItem>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Chi tiết sản phẩm</h3>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>Số lượng đặt</TableHead>
                      <TableHead>Đã nhập</TableHead>
                      <TableHead>Số lượng nhập</TableHead>
                      <TableHead>Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goodsReceived.goodsReceivedDetails.map((detail, index) => (
                      <TableRow key={detail.productID}>
                        <TableCell>{detail.product.productName}</TableCell>
                        <TableCell>{detail.product.unit}</TableCell>
                        <TableCell>
                          {formatCurrency(detail.unitPrice)}
                        </TableCell>
                        <TableCell>
                          {goodsReceived.purchaseOrder.purchaseOrderDetails[index].quantity}
                        </TableCell>
                        <TableCell>
                          {goodsReceived.purchaseOrder.purchaseOrderDetails[index].receivedQuantity}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={
                              goodsReceived.purchaseOrder.purchaseOrderDetails[index].quantity - 
                              goodsReceived.purchaseOrder.purchaseOrderDetails[index].receivedQuantity
                            }
                            value={form.watch(`goodsReceivedDetails.${index}.quantity`)}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            form.watch(`goodsReceivedDetails.${index}.quantity`) * 
                            form.watch(`goodsReceivedDetails.${index}.unitPrice`)
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

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
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 