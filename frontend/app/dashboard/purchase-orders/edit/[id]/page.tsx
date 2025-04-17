"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, Loader2, Save, Mail, CheckCircle, XCircle, Package, FileText } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Định nghĩa interfaces
interface Supplier {
  supplierID: number
  supplierName: string
}

interface Product {
  productID: number
  productName: string
  unit: string
  stockQuantity: number
}

interface PurchaseOrderItem {
  poDetailID: number
  purchaseOrderID: string
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

// Định nghĩa schema cho form
const orderItemSchema = z.object({
  id: z.string().optional(),
  productID: z.string({
    required_error: "Vui lòng chọn sản phẩm",
  }),
  quantity: z
    .number({
      required_error: "Vui lòng nhập số lượng",
    })
    .min(1, "Số lượng phải lớn hơn 0"),
  unitPrice: z
    .number({
      required_error: "Vui lòng nhập đơn giá",
    })
    .min(0, "Đơn giá không được âm"),
  totalPrice: z.number().optional(),
})

const formSchema = z.object({
  supplierID: z.string({
    required_error: "Vui lòng chọn nhà cung cấp",
  }),
  orderDate: z.date({
    required_error: "Vui lòng chọn ngày đặt hàng",
  }),
  expectedDeliveryDate: z.date({
    required_error: "Vui lòng chọn ngày giao hàng dự kiến",
  }),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
})

type FormValues = z.infer<typeof formSchema>

export default function EditPurchaseOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailContent, setEmailContent] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isReceiving, setIsReceiving] = useState(false)
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
  const [unitPrices, setUnitPrices] = useState<{ [key: number]: number }>({})
  const [receivedQuantities, setReceivedQuantities] = useState<{ [key: number]: number }>({})
  const [returnQuantities, setReturnQuantities] = useState<{ [key: number]: number }>({})
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(true) // Add this state to control editing mode
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [showReceiveDialog, setShowReceiveDialog] = useState(false)

  // Khởi tạo form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierID: "",
      orderDate: new Date(),
      expectedDeliveryDate: new Date(),
      notes: "",
      items: [{ productID: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
    },
  })

  // Sử dụng useFieldArray để quản lý mảng các sản phẩm
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // Lấy dữ liệu nhà cung cấp, sản phẩm và đơn hàng khi component được tải
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Lấy dữ liệu đơn hàng
        const orderResponse = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
        if (!orderResponse.ok) {
          throw new Error("Không thể tải dữ liệu đơn hàng")
        }
        const orderData = await orderResponse.json()
        console.log("Order Data:", orderData)
        setPurchaseOrder(orderData)
        setSelectedSupplier(orderData.supplier)

        // Lấy dữ liệu nhà cung cấp
        const suppliersResponse = await fetch("http://localhost:5190/api/supplier")
        if (!suppliersResponse.ok) {
          throw new Error("Không thể tải dữ liệu nhà cung cấp")
        }
        const suppliersData = await suppliersResponse.json()
        console.log("Suppliers Data:", suppliersData)
        setSuppliers(suppliersData)

        // Lấy dữ liệu sản phẩm
        const productsResponse = await fetch("http://localhost:5190/api/product")
        if (!productsResponse.ok) {
          throw new Error("Không thể tải dữ liệu sản phẩm")
        }
        const productsData = await productsResponse.json()
        console.log("Products Data:", productsData)
        setProducts(productsData)

        // Đặt giá trị cho form
        if (orderData) {
          // Format lại dữ liệu từ purchaseOrderDetails
          const formattedItems = orderData.purchaseOrderDetails.map((detail: PurchaseOrderItem) => ({
            id: detail.poDetailID.toString(),
            productID: detail.productID.toString(),
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            totalPrice: detail.totalPrice,
          }))

          console.log("Formatted Items:", formattedItems)

          form.reset({
            supplierID: orderData.supplierID.toString(),
            orderDate: new Date(orderData.orderDate),
            expectedDeliveryDate: new Date(orderData.expectedDeliveryDate),
            notes: orderData.notes || "",
            items: formattedItems,
          })

          setTotalAmount(orderData.totalAmount)

          // Khởi tạo số lượng và đơn giá cho mỗi sản phẩm
          const initialQuantities = orderData.purchaseOrderDetails.reduce((acc: { [key: number]: number }, item: PurchaseOrderItem) => {
            acc[item.productID] = item.quantity
            return acc
          }, {})
          setQuantities(initialQuantities)

          const initialUnitPrices = orderData.purchaseOrderDetails.reduce((acc: { [key: number]: number }, item: PurchaseOrderItem) => {
            acc[item.productID] = item.unitPrice
            return acc
          }, {})
          setUnitPrices(initialUnitPrices)

          const initialReceivedQuantities = orderData.purchaseOrderDetails.reduce((acc: { [key: number]: number }, item: PurchaseOrderItem) => {
            acc[item.productID] = item.receivedQuantity || 0
            return acc
          }, {})
          setReceivedQuantities(initialReceivedQuantities)

          const initialReturnQuantities = orderData.purchaseOrderDetails.reduce((acc: { [key: number]: number }, item: PurchaseOrderItem) => {
            acc[item.productID] = item.returnQuantity || 0
            return acc
          }, {})
          setReturnQuantities(initialReturnQuantities)

          // Đọc số lượng đã nhận từ URL
          const searchParams = new URLSearchParams(window.location.search)
          const receivedParams = searchParams.getAll('received')
          if (receivedParams.length > 0) {
            const newReceivedQuantities = { ...initialReceivedQuantities }
            receivedParams.forEach(param => {
              const [poDetailID, quantity] = param.split(':')
              const detail = orderData.purchaseOrderDetails.find((d: PurchaseOrderItem) => d.poDetailID === parseInt(poDetailID))
              if (detail) {
                newReceivedQuantities[detail.productID] = (newReceivedQuantities[detail.productID] || 0) + parseInt(quantity)
              }
            })
            setReceivedQuantities(newReceivedQuantities)
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  // Theo dõi thay đổi form
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(true)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Tính toán tổng giá trị của một sản phẩm
  const calculateItemTotal = (index: number, quantity: number, unitPrice: number) => {
    const total = quantity * unitPrice
    form.setValue(`items.${index}.totalPrice`, total)
    return total
  }

  // Cập nhật tổng giá trị đơn hàng khi form thay đổi
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.includes("items") || type === "change") {
        const items = form.getValues("items")
        const total = items.reduce((sum, item) => {
          const quantity = item.quantity || 0
          const unitPrice = item.unitPrice || 0
          return sum + quantity * unitPrice
        }, 0)
        setTotalAmount(total)
      }
    })

    return () => subscription.unsubscribe()
  }, [form])

  // Xử lý khi submit form
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      // Format lại dữ liệu items theo đúng cấu trúc API
      const updatedItems = data.items.map((item) => {
        // Tìm thông tin chi tiết sản phẩm
        const existingDetail = purchaseOrder?.purchaseOrderDetails.find(
          detail => detail.productID === parseInt(item.productID)
        )

        return {
          poDetailID: item.id ? parseInt(item.id) : 0,
          purchaseOrderID: params.id,
          productID: parseInt(item.productID),
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          totalPrice: (item.quantity || 0) * (item.unitPrice || 0),
          receivedQuantity: existingDetail?.receivedQuantity || 0,
          returnQuantity: existingDetail?.returnQuantity || 0
        }
      })

      // Tính tổng giá trị đơn hàng
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)

      // Format dữ liệu theo đúng cấu trúc API yêu cầu
      const orderData = {
        purchaseOrderID: params.id,
        supplierID: parseInt(data.supplierID),
        orderDate: data.orderDate.toISOString(),
        expectedDeliveryDate: data.expectedDeliveryDate.toISOString(),
        totalAmount: totalAmount,
        status: purchaseOrder?.status || "Processing",
        approvedBy: purchaseOrder?.approvedBy || "",
        notes: data.notes || "",
        purchaseOrderDetails: updatedItems
      }

      console.log("Update Data:", orderData)

      const response = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        if (errorData.errors) {
          // Log chi tiết lỗi validation
          Object.keys(errorData.errors).forEach(key => {
            console.error(`Validation error on ${key}:`, errorData.errors[key])
          })
        }
        throw new Error(errorData.message || "Không thể cập nhật đơn hàng")
      }

      // Hiển thị thông báo thành công
      toast.success(`Đơn hàng ${params.id} đã được cập nhật thành công với tổng giá trị ${totalAmount.toLocaleString('vi-VN')} VND.`)
      setHasChanges(false)

      // Tải lại dữ liệu đơn hàng sau khi cập nhật
      const orderResponse = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
      if (orderResponse.ok) {
        const orderData = await orderResponse.json()
        setPurchaseOrder(orderData)
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error)
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Xử lý khi chọn sản phẩm
  const handleProductChange = (productID: string, index: number) => {
    const product = products.find((p) => p.productID.toString() === productID)
    if (product) {
      // Kiểm tra xem sản phẩm có trong purchaseOrderDetails không
      const existingDetail = purchaseOrder?.purchaseOrderDetails.find(
        (detail) => detail.productID.toString() === productID
      )

      if (existingDetail) {
        // Nếu có trong purchaseOrderDetails thì lấy giá và số lượng từ đó
        form.setValue(`items.${index}.quantity`, existingDetail.quantity)
        form.setValue(`items.${index}.unitPrice`, existingDetail.unitPrice)
        form.setValue(`items.${index}.totalPrice`, existingDetail.totalPrice)
      } else {
        // Nếu là sản phẩm mới, đặt số lượng mặc định là 1 và giá là 0
        form.setValue(`items.${index}.quantity`, 1)
        form.setValue(`items.${index}.unitPrice`, 0)
        form.setValue(`items.${index}.totalPrice`, 0)
      }

      // Cập nhật tổng giá trị đơn hàng
      const items = form.getValues("items")
      const newTotalAmount = items.reduce((sum, item) => {
        return sum + ((item.quantity || 0) * (item.unitPrice || 0))
      }, 0)
      setTotalAmount(newTotalAmount)
    }
  }

  // Xử lý khi thay đổi số lượng
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const quantity = Number.parseInt(e.target.value) || 0
    const unitPrice = form.getValues(`items.${index}.unitPrice`) || 0

    form.setValue(`items.${index}.quantity`, quantity)
    calculateItemTotal(index, quantity, unitPrice)
  }

  // Xử lý khi thay đổi đơn giá
  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const unitPrice = Number.parseFloat(e.target.value) || 0
    const quantity = form.getValues(`items.${index}.quantity`) || 0

    form.setValue(`items.${index}.unitPrice`, unitPrice)
    calculateItemTotal(index, quantity, unitPrice)
  }

  // Xử lý khi hủy chỉnh sửa
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      router.push("/dashboard/purchase-orders")
    }
  }

  // Lấy class cho trạng thái
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
      case "Đang nhận hàng":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleSendEmailClick = () => {
    if (!purchaseOrder) return

    const content = `
Kính gửi ${purchaseOrder.supplier.supplierName},

Đơn đặt hàng: ${purchaseOrder.purchaseOrderID}
Ngày đặt: ${format(new Date(purchaseOrder.orderDate), "dd/MM/yyyy", { locale: vi })}
Ngày giao dự kiến: ${format(new Date(purchaseOrder.expectedDeliveryDate), "dd/MM/yyyy", { locale: vi })}
Tổng giá trị: ${new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(purchaseOrder.totalAmount)}

Chi tiết đơn hàng:
${purchaseOrder.purchaseOrderDetails.map(detail =>
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
    if (!purchaseOrder) return

    try {
      setIsSendingEmail(true)
      const response = await fetch(`http://localhost:5190/api/purchaseorder/${purchaseOrder.purchaseOrderID}/send-email`, {
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

      // Tải lại dữ liệu đơn hàng
      const orderResponse = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
      if (orderResponse.ok) {
        const orderData = await orderResponse.json()
        setPurchaseOrder(orderData)
      }
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
          ...purchaseOrder,
          status: "Đã xác nhận"
        })
      })

      if (!response.ok) {
        throw new Error("Không thể xác nhận đơn hàng")
      }

      toast.success("Đơn hàng đã được xác nhận thành công!")

      // Tải lại dữ liệu đơn hàng
      const orderResponse = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
      if (orderResponse.ok) {
        const orderData = await orderResponse.json()
        setPurchaseOrder(orderData)
      }
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
          ...purchaseOrder,
          status: "Đã hủy"
        })
      })

      if (!response.ok) {
        throw new Error("Không thể hủy đơn hàng")
      }

      toast.success("Đơn hàng đã được hủy thành công!")
      setShowCancelDialog(false)

      // Tải lại dữ liệu đơn hàng
      const orderResponse = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
      if (orderResponse.ok) {
        const orderData = await orderResponse.json()
        setPurchaseOrder(orderData)
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error)
      toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setIsCancelling(false)
    }
  }

  const handleReceiveProducts = async () => {
    router.push(`/dashboard/purchase-orders/receive/${params.id}`)
  }
  const handleCreateInvoice = async () => {
    router.push(`/dashboard/purchase-orders/invoices/${params.id}`)
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
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/50" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa đơn hàng</h1>
          {purchaseOrder && (
            <Badge className={getStatusClass(purchaseOrder.status)}>{purchaseOrder.status}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Nút Tạo hóa đơn */}
          {(purchaseOrder?.status === "Đang nhận hàng" || purchaseOrder?.status === "Đã nhận hàng") && (
            <Button
              variant={purchaseOrder?.status === "Đang nhận hàng" ? "outline" : "default"}
              onClick={handleCreateInvoice}
              disabled={isCreatingInvoice}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isCreatingInvoice ? "Đang tạo..." : "Tạo hóa đơn"}
            </Button>
          )}

          {/* Nút Gửi email */}
          {purchaseOrder?.status !== "Đã xác nhận" &&  purchaseOrder?.status !== "Đang nhận hàng" && purchaseOrder?.status !== "Đã nhận hàng" && (
            <Button
              variant={purchaseOrder?.status === "Đã gửi email" ? "outline" : "default"}
              onClick={handleSendEmailClick}
              disabled={isSendingEmail || purchaseOrder?.status === "Đã hủy" } 
            >
              <Mail className="mr-2 h-4 w-4" />
              {isSendingEmail ? "Đang gửi..." : purchaseOrder?.status === "Đã gửi email" ? "Gửi lại email" : "Gửi email"}
            </Button>
          )}

          {/* Nút Nhận sản phẩm / Tiếp tục nhận */}
          {(purchaseOrder?.status === "Đã xác nhận" || purchaseOrder?.status === "Đang nhận hàng") && (
            <Button
              variant="default"
              onClick={handleReceiveProducts}
              disabled={isReceiving}
            >
              <Package className="mr-2 h-4 w-4" />
              {isReceiving ? "Đang nhận..." : purchaseOrder?.status === "Đang nhận hàng" ? "Tiếp tục nhận" : "Nhận sản phẩm"}
            </Button>
          )}

          {/* Nút Xác nhận đơn hàng */}
          {!["Đã xác nhận", "Đang nhận hàng", "Đã nhận hàng"].includes(purchaseOrder?.status || "") && (
            <Button
              variant={purchaseOrder?.status === "Đã gửi email" ? "default" : "outline"}
              onClick={handleConfirmOrder}
              disabled={isConfirming || purchaseOrder?.status === "Đã xác nhận" || purchaseOrder?.status === "Đã hủy"}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isConfirming ? "Đang xác nhận..." : "Xác nhận đơn hàng"}
            </Button>
          )}

          {/* Nút Hủy đơn hàng */}
          <Button
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            disabled={isCancelling || purchaseOrder?.status === "Đã hủy"}
            className="text-red-500 hover:text-red-700"
          >
            <XCircle className="mr-2 h-4 w-4" />
            {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
          </Button>
        </div>

      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-muted/50 rounded-t-lg">
                <CardTitle className="text-xl text-primary">Thông tin đơn hàng</CardTitle>
                <CardDescription>Cập nhật thông tin cơ bản cho đơn hàng này</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <FormField
                  control={form.control}
                  name="supplierID"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Nhà cung cấp</FormLabel>
                      {suppliers && suppliers.length > 0 && (
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 border-input focus:ring-1 focus:ring-primary">
                              <SelectValue placeholder="Chọn nhà cung cấp">
                                {suppliers.find(s => s.supplierID.toString() === field.value)?.supplierName || "Chọn nhà cung cấp"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.supplierID} value={supplier.supplierID.toString()}>
                                {supplier.supplierName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="orderDate"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">Ngày đặt hàng</FormLabel>
                        <FormControl>
                          <DatePicker date={field.value} onSelect={field.onChange} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedDeliveryDate"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">Ngày giao hàng dự kiến</FormLabel>
                        <FormControl>
                          <DatePicker date={field.value} onSelect={field.onChange} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Thông tin bổ sung về đơn hàng này"
                          className="min-h-[100px] resize-none focus:ring-1 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-muted/50 rounded-t-lg">
                <CardTitle className="text-xl text-primary">Sản phẩm</CardTitle>
                <CardDescription>Cập nhật sản phẩm trong đơn hàng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="font-medium">Sản phẩm</TableHead>
                        <TableHead className="font-medium">Đơn vị</TableHead>
                        <TableHead className="font-medium">Đơn giá</TableHead>
                        <TableHead className="font-medium">Số lượng đặt</TableHead>
                        <TableHead className="font-medium">Số lượng đã nhận</TableHead>
                        <TableHead className="font-medium">Thành tiền</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.productID`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select
                                      value={field.value.toString()}
                                      onValueChange={(value) => handleProductChange(value, index)}
                                      disabled={!isEditing}
                                    >
                                      <SelectTrigger className="h-9 w-[200px] focus:ring-1 focus:ring-primary">
                                        <SelectValue>
                                          {products.find((product) => product.productID.toString() === field.value)?.productName || "Chọn sản phẩm"}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {products.map((product) => (
                                          <SelectItem key={product.productID} value={product.productID.toString()}>
                                            {product.productName} - {product.unit} - Tồn kho: {product.stockQuantity}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            {products.find((p) => p.productID.toString() === form.getValues(`items.${index}.productID`))?.unit || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1000"
                                      {...field}
                                      disabled={!isEditing}
                                      onChange={(e) => handleUnitPriceChange(e, index)}
                                      className="h-9 w-32 focus:ring-1 focus:ring-primary"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...field}
                                      disabled={!isEditing}
                                      onChange={(e) => handleQuantityChange(e, index)}
                                      className="h-9 w-24 focus:ring-1 focus:ring-primary"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {purchaseOrder?.purchaseOrderDetails[index]?.receivedQuantity || 0}
                          </TableCell>
                          <TableCell className="font-medium">
                            {((form.getValues(`items.${index}.quantity`) || 0) * (form.getValues(`items.${index}.unitPrice`) || 0)).toLocaleString("vi-VN")} VND
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1 || !isEditing}
                              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  onClick={() => append({ productID: "", quantity: 1, unitPrice: 0, totalPrice: 0 })}
                  className="w-full border-dashed hover:border-primary hover:bg-primary/5"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm sản phẩm
                </Button>

                <div className="flex justify-between pt-4 font-medium text-lg border-t">
                  <span>Tổng giá trị:</span>
                  <span className="text-primary font-bold">{totalAmount.toLocaleString('vi-VN')} VND</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/20 rounded-b-lg">
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn hủy?</AlertDialogTitle>
            <AlertDialogDescription>
              Các thay đổi bạn đã thực hiện sẽ không được lưu. Bạn có chắc chắn muốn thoát?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/dashboard/purchase-orders")}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hủy thay đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </div>
  )
}
