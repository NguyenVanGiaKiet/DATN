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
    contactPerson?: string
    phone?: string
    email?: string
    address?: string
    rating?: number
    paymentTerms?: string
    deliveryTime?: number
    status?: string
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
  const [receiver, setReceiver] = useState("")
  const [remarks, setRemarks] = useState("")

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu đơn hàng")
        }
        const data = await response.json()
        setPurchaseOrder(data)
        
        // Khởi tạo số lượng nhận cho mỗi sản phẩm với giá trị mặc định là 0
        const initialQuantities = data.purchaseOrderDetails.reduce((acc: { [key: number]: number }, item: PurchaseOrderItem) => {
          acc[item.poDetailID] = 0
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
    
    if (item) {
      const remainingQuantity = item.quantity - (item.receivedQuantity || 0)
      if (quantity <= remainingQuantity && quantity >= 0) {
        setReceivedQuantities(prev => ({
          ...prev,
          [poDetailID]: quantity
        }))
      } else {
        toast.error(`Số lượng nhận phải từ 0 đến ${remainingQuantity}`)
      }
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Tính tổng số lượng nhận và đặt
      const totalReceivedQuantity = Object.values(receivedQuantities).reduce((sum, qty) => sum + qty, 0)
      const totalOrderQuantity = purchaseOrder?.purchaseOrderDetails.reduce((sum, detail) => sum + detail.quantity, 0) || 0

      // Xác định trạng thái
      let status = "Completed"
      if (totalReceivedQuantity === 0) {
        status = "Pending"
      } else if (totalReceivedQuantity < totalOrderQuantity) {
        status = "Partial"
      }

      // Kiểm tra dữ liệu bắt buộc
      if (!receiver) {
        toast.error("Vui lòng nhập tên người nhận hàng")
        return
      }

      // Tạo dữ liệu goodsReceived
      const goodsReceivedData = {
        purchaseOrderID: params.id,
        receivedDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        receiver: receiver,
        status: status,
        remarks: remarks,
        receivedQuantities: receivedQuantities
      }

      // Gọi API để tạo GoodsReceived
      const response = await fetch("http://localhost:5190/api/goodsreceived", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goodsReceivedData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Không thể tạo phiếu nhận hàng")
      }

      toast.success("Đã nhận hàng thành công!")
      router.push(`/dashboard/purchase-orders/edit/${params.id}`)
    } catch (error) {
      console.error("Lỗi khi nhận hàng:", error)
      toast.error(error instanceof Error ? error.message : "Không thể nhận hàng. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors"
      case "Đã gửi email":
        return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 transition-colors"
      case "Đã xác nhận":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors"
      case "Đã hủy":
        return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 transition-colors"
      case "Đang giao hàng":
        return "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 transition-colors"
      case "Đã nhận hàng":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 transition-colors"
      case "Đã trả hàng":
        return "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 transition-colors"
      case "Đang nhận hàng":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 transition-colors"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Người nhận hàng</p>
              <Input
                placeholder="Nhập tên người nhận hàng"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Ghi chú</p>
              <Input
                placeholder="Nhập ghi chú (nếu có)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full"
              />
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