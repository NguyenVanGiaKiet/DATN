"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import toast from "react-hot-toast"
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
})

type FormValues = z.infer<typeof formSchema>

export default function CreateSupplierPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

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
    },
  })

  // Theo dõi thay đổi form
  form.watch(() => {
    if (!hasChanges) {
      setHasChanges(true)
    }
  })

  // Xử lý khi submit form
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("http://localhost:5190/api/supplier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          status: data.status === "Đang hợp tác" ? "Đang hợp tác" : "Ngừng hợp tác"
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tạo nhà cung cấp");
      }

      toast.success(`Nhà cung cấp ${data.supplierName} đã được tạo thành công`, {
        duration: 5000,
      })

      setHasChanges(false)
      
      // Đợi 1.5 giây để người dùng thấy thông báo trước khi chuyển trang
      setTimeout(() => {
        router.push("/dashboard/suppliers")
      }, 1500)
    } catch (error) {
      console.error("Lỗi khi tạo nhà cung cấp:", error)
      toast.error(error instanceof Error ? error.message : "Không thể tạo nhà cung cấp. Vui lòng thử lại sau.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Xử lý khi hủy tạo mới
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmDialog(true)
    } else {
      router.back()
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Thêm nhà cung cấp mới</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-muted/50 rounded-t-lg">
                <CardTitle className="text-xl text-primary">Thông tin cơ bản</CardTitle>
                <CardDescription>Nhập thông tin cơ bản của nhà cung cấp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
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
                <CardDescription>Nhập thông tin bổ sung của nhà cung cấp</CardDescription>
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
                        Thời gian giao hàng trung bình sau khi đặt hàng (1-30 ngày)
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
              <CardFooter className="flex justify-between bg-muted/20 rounded-b-lg">
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
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Tạo mới
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
            <AlertDialogTitle>Bạn có chắc chắn muốn hủy?</AlertDialogTitle>
            <AlertDialogDescription>
              Các thay đổi bạn đã thực hiện sẽ không được lưu. Bạn có chắc chắn muốn thoát?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.back()}
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