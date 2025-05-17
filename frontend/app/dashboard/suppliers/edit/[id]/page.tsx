"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import toast from "react-hot-toast"
import { useNotification } from "@/components/notification-context";
import { v4 as uuidv4 } from "uuid";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

// Định nghĩa schema cho form
const formSchema = z.object({
  supplierName: z.string().min(2, {
    message: "Vui lòng nhập tên nhà cung cấp ít nhất 2 ký tự",
  }),
  contactPerson: z.string().min(2, {
    message: "Vui lòng nhập tên người liên hệ ít nhất 2 ký tự",
  }),
  phone: z.string().min(10, {
    message: "Vui lòng nhập số điện thoại hợp lệ",
  }),
  email: z.string().email({
    message: "Vui lòng nhập địa chỉ email hợp lệ",
  }),
  address: z.string().min(5, {
    message: "Vui lòng nhập địa chỉ ít nhất 5 ký tự",
  }),
  rating: z.number().min(1).max(5),
  paymentTerms: z.string().min(2, {
    message: "Vui lòng chọn điều khoản thanh toán",
  }),
  deliveryTime: z.number().min(1).max(30),
  status: z.enum(["Đang hợp tác", "Ngừng hợp tác"]),
  imageUrl: z.string().nullable().optional(), // Thêm trường imageUrl nếu cần thiết
})

type FormValues = z.infer<typeof formSchema>

export default function EditSupplierPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState("/placeholder-user.jpg")
  // Lấy hàm addNotification từ context
  const { addNotification } = useNotification();
  // Khởi tạo form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      rating: 3,
      paymentTerms: "",
      deliveryTime: 1,
      status: "Đang hợp tác",
      imageUrl: null, // Thêm trường imageUrl nếu cần thiết
    },
  })

  // Lấy dữ liệu nhà cung cấp khi component được tải
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setIsLoading(true)
        console.log("Đang tải dữ liệu nhà cung cấp với ID:", params.id)
        const response = await fetch(`http://localhost:5190/api/supplier/${params.id}`)
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu nhà cung cấp")
        }
        const data = await response.json()
        console.log("Dữ liệu nhận được từ API:", data)

        // Cập nhật form với dữ liệu từ API
        form.reset({
          supplierName: data.supplierName,
          contactPerson: data.contactPerson,
          phone: data.phone,
          email: data.email,
          address: data.address,
          rating: data.rating,
          paymentTerms: data.paymentTerms,
          deliveryTime: data.deliveryTime,
          status: data.status,
          imageUrl: data.imageUrl || null, // Thêm trường imageUrl nếu cần thiết
        })
        if (data.imageUrl) {
          setAvatarSrc(data.imageUrl)
        }
        console.log("Form đã được cập nhật với dữ liệu:", form.getValues())
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
        toast.error("Không thể tải thông tin nhà cung cấp. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSupplier()
  }, [params.id])

  // Theo dõi thay đổi form
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Form đã thay đổi:", value)
      setHasChanges(true)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Xử lý khi submit form
  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)
      console.log("Dữ liệu form trước khi format:", data)

      // Format dữ liệu trước khi gửi lên API
      const formattedData = {
        supplierID: parseInt(params.id),
        supplierName: data.supplierName.trim(),
        contactPerson: data.contactPerson.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        address: data.address.trim(),
        rating: Number(data.rating),
        paymentTerms: data.paymentTerms,
        deliveryTime: Number(data.deliveryTime),
        status: data.status === "Đang hợp tác" ? "Đang hợp tác" : "Ngừng hợp tác",
        imageUrl: data.imageUrl || null, // Thêm trường imageUrl nếu cần thiết
      }

      console.log("Dữ liệu đã format:", formattedData)
      console.log("Image URL:", data.imageUrl);

      const response = await fetch(`http://localhost:5190/api/supplier/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData)
      })

      console.log("Response status:", response.status)
      const responseData = await response.json()
      console.log("Response data:", responseData)

      if (!response.ok) {
        if (responseData.errors) {
          const errorDetails = []
          if (responseData.errors.Products) {
            errorDetails.push(`Sản phẩm: ${responseData.errors.Products.join(", ")}`)
          }
          if (responseData.errors.PurchaseOrders) {
            errorDetails.push(`Đơn hàng: ${responseData.errors.PurchaseOrders.join(", ")}`)
          }
          throw new Error(`${responseData.message}\n${errorDetails.join("\n")}`)
        }
        throw new Error(responseData.message || "Có lỗi xảy ra khi cập nhật nhà cung cấp")
      }

      // Hiển thị thông báo thành công
      toast.success(`Nhà cung cấp ${formattedData.supplierName} đã được cập nhật thành công`, {
        duration: 5000,
      })

      setHasChanges(false)

      // Gửi notification lên NotificationCenter
      addNotification({
        id: uuidv4(),
        title: "Cập nhật nhà cung cấp",
        message: `Nhà cung cấp đã được cập nhật thành công!`,
        date: new Date(),
        read: false,
      });

      // Đợi 1.5 giây để người dùng thấy thông báo trước khi chuyển trang
      setTimeout(() => {
        router.push("/dashboard/suppliers")
      }, 1500)
    } catch (error) {
      console.error("Chi tiết lỗi:", error)
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật nhà cung cấp. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Xử lý khi hủy chỉnh sửa
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      router.back()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setAvatarSrc(previewURL); // Set ảnh preview

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5190/api/supplier/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      const imageUrl = data.url;

      // ✅ Cập nhật URL ảnh thật sau khi upload thành công
      form.setValue("imageUrl", imageUrl, { shouldDirty: true });
      setAvatarSrc(imageUrl); // Set ảnh thật vào preview

      toast.success("Tải ảnh thành công!");
    } catch (err) {
      toast.error("Tải ảnh thất bại");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-muted/50"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa nhà cung cấp</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-muted/50 rounded-t-lg">
                <CardTitle className="text-xl text-primary">Thông tin chung</CardTitle>
                <CardDescription>Thông tin cơ bản về nhà cung cấp</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 pt-5">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="Avatar" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-2">
                  <Label htmlFor="avatar" className="cursor-pointer text-sm font-medium text-primary hover:underline">
                    Thay đổi ảnh
                  </Label>
                  <Input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <p className="text-xs text-muted-foreground">Cho phép JPG, GIF hoặc PNG. Kích thước tối đa 1MB.</p>
                </div>
              </CardContent>

              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="supplierName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Tên nhà cung cấp</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên nhà cung cấp"
                          {...field}
                          className="h-10 focus:ring-1 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Người liên hệ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên người liên hệ"
                          {...field}
                          className="h-10 focus:ring-1 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">Số điện thoại</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập số điện thoại"
                            {...field}
                            className="h-10 focus:ring-1 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập địa chỉ email"
                            {...field}
                            className="h-10 focus:ring-1 focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Địa chỉ</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập địa chỉ nhà cung cấp"
                          {...field}
                          className="min-h-[80px] resize-none focus:ring-1 focus:ring-primary"
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
                <CardTitle className="text-xl text-primary">Thông tin bổ sung</CardTitle>
                <CardDescription>Cập nhật thông tin bổ sung của nhà cung cấp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Đánh giá</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(Number.parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <SelectTrigger className="h-10 focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="Chọn đánh giá" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Rất kém</SelectItem>
                            <SelectItem value="2">2 - Kém</SelectItem>
                            <SelectItem value="3">3 - Trung bình</SelectItem>
                            <SelectItem value="4">4 - Tốt</SelectItem>
                            <SelectItem value="5">5 - Rất tốt</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Điều khoản thanh toán</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-10 focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="Chọn điều khoản thanh toán" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Net 15">Thanh toán sau 15 ngày</SelectItem>
                            <SelectItem value="Net 30">Thanh toán sau 30 ngày</SelectItem>
                            <SelectItem value="Net 45">Thanh toán sau 45 ngày</SelectItem>
                            <SelectItem value="Net 60">Thanh toán sau 60 ngày</SelectItem>
                            <SelectItem value="Thanh toán ngay">Thanh toán ngay khi nhận hàng</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription className="text-xs">Thời hạn thanh toán sau khi nhận hàng</FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryTime"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Thời gian giao hàng (ngày)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          placeholder="Nhập số ngày giao hàng"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-10 focus:ring-1 focus:ring-primary"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Thời gian dự kiến giao hàng sau khi đặt hàng (từ 1-30 ngày)
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Trạng thái</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Đang hợp tác" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Đang hợp tác</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Ngừng hợp tác" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Ngừng hợp tác</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCancel}
                  className="hover:bg-muted"
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy thay đổi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn thoát không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.back()}
              className="bg-destructive hover:bg-destructive/90"
            >
              Thoát và hủy thay đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 