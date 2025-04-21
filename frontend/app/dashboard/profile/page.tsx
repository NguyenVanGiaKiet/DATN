"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự",
  }),
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
  phone: z.string().min(10, {
    message: "Số điện thoại không hợp lệ",
  }),
  position: z.string().min(2, {
    message: "Vị trí công việc phải có ít nhất 2 ký tự",
  }),
  bio: z.string().optional(),
})

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, {
      message: "Mật khẩu hiện tại phải có ít nhất 8 ký tự",
    }),
    newPassword: z.string().min(8, {
      message: "Mật khẩu mới phải có ít nhất 8 ký tự",
    }),
    confirmPassword: z.string().min(8, {
      message: "Xác nhận mật khẩu phải có ít nhất 8 ký tự",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  })

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState("/placeholder-user.jpg")

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "Admin User",
      email: "admin@example.com",
      phone: "+84 123 456 789",
      position: "Quản trị viên",
      bio: "Quản trị viên hệ thống quản lý mua hàng và nhà cung cấp.",
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    setIsLoading(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(data)
      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật",
      })
      setIsLoading(false)
    }, 1000)
  }

  function onPasswordSubmit(data: z.infer<typeof passwordFormSchema>) {
    setIsPasswordLoading(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(data)
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được cập nhật",
      })
      setIsPasswordLoading(false)
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }, 1000)
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarSrc(e.target.result as string)
          toast({
            title: "Thành công",
            description: "Ảnh đại diện đã được cập nhật",
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ảnh đại diện</CardTitle>
            <CardDescription>Cập nhật ảnh đại diện của bạn</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="Avatar" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor="avatar" className="cursor-pointer text-sm font-medium text-primary hover:underline">
                Thay đổi ảnh
              </Label>
              <Input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <p className="text-xs text-muted-foreground">Cho phép JPG, GIF hoặc PNG. Kích thước tối đa 1MB.</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên</Label>
                      <Input id="name" {...profileForm.register("name")} />
                      {profileForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...profileForm.register("email")} />
                      {profileForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" {...profileForm.register("phone")} />
                      {profileForm.formState.errors.phone && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Vị trí công việc</Label>
                      <Input id="position" {...profileForm.register("position")} />
                      {profileForm.formState.errors.position && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.position.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Giới thiệu</Label>
                      <Textarea id="bio" rows={4} {...profileForm.register("bio")} />
                      {profileForm.formState.errors.bio && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.bio.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
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

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>Cập nhật mật khẩu đăng nhập của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isPasswordLoading}>
                      {isPasswordLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        "Cập nhật mật khẩu"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
