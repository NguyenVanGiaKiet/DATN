"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Package, CheckCircle} from "lucide-react"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface PurchaseOrderItem {
  poDetailID: number
  productID: number
  product: {
    productID: number
    productName: string
    unit: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity: number
  returnQuantity: number
}

interface PurchaseOrder {
  purchaseOrderID: string
  supplierID: number
  supplier: {
    supplierID: number
    supplierName: string
  }
  orderDate: string
  expectedDeliveryDate: string
  totalAmount: number
  status: string
  approvedBy: string
  notes: string
  purchaseOrderDetails: PurchaseOrderItem[]
}

export default function ReceiveProductsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receivedQuantities, setReceivedQuantities] = useState<{ [key: number]: number }>({})

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu đơn hàng")
        }
        const data = await response.json()
        setPurchaseOrder(data)
        
        // Khởi tạo số lượng nhận cho mỗi sản phẩm
        const initialQuantities = data.purchaseOrderDetails.reduce((acc: { [key: number]: number }, item: PurchaseOrderItem) => {
          acc[item.poDetailID] = item.receivedQuantity || 0
          return acc
        }, {})
        setReceivedQuantities(initialQuantities)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPurchaseOrder()
  }, [params.id])

  const handleQuantityChange = (poDetailID: number, value: string) => {
    const quantity = parseInt(value) || 0
    const item = purchaseOrder?.purchaseOrderDetails.find(detail => detail.poDetailID === poDetailID)
    
    if (item && quantity <= item.quantity) {
      setReceivedQuantities(prev => ({
        ...prev,
        [poDetailID]: quantity
      }))
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      // Kiểm tra xem tất cả số lượng nhận có hợp lệ không
      const isValid = purchaseOrder?.purchaseOrderDetails.every(detail => {
        const receivedQty = receivedQuantities[detail.poDetailID] || 0
        return receivedQty >= 0 && receivedQty <= detail.quantity
      })

      if (!isValid) {
        toast.error("Số lượng nhận không hợp lệ")
        return
      }

      // Cập nhật số lượng nhận và trạng thái đơn hàng
      const response = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}/receive-products`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receivedQuantities,
          status: "Đã nhận hàng"
        })
      })

      if (!response.ok) {
        throw new Error("Không thể cập nhật số lượng nhận")
      }

      // Cập nhật tồn kho cho từng sản phẩm
      for (const detail of purchaseOrder?.purchaseOrderDetails || []) {
        const receivedQty = receivedQuantities[detail.poDetailID] || 0
        if (receivedQty > 0) {
          const updateStockResponse = await fetch(`http://localhost:5190/api/product/${detail.productID}/update-stock`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quantity: receivedQty,
              type: "in"
            })
          })

          if (!updateStockResponse.ok) {
            throw new Error(`Không thể cập nhật tồn kho cho sản phẩm ${detail.product.productName}`)
          }
        }
      }

      toast.success("Đã cập nhật số lượng nhận và tồn kho thành công!")
      router.push("/dashboard/purchase-orders")
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error)
      toast.error("Không thể cập nhật. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
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
      case "Đang giao hàng":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "Đã nhận hàng":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "Đã trả hàng":
        return "bg-orange-100 text-orange-800 border-orange-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/50" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Nhận hàng</h1>
          {purchaseOrder && (
            <Badge className={getStatusClass(purchaseOrder.status)}>{purchaseOrder.status}</Badge>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <CheckCircle className="mr-2 h-4 w-4" />
          {isSubmitting ? "Đang xác nhận..." : "Xác nhận"}
        </Button>
      </div>

      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="bg-muted/50 rounded-t-lg">
          <CardTitle className="text-xl text-primary">Thông tin đơn hàng</CardTitle>
          <CardDescription>Nhập số lượng sản phẩm đã nhận</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mã đơn hàng</p>
              <p className="text-lg font-semibold">{purchaseOrder?.purchaseOrderID}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nhà cung cấp</p>
              <p className="text-lg font-semibold">{purchaseOrder?.supplier.supplierName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ngày đặt hàng</p>
              <p className="text-lg font-semibold">
                {purchaseOrder?.orderDate && format(new Date(purchaseOrder.orderDate), "dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ngày giao dự kiến</p>
              <p className="text-lg font-semibold">
                {purchaseOrder?.expectedDeliveryDate && format(new Date(purchaseOrder.expectedDeliveryDate), "dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-medium">Sản phẩm</TableHead>
                  <TableHead className="font-medium">Đơn vị</TableHead>
                  <TableHead className="font-medium">Số lượng đặt</TableHead>
                  <TableHead className="font-medium">Số lượng nhận</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrder?.purchaseOrderDetails.map((item) => (
                  <TableRow key={item.poDetailID}>
                    <TableCell className="font-medium">{item.product.productName}</TableCell>
                    <TableCell>{item.product.unit}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={receivedQuantities[item.poDetailID] || 0}
                        onChange={(e) => handleQuantityChange(item.poDetailID, e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 