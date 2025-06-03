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
import { ArrowLeft, Plus, Trash2, Loader2, Save, Eye } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import toast from "react-hot-toast"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface PurchaseRequest {
  purchaseRequestID: number
  createdDate: string
  requester: string
  department: string
  priority: string
  reason: string
  status: string
  purchaseOrderID: string
  items: {
    productID: number;
    quantity: number;
    unit: string;
    description?: string;
  }[];
}

export default function EditPurchaseRequestPage() {
  const router = useRouter();
  const params = useParams();
  const [products, setProducts] = useState<{ productID: number, productName: string, unit: string, stockQuantity?: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest | null>(null)
  const [purchaseOrderID, setPurchaseOrderID] = useState<string | null>(null)
  const [purchaseOrderStatus, setPurchaseOrderStatus] = useState<string | null>(null)
  const [invoiceID, setInvoiceID] = useState<string | null>(null)
  const PRIORITY_OPTIONS = [
    { value: "Cao", label: "Cao" },
    { value: "Trung bình", label: "Trung bình" },
    { value: "Thấp", label: "Thấp" },
  ];
  const DEPARTMENT_OPTIONS = [
    { value: "IT", label: "IT" },
    { value: "Sales", label: "Sales" },
    { value: "HR", label: "HR" },
    { value: "Finance", label: "Finance" },
    { value: "Production", label: "Production" },
    { value: "Logistics", label: "Logistics" },
    { value: "Marketing", label: "Marketing" },
  ];

  const materialSchema = z.object({
    productID: z.string().min(1, "Chọn sản phẩm"),
    quantity: z
      .number({ required_error: "Nhập số lượng" })
      .min(1, "Số lượng > 0"),
    unit: z.string().min(1, "Nhập đơn vị"),
    description: z.string().optional(),
  });

  const formSchema = z.object({
    createdDate: z.date({ required_error: "Vui lòng chọn ngày giao hàng dự kiến" }),
    requester: z.string().min(1, "Nhập người yêu cầu"),
    department: z.string().min(1, "Nhập bộ phận"),
    priority: z.string().min(1),
    reason: z.string().min(1, "Nhập lý do"),
    items: z.array(materialSchema).min(1, "Thêm ít nhất 1 vật tư"),
  });
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      createdDate: new Date(),
      requester: "",
      department: "",
      priority: "",
      reason: "",
      items: [{ productID: "", quantity: 1, unit: "", description: "" }],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      fetch("http://localhost:5190/api/product").then(res => res.json()),
      fetch(`http://localhost:5190/api/PurchaseRequest/${params.id}`).then(res => res.json()),
      fetch(`http://localhost:5190/api/PurchaseOrder`).then(res => res.json())
    ]).then(([productsData, requestData, ordersData]) => {
      setProducts(productsData || []);
      setPurchaseRequest(requestData)
      form.reset({
        createdDate: requestData.createdDate ? new Date(requestData.createdDate) : new Date(),
        requester: requestData.requester || "",
        department: requestData.department || "",
        priority: requestData.priority || "",
        reason: requestData.reason || "",
        items: (requestData.items || []).map((item: any) => ({
          productID: item.productID?.toString() || "",
          quantity: item.quantity || 1,
          unit: item.unit || "",
          description: item.description || "",
        }))
      });
      // Lấy purchaseOrderID liên quan
      if (ordersData && Array.isArray(ordersData)) {
        const foundOrder = ordersData.find((order: any) => order.purchaseRequestID === requestData.purchaseRequestID);
        if (foundOrder && foundOrder.purchaseOrderID) {
          setPurchaseOrderID(foundOrder.purchaseOrderID);
          setPurchaseOrderStatus(foundOrder.status || null);
          // Nếu có invoices, lấy invoiceID đầu tiên (nếu có)
          if (foundOrder.invoices && Array.isArray(foundOrder.invoices) && foundOrder.invoices.length > 0) {
            setInvoiceID(foundOrder.invoices[0].invoiceID?.toString() || null);
          } else {
            setInvoiceID(null);
          }
        } else {
          setPurchaseOrderID(null);
          setPurchaseOrderStatus(null);
          setInvoiceID(null);
        }
      } else {
        setPurchaseOrderID(null);
        setPurchaseOrderStatus(null);
        setInvoiceID(null);
      }
      setIsLoading(false)
    })
  }, [params.id]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const payload = {
      PurchaseRequestID: Number(params.id),
      CreatedDate: data.createdDate,
      Requester: data.requester,
      Department: data.department,
      Priority: data.priority,
      Reason: data.reason,
      Items: data.items.map(item => ({
        ProductID: Number(item.productID),
        Quantity: Number(item.quantity),
        Unit: item.unit,
        Description: item.description ?? ""
      })),
    };
    console.log(payload);
    try {
      const res = await fetch(`http://localhost:5190/api/PurchaseRequest/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Cập nhật yêu cầu mua hàng thành công!");
        router.push("/dashboard/purchase-requests");
      } else {
        // Cố gắng đọc lỗi từ server
        let errorMessage = "Cập nhật thất bại!";
        try {
          const errorData = await res.json();
          if (errorData && errorData.message) { // Giả sử server trả về lỗi trong trường 'message'
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (e) {
          // Không đọc được JSON, giữ lỗi mặc định
        }
        toast.error(errorMessage);
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý khi chọn sản phẩm
  const handleProductChange = (productID: string, index: number) => {
    const product = products.find((p) => p.productID.toString() === productID)
    if (product) {
      form.setValue(`items.${index}.quantity`, 1)
      form.setValue(`items.${index}.unit`, product.unit)
    }
  }
  // Xử lý khi thay đổi số lượng
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const quantity = Number.parseInt(e.target.value) || 0
    if (quantity < 0) {
      toast.error("Số lượng không được âm")
      return
    }
    form.setValue(`items.${index}.quantity`, quantity)
  }
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đã duyệt":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors"
      case "Không duyệt":
        return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 transition-colors"
      case "Chờ duyệt":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors"
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
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/50" onClick={() => router.push("/dashboard/purchase-requests")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Chỉnh sửa yêu cầu mua hàng
            <span className="text-base text-muted-foreground font-normal">
              {(() => {
                const idStr = params.id?.toString().padStart(4, "0") ?? "";
                let result = `#PR-${idStr}`;
                return result;
              })()}
            </span>
            {purchaseRequest?.purchaseOrderID && (
              <span className="text-base text-muted-foreground font-normal">/ #{purchaseRequest.purchaseOrderID}</span>
            )}
          </h1>

          {purchaseRequest && (
            <Badge className={getStatusClass(purchaseRequest.status)}>{purchaseRequest.status}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {purchaseRequest?.status === "Đã duyệt" && !purchaseOrderID && (
            <Button
              onClick={() => {
                if (purchaseRequest?.items) {
                  const encodedProducts = encodeURIComponent(JSON.stringify(purchaseRequest.items));
                  router.push(`/dashboard/purchase-orders/create?fromPR=${purchaseRequest.purchaseRequestID}&products=${encodedProducts}`);
                } else {
                  router.push(`/dashboard/purchase-orders/create?fromPR=${purchaseRequest?.purchaseRequestID}`);
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo đơn hàng
            </Button>
          )}
          {purchaseRequest?.status === "Đã duyệt" && purchaseOrderID && (
            <Button
              onClick={() => {
                if (purchaseOrderStatus === "Đã xuất hóa đơn" || purchaseOrderStatus === "Đã thanh toán") {
                  if (purchaseOrderID) {
                    router.push(`/dashboard/purchase-orders/invoices/${purchaseOrderID}`)
                  } else {
                    toast.error("Không tìm thấy hóa đơn cho đơn hàng này!");
                  }
                } else {
                  router.push(`/dashboard/purchase-orders/edit/${purchaseOrderID}`)
                }
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              {purchaseOrderStatus === "Đã xuất hóa đơn" || purchaseOrderStatus === "Đã thanh toán" ? "Xem hóa đơn" : "Xem đơn hàng"}
            </Button>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-muted/50 rounded-t-lg">
                <CardTitle className="text-xl text-primary">Thông tin đơn yêu cầu mua hàng</CardTitle>
                <CardDescription>Chỉnh sửa thông tin đơn yêu cầu mua hàng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="grid grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="requester"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">Người yêu cầu</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên người yêu cầu" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">Bộ phận</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn bộ phận" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DEPARTMENT_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="createdDate"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">Ngày tạo</FormLabel>
                        <FormControl>
                          <DatePicker date={field.value} onSelect={field.onChange} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">Độ ưu tiên</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn độ ưu tiên" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Lý do</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập lý do" {...field} />
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
                <CardDescription>Chỉnh sửa danh sách sản phẩm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="font-medium">Sản phẩm</TableHead>
                        <TableHead className="font-medium">Số lượng</TableHead>
                        <TableHead className="font-medium">Đơn vị</TableHead>
                        <TableHead className="font-medium">Mô tả</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id} className="hover:bg-muted/20">
                          <TableCell className="w-[200px]">
                            <FormField
                              control={form.control}
                              name={`items.${index}.productID`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
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
                                      onChange={(e) => handleQuantityChange(e, index)}
                                      className="h-9 focus:ring-1 focus:ring-primary"
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
                              name={`items.${index}.unit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      className="h-9 focus:ring-1 focus:ring-primary"
                                      placeholder="Đơn vị"
                                      disabled
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
                              name={`items.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="text"
                                      {...field}
                                      className="h-9 focus:ring-1 focus:ring-primary"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
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
                  onClick={() => append({ productID: "", quantity: 1, unit: "", description: "" })}
                  className="w-full border-dashed hover:border-primary hover:bg-primary/5"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm sản phẩm
                </Button>
              </CardContent>
              <CardFooter className="flex justify-between bg-muted/20 rounded-b-lg">
                <div className="flex items-center gap-2 justify-end">
                  <Button type="submit" disabled={isSubmitting || purchaseRequest?.status === "Đã duyệt" || purchaseRequest?.status === "Không duyệt"} className="bg-primary hover:bg-primary/90">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
