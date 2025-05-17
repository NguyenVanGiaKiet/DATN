"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, Plus, Trash2, Loader2, Save, Mail } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import toast from "react-hot-toast"
import { useNotification } from "@/components/notification-context";
import { v4 as uuidv4 } from "uuid";
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

// Định nghĩa schema cho form
const orderItemSchema = z.object({
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
  unit: z.string({
    required_error: "Vui lòng nhập đơn vị",
  }),

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

export default function CreatePurchaseOrderPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Lấy hàm addNotification từ context
  const { addNotification } = useNotification();

  // Khởi tạo form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  // Lấy dữ liệu nhà cung cấp và sản phẩm khi component được tải
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Lấy dữ liệu nhà cung cấp
        const suppliersResponse = await fetch("http://localhost:5190/api/supplier")
        if (!suppliersResponse.ok) {
          throw new Error("Không thể tải dữ liệu nhà cung cấp")
        }
        const suppliersData = await suppliersResponse.json()
        setSuppliers(suppliersData)

        // Lấy dữ liệu sản phẩm
        const productsResponse = await fetch("http://localhost:5190/api/product")
        if (!productsResponse.ok) {
          throw new Error("Không thể tải dữ liệu sản phẩm")
        }
        const productsData = await productsResponse.json()
        setProducts(productsData)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const handleSendEmail = async () => {
    if (!createdOrderId) return;

    try {
      setIsSendingEmail(true);
      const response = await fetch(`http://localhost:5190/api/purchaseorder/${createdOrderId}/send-email`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi gửi email');
      }

      const result = await response.json();
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Xử lý khi submit form
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const orderItems = data.items.map((item) => ({
        productID: parseInt(item.productID),
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        totalPrice: (item.quantity || 0) * (item.unitPrice || 0)
      }))

      const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)

      const orderData = {
        supplierID: parseInt(data.supplierID),
        orderDate: data.orderDate.toISOString(),
        expectedDeliveryDate: data.expectedDeliveryDate.toISOString(),
        totalAmount: totalAmount,
        notes: data.notes || "",
        purchaseOrderDetails: orderItems
      }

      console.log("Create Data:", orderData)

      const response = await fetch("http://localhost:5190/api/purchaseorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(errorData.message || "Không thể tạo đơn hàng")
      }

      const result = await response.json()
      setCreatedOrderId(result.purchaseOrderID)

      // Gửi notification lên NotificationCenter
      addNotification({
        id: uuidv4(),
        title: "Tạo đơn hàng",
        message: `Đơn hàng #${result.purchaseOrderID} đã được tạo thành công với tổng giá trị ${totalAmount.toLocaleString('vi-VN')} VND.`,
        date: new Date(),
        read: false,
      });

      toast.success(`Đơn hàng ${result.purchaseOrderID} đã được tạo thành công với tổng giá trị ${totalAmount.toLocaleString('vi-VN')} VND.`, {
        duration: 5000
      })

      setHasChanges(false)
      router.push(`/dashboard/purchase-orders/edit/${result.purchaseOrderID}`)
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error)
      toast.error(error instanceof Error ? error.message : "Không thể tạo đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Xử lý khi chọn sản phẩm
  const handleProductChange = (productID: string, index: number) => {
    const product = products.find((p) => p.productID.toString() === productID)
    if (product) {
      // Đặt số lượng mặc định là 1, đơn vị theo sản phẩm, giá là 0
      form.setValue(`items.${index}.quantity`, 1)
      form.setValue(`items.${index}.unit`, product.unit)
      form.setValue(`items.${index}.unitPrice`, 0)
      form.setValue(`items.${index}.totalPrice`, 0)

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

    if (quantity < 0) {
      toast.error("Số lượng không được âm")
      return
    }

    form.setValue(`items.${index}.quantity`, quantity)
    calculateItemTotal(index, quantity, unitPrice)
  }

  // Xử lý khi thay đổi đơn giá
  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const unitPrice = Number.parseFloat(e.target.value) || 0
    const quantity = form.getValues(`items.${index}.quantity`) || 0

    if (unitPrice < 0) {
      toast.error("Đơn giá không được âm")
      return
    }

    form.setValue(`items.${index}.unitPrice`, unitPrice)
    calculateItemTotal(index, quantity, unitPrice)
  }

  // Xử lý khi hủy tạo mới
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      router.push("/dashboard/purchase-orders")
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/50" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Tạo đơn hàng mới</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-muted/50 rounded-t-lg">
                <CardTitle className="text-xl text-primary">Thông tin đơn hàng</CardTitle>
                <CardDescription>Nhập thông tin cơ bản cho đơn hàng mới</CardDescription>
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
                <CardDescription>Thêm sản phẩm vào đơn hàng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="font-medium">Sản phẩm</TableHead>
                        <TableHead className="font-medium">Số lượng</TableHead>
                        <TableHead className="font-medium">Đơn vị</TableHead>
                        <TableHead className="font-medium">Đơn giá</TableHead>
                        <TableHead className="font-medium">Thành tiền</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id} className="hover:bg-muted/20">
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.productID`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value)
                                      handleProductChange(value, index)
                                    }}
                                    defaultValue={field.value}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-9 border-input focus:ring-1 focus:ring-primary">
                                        <SelectValue placeholder="Chọn sản phẩm">
                                          {products.find((product) => product.productID.toString() === field.value)?.productName || "Chọn sản phẩm"}
                                        </SelectValue>
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {products.map((product) => (
                                        <SelectItem key={product.productID} value={product.productID.toString()}>
                                          {product.productName} - {product.unit} - Tồn kho: {product.stockQuantity}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                                      onChange={(e) => handleQuantityChange(e, index)}
                                      className="h-9 focus:ring-1 focus:ring-primary"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          {/* Đơn vị */}
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.unit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      className="h-9 focus:ring-1 focus:ring-primary"
                                      placeholder="Đơn vị"
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
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1000"
                                      {...field}
                                      onChange={(e) => handleUnitPriceChange(e, index)}
                                      className="h-9 focus:ring-1 focus:ring-primary"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {(form.getValues(`items.${index}.quantity`) || 0) * (form.getValues(`items.${index}.unitPrice`) || 0)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
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
                  onClick={() => append({ productID: "", quantity: 1, unit: "", unitPrice: 0, totalPrice: 0 })}
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
                <div className="flex items-center gap-2 justify-end">
                  <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Tạo đơn hàng
                      </>
                    )}
                  </Button>
                  {createdOrderId && (
                    <Button
                      variant="outline"
                      onClick={handleSendEmail}
                      disabled={isSendingEmail}
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Gửi email
                        </>
                      )}
                    </Button>
                  )}
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
    </div>
  )
}
