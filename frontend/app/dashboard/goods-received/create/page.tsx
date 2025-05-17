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
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import { useNotification } from "@/components/notification-context";
import { v4 as uuidv4 } from "uuid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PurchaseOrder {
  purchaseOrderID: string
  supplier: {
    supplierName: string
  }
  purchaseOrderDetails: {
    productID: number
    product: {
      productName: string
      unit: string
      unitPrice: number
    }
    quantity: number
    receivedQuantity: number
  }[]
}

interface Product {
  productID: number
  productName: string
  unit: string
  unitPrice: number
  stockQuantity: number
}

const goodsReceivedSchema = z.object({
  purchaseOrderID: z.string().min(1, "Đơn hàng là bắt buộc"),
  receivedDate: z.string().min(1, "Ngày nhập là bắt buộc"),
  notes: z.string().optional(),
  goodsReceivedDetails: z.array(z.object({
    productID: z.number(),
    quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
    unitPrice: z.number().min(0, "Đơn giá phải lớn hơn 0"),
  })).min(1, "Phải có ít nhất một sản phẩm"),
})

type GoodsReceivedFormValues = z.infer<typeof goodsReceivedSchema>

export default function CreateGoodsReceivedPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  const form = useForm<GoodsReceivedFormValues>({
    resolver: zodResolver(goodsReceivedSchema),
    defaultValues: {
      purchaseOrderID: "",
      receivedDate: new Date().toISOString().split("T")[0],
      notes: "",
      goodsReceivedDetails: [],
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
      form.setValue("goodsReceivedDetails", order.purchaseOrderDetails.map(detail => ({
        productID: detail.productID,
        quantity: detail.quantity - detail.receivedQuantity,
        unitPrice: detail.product.unitPrice,
      })))
    }
  }

  const handleQuantityChange = (index: number, value: number) => {
    const details = [...form.getValues("goodsReceivedDetails")]
    if (selectedOrder) {
      const maxQuantity = selectedOrder.purchaseOrderDetails[index].quantity - 
                         selectedOrder.purchaseOrderDetails[index].receivedQuantity
      details[index].quantity = Math.min(value, maxQuantity)
      form.setValue("goodsReceivedDetails", details)
    }
  }

  const onSubmit = async (data: GoodsReceivedFormValues) => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/goodsreceived", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Không thể tạo phiếu nhập hàng")
      }

      const { addNotification } = useNotification();
addNotification({
        id: uuidv4(),
        title: "Tạo phiếu nhập",
        message: `Phiếu nhập mới đã được tạo thành công!`,
        date: new Date(),
        read: false,
      });
      toast.success("Tạo phiếu nhập thành công!")
      router.push("/dashboard/goods-received")
    } catch (error) {
      console.error("Lỗi khi tạo phiếu nhập hàng:", error)
      toast.error("Không thể tạo phiếu nhập hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Tạo Phiếu Nhập Hàng</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Phiếu Nhập</CardTitle>
          <CardDescription>Nhập thông tin chi tiết về phiếu nhập hàng mới</CardDescription>
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
            </div>

            {selectedOrder && (
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
                      {selectedOrder.purchaseOrderDetails.map((detail, index) => (
                        <TableRow key={detail.productID}>
                          <TableCell>{detail.product.productName}</TableCell>
                          <TableCell>{detail.product.unit}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(detail.product.unitPrice)}
                          </TableCell>
                          <TableCell>{detail.quantity}</TableCell>
                          <TableCell>{detail.receivedQuantity}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={detail.quantity - detail.receivedQuantity}
                              value={form.watch(`goodsReceivedDetails.${index}.quantity`)}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(
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
                {loading ? "Đang tạo..." : "Tạo phiếu nhập"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 