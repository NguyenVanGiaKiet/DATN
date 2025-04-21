"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  orderUpdates: z.boolean(),
  supplierUpdates: z.boolean(),
  productUpdates: z.boolean(),
  systemUpdates: z.boolean(),
})

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["vi", "en"]),
  density: z.enum(["compact", "default", "comfortable"]),
})

export default function SettingsPage() {
  const [isNotificationLoading, setIsNotificationLoading] = useState(false)
  const [isAppearanceLoading, setIsAppearanceLoading] = useState(false)

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      orderUpdates: true,
      supplierUpdates: true,
      productUpdates: false,
      systemUpdates: true,
    },
  })

  const appearanceForm = useForm<z.infer<typeof appearanceFormSchema>>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      language: "vi",
      density: "default",
    },
  })

  function onNotificationSubmit(data: z.infer<typeof notificationFormSchema>) {
    setIsNotificationLoading(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(data)
      toast({
        title: "Thành công",
        description: "Cài đặt thông báo đã được cập nhật",
      })
      setIsNotificationLoading(false)
    }, 1000)
  }

  function onAppearanceSubmit(data: z.infer<typeof appearanceFormSchema>) {
    setIsAppearanceLoading(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(data)
      toast({
        title: "Thành công",
        description: "Cài đặt giao diện đã được cập nhật",
      })
      setIsAppearanceLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="appearance">Giao diện</TabsTrigger>
          <TabsTrigger value="account">Tài khoản</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>Quản lý cách bạn nhận thông báo từ hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Kênh thông báo</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications">Thông báo qua email</Label>
                        <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notificationForm.watch("emailNotifications")}
                        onCheckedChange={(checked) => notificationForm.setValue("emailNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushNotifications">Thông báo đẩy</Label>
                        <p className="text-sm text-muted-foreground">Nhận thông báo đẩy trên trình duyệt</p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={notificationForm.watch("pushNotifications")}
                        onCheckedChange={(checked) => notificationForm.setValue("pushNotifications", checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Loại thông báo</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="orderUpdates">Cập nhật đơn hàng</Label>
                        <p className="text-sm text-muted-foreground">Thông báo khi có cập nhật về đơn hàng</p>
                      </div>
                      <Switch
                        id="orderUpdates"
                        checked={notificationForm.watch("orderUpdates")}
                        onCheckedChange={(checked) => notificationForm.setValue("orderUpdates", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="supplierUpdates">Cập nhật nhà cung cấp</Label>
                        <p className="text-sm text-muted-foreground">Thông báo khi có cập nhật về nhà cung cấp</p>
                      </div>
                      <Switch
                        id="supplierUpdates"
                        checked={notificationForm.watch("supplierUpdates")}
                        onCheckedChange={(checked) => notificationForm.setValue("supplierUpdates", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="productUpdates">Cập nhật sản phẩm</Label>
                        <p className="text-sm text-muted-foreground">Thông báo khi có cập nhật về sản phẩm</p>
                      </div>
                      <Switch
                        id="productUpdates"
                        checked={notificationForm.watch("productUpdates")}
                        onCheckedChange={(checked) => notificationForm.setValue("productUpdates", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="systemUpdates">Cập nhật hệ thống</Label>
                        <p className="text-sm text-muted-foreground">Thông báo khi có cập nhật về hệ thống</p>
                      </div>
                      <Switch
                        id="systemUpdates"
                        checked={notificationForm.watch("systemUpdates")}
                        onCheckedChange={(checked) => notificationForm.setValue("systemUpdates", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={isNotificationLoading}>
                    {isNotificationLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt giao diện</CardTitle>
              <CardDescription>Tùy chỉnh giao diện người dùng theo sở thích của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)}>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Chủ đề</Label>
                      <RadioGroup
                        defaultValue={appearanceForm.getValues("theme")}
                        onValueChange={(value) =>
                          appearanceForm.setValue("theme", value as "light" | "dark" | "system")
                        }
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="theme-light" />
                          <Label htmlFor="theme-light">Sáng</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="theme-dark" />
                          <Label htmlFor="theme-dark">Tối</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="system" id="theme-system" />
                          <Label htmlFor="theme-system">Theo hệ thống</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Ngôn ngữ</Label>
                      <Select
                        defaultValue={appearanceForm.getValues("language")}
                        onValueChange={(value) => appearanceForm.setValue("language", value as "vi" | "en")}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Chọn ngôn ngữ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="density">Mật độ hiển thị</Label>
                      <Select
                        defaultValue={appearanceForm.getValues("density")}
                        onValueChange={(value) =>
                          appearanceForm.setValue("density", value as "compact" | "default" | "comfortable")
                        }
                      >
                        <SelectTrigger id="density">
                          <SelectValue placeholder="Chọn mật độ hiển thị" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Nhỏ gọn</SelectItem>
                          <SelectItem value="default">Mặc định</SelectItem>
                          <SelectItem value="comfortable">Thoải mái</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={isAppearanceLoading}>
                    {isAppearanceLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt tài khoản</CardTitle>
              <CardDescription>Quản lý cài đặt tài khoản và quyền truy cập</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Phiên đăng nhập</h3>
                  <div className="rounded-md border p-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium">Thiết bị hiện tại</p>
                      <p className="text-xs text-muted-foreground">
                        Chrome trên Windows • Hà Nội, Việt Nam • IP: 192.168.1.1
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                        Đang hoạt động
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Xóa tài khoản</h3>
                      <p className="text-sm text-muted-foreground">
                        Xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan
                      </p>
                    </div>
                    <Button variant="destructive">Xóa tài khoản</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
