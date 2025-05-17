"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import toast from "react-hot-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Schema cho form chính
const formSchema = z.object({
  purchaseOrderID: z.string({
    required_error: "Vui lòng chọn đơn hàng",
  }),
  returnDate: z.date({
    required_error: "Vui lòng chọn ngày trả hàng",
  }),
  returnReason: z.string({
    required_error: "Vui lòng chọn lý do trả hàng",
  }),
  processedBy: z
    .string({
      required_error: "Vui lòng nhập người xử lý",
    })
    .min(3, {
      message: "Tên người xử lý phải có ít nhất 3 ký tự",
    }),
})

type FormValues = z.infer<typeof formSchema>

interface PurchaseOrderDetail {
  poDetailID: number
  productID: number
  product: {
    productName: string
    unit: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity: number
  returnQuantity: number
  availableForReturn?: number
}

interface PurchaseOrder {
  purchaseOrderID: string
  supplier: {
    supplierName: string
  }
  orderDate: string
  expectedDeliveryDate: string
  totalAmount: number
  status: string
  purchaseOrderDetails: PurchaseOrderDetail[]
  invoiceID?: string
}

interface ReturnToSupplier {
  returnToSupplierID: string
  purchaseOrderID: string
  productID: number
  productName?: string
  unit?: string
  returnQuantity: number
  receivedQuantity?: number
  availableForReturn?: number
  returnDate: string
  returnReason: string
  processedBy: string
}

interface ReturnableProduct {
  productID: number
  productName: string
  unit: string
  receivedQuantity: number
  returnQuantity: number
  availableForReturn: number
  currentReturnAmount: number // Số lượng đang muốn trả
}

export default function CreateReturnPage() {
  const router = useRouter()
  const params = useParams()
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [returnToSuppliers, setReturnToSuppliers] = useState<ReturnToSupplier[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [returnableProducts, setReturnableProducts] = useState<ReturnableProduct[]>([])
  const [hasValidReturnQuantity, setHasValidReturnQuantity] = useState(false)

  // Khởi tạo form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      returnDate: new Date(),
      returnReason: "",
      processedBy: "",
    },
  })

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      try {
        setIsLoading(true)
        if (!params || !params.id) {
          throw new Error("Invalid parameters")
        }
        const response = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
        if (!response.ok) {
          throw new Error("Không thể tải thông tin đơn hàng")
        }
        const data = await response.json()
        setPurchaseOrder(data)
        
        // Tự động cập nhật purchaseOrderID trong form
        form.setValue("purchaseOrderID", data.purchaseOrderID)
      } catch (error) {
        console.error("Lỗi khi tải thông tin đơn hàng:", error)
        toast.error("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }

    if (params && params.id) {
      fetchPurchaseOrder()
    }
  }, [params?.id, form])

  useEffect(() => {
    const fetchReturnToSupplier = async () => {
      try {
        if (!params || !params.id) return

        const response = await fetch(`http://localhost:5190/api/ReturnToSupplier/order/${params.id}`)
        if (!response.ok) {
          throw new Error("Không thể tải thông tin trả hàng")
        }
        const data = await response.json()
        if (Array.isArray(data)) {
          setReturnToSuppliers(data)
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin trả hàng:", error)
        toast.error(error instanceof Error ? error.message : "Không thể tải thông tin trả hàng")
      }
    }

    fetchReturnToSupplier()
  }, [params?.id])

  // Số lượng có thể trả đúng bằng số lượng đã nhận
  useEffect(() => {
    if (purchaseOrder) {
      const products = purchaseOrder.purchaseOrderDetails.map(detail => ({
  productID: detail.productID,
  productName: detail.product.productName,
  unit: detail.product.unit,
  receivedQuantity: detail.receivedQuantity,
  returnQuantity: 0, // Thêm trường này với giá trị mặc định
  availableForReturn: detail.receivedQuantity, // Hoặc giá trị phù hợp nếu khác với receivedQuantity
  currentReturnAmount: 0 // Khởi tạo số lượng trả ban đầu là 0
})).filter(product => product.receivedQuantity > 0) // Chỉ hiển thị những sản phẩm đã nhận
setReturnableProducts(products)
    }
  }, [purchaseOrder])

  // Kiểm tra xem có sản phẩm nào được chọn để trả không
  useEffect(() => {
    const hasValid = returnableProducts.some(product => 
      product.currentReturnAmount > 0 && 
      product.currentReturnAmount <= product.receivedQuantity
    )
    setHasValidReturnQuantity(hasValid)
  }, [returnableProducts])

  // Cập nhật số lượng trả hàng
  const updateReturnQuantity = (productID: number, quantity: number) => {
    // Đảm bảo số lượng không âm và không vượt quá số lượng đã nhận
    const validatedQuantity = Math.max(0, Math.min(quantity, 
      returnableProducts.find(p => p.productID === productID)?.receivedQuantity || 0
    ))
    setReturnableProducts(prev => 
      prev.map(product => 
        product.productID === productID 
          ? { ...product, currentReturnAmount: validatedQuantity } 
          : product
      )
    )
    // Trigger validate để cập nhật lại formState.isValid
    form.trigger()
  }

  // Xử lý submit form
const onSubmit = async (data: FormValues) => {
  try {
    setIsSubmitting(true)
    // Lọc các sản phẩm có số lượng trả > 0
    const productsToReturn = returnableProducts.filter(p => p.currentReturnAmount > 0)
    if (productsToReturn.length === 0) {
      toast.error("Vui lòng nhập số lượng trả cho ít nhất một sản phẩm")
      setIsSubmitting(false)
      return
    }
    // Tạo mảng các promise để gửi request trả hàng cho từng sản phẩm
    const returnPromises = productsToReturn.map(product => {
      const returnItem = {
        purchaseOrderID: data.purchaseOrderID,
        productID: product.productID,
        returnQuantity: product.currentReturnAmount,
        returnDate: data.returnDate.toISOString(),
        returnReason: data.returnReason,
        processedBy: data.processedBy
      }
      return fetch("http://localhost:5190/api/ReturnToSupplier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(returnItem)
      })
    })
    // Chờ tất cả các request hoàn thành
    const responses = await Promise.all(returnPromises)
    // Kiểm tra kết quả
    const hasError = responses.some(response => !response.ok)
    if (hasError) {
      throw new Error("Có lỗi xảy ra khi tạo phiếu trả hàng")
    }
    toast.success("Tạo phiếu trả hàng thành công")
    if (!params || !params.id) return
    // Gọi API cập nhật lại số lượng hàng nhận của đơn mua hàng
    await fetch(`http://localhost:5190/api/purchaseorder/update-received-quantity/${params.id}`, {
      method: "PUT"
    });
    // Điều hướng sang trang edit đơn mua hàng
    router.push(`/dashboard/purchase-orders/edit/${params.id}`)
  } catch (error) {
    console.error("Lỗi khi tạo phiếu trả hàng:", error)
    toast.error(error instanceof Error ? error.message : "Không thể tạo phiếu trả hàng")
  } finally {
    setIsSubmitting(false)
  }
}

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        <h1 className="text-3xl font-bold tracking-tight">Tạo phiếu trả hàng</h1>
      </div>

      <Alert>
        <AlertTitle>Lưu ý quan trọng</AlertTitle>
        <AlertDescription>
          Phiếu trả hàng chỉ có thể được tạo cho các sản phẩm đã nhận từ đơn hàng. Số lượng trả không thể vượt quá số
          lượng đã nhận còn lại có thể trả.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin phiếu trả hàng</CardTitle>
                <CardDescription>Nhập thông tin cơ bản cho phiếu trả hàng này</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="purchaseOrderID"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Đơn hàng</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn đơn hàng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {purchaseOrder && (
                            <SelectItem value={purchaseOrder.purchaseOrderID}>
                              {purchaseOrder.purchaseOrderID} - {purchaseOrder.supplier.supplierName}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="returnDate"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Ngày trả hàng</FormLabel>
                      <FormControl>
                        <DatePicker date={field.value} onSelect={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="returnReason"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Lý do trả hàng</FormLabel>
                      <Select onValueChange={value => { field.onChange(value); form.trigger(); }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn lý do trả hàng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sản phẩm bị lỗi">Sản phẩm bị lỗi</SelectItem>
                          <SelectItem value="Sản phẩm không đúng mô tả">Sản phẩm không đúng mô tả</SelectItem>
                          <SelectItem value="Sản phẩm bị hư hỏng khi vận chuyển">
                            Sản phẩm bị hư hỏng khi vận chuyển
                          </SelectItem>
                          <SelectItem value="Sản phẩm không đúng số lượng">Sản phẩm không đúng số lượng</SelectItem>
                          <SelectItem value="Khác">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="processedBy"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Người xử lý</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên người xử lý trả hàng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn hàng</CardTitle>
                <CardDescription>Chi tiết đơn hàng và sản phẩm có thể trả</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchaseOrder ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nhà cung cấp</p>
                        <p className="text-base">{purchaseOrder.supplier.supplierName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ngày đặt hàng</p>
                        <p className="text-base">
                          {new Date(purchaseOrder.orderDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                        <p className="text-base">{purchaseOrder.status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tổng giá trị</p>
                        <p className="text-base">{purchaseOrder.totalAmount.toLocaleString("vi-VN")} VND</p>
                      </div>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead className="text-center">Đã nhận</TableHead>
                            <TableHead className="text-center">Số lượng trả</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {returnableProducts.map((product) => (
                            <TableRow key={product.productID}>
                              <TableCell>{product.productName}</TableCell>
                              <TableCell className="text-center">
                                {product.receivedQuantity} {product.unit}
                              </TableCell>
                              <TableCell className="text-center w-32">
                                <div className="flex items-center gap-1 justify-center">
                                  <Input 
                                    type="number"
                                    min="0"
                                    max={product.availableForReturn}
                                    value={product.currentReturnAmount}
                                    onChange={(e) => updateReturnQuantity(product.productID, Number(e.target.value) || 0)}
                                    className="w-20 text-center"
                                  />
                                  <span className="text-sm ml-1">{product.unit}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {returnableProducts.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4">
                                Không có sản phẩm nào có thể trả
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-40 border rounded-md">
                    <p className="text-muted-foreground">Vui lòng chọn đơn hàng để xem thông tin</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.push(`/dashboard/purchase-orders/edit/${params.id}`)}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    !purchaseOrder || 
                    !hasValidReturnQuantity ||
                    !form.formState.isValid
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Tạo phiếu trả hàng"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}