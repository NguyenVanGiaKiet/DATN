"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự",
  }),
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
  phoneNumber: z.string().min(10, {
    message: "Số điện thoại không hợp lệ",
  }),
  role: z.string().min(2, {
    message: "Vị trí công việc phải có ít nhất 2 ký tự",
  }),
  bio: z.string().optional(),
  avatar: z.string().optional(),
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
      username: "",
      email: "",
      phoneNumber: "",
      role: "",
      bio: "",
      avatar: "",
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

  async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (token) {
      // Thực hiện yêu cầu với token nếu có
      console.log("Token đã lấy thành công:", token);
    } else {
      // Nếu không có token trong localStorage
      console.log("Không có token");
    }
    if (!token) throw new Error("Chưa đăng nhập")

    const res = await fetch("http://localhost:5190/api/account/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error("Không lấy được hồ sơ")
    }

    return res.json()
  }
  useEffect(() => {
    fetchProfile()
      .then((data) => {
        profileForm.reset({
          username: data.username || "",
          email: data.email,
          phoneNumber: data.phoneNumber || "",
          role: data.role,
          bio: data.bio || "",
          avatar: data.avatar || null,
        })

        if (data.avatar) {
          setAvatarSrc(data.avatar)
        }
      })
      .catch((err) => {
        toast.error("Lỗi" + err.message)
      })
  }, [])
  async function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    setIsLoading(true)
    const token = localStorage.getItem("token")

    const res = await fetch("http://localhost:5190/api/account/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (res.ok) {
      toast.success(result.message);
      setTimeout(() => {
        window.location.reload(); // reload lại trang
      }, 1000);
    } else {
      toast.error("Cập nhật thất bại");
    }

    setIsLoading(false)
  }

  async function onPasswordSubmit(data: z.infer<typeof passwordFormSchema>) {
    setIsPasswordLoading(true)
    const token = localStorage.getItem("token")

    try {
      const res = await fetch("http://localhost:5190/api/account/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (res.ok) {
        toast.success("Mật khẩu đã được cập nhật");
        passwordForm.reset()
      } else {
        const errorData = await res.json()
        toast.error("Cập nhật thất bại: " + errorData.message);
      }
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setIsPasswordLoading(false)
    }
  }


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 👉 Tạo URL tạm thời để hiển thị ảnh preview
    const previewURL = URL.createObjectURL(file);
    setAvatarSrc(previewURL); // Set ảnh preview

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5190/api/account/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      const avatar = data.url;

      // ✅ Cập nhật URL ảnh thật sau khi upload thành công
      profileForm.setValue("avatar", avatar, { shouldDirty: true });
      setAvatarSrc(avatar);

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
              <Input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
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
                      <Input id="username" {...profileForm.register("username")} />
                      {profileForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.username.message}</p>
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
                      <Label htmlFor="phoneNumber">Số điện thoại</Label>
                      <Input id="phoneNumber" {...profileForm.register("phoneNumber")} />
                      {profileForm.formState.errors.phoneNumber && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.phoneNumber.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Vị trí công việc</Label>
                      <Input id="role" {...profileForm.register("role")} />
                      {profileForm.formState.errors.role && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.role.message}</p>
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
