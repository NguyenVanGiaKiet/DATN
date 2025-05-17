"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import { useNotification } from "@/components/notification-context";
import { v4 as uuidv4 } from "uuid";

interface Category {
  categoryID: number
  categoryName: string
  description: string
  status: string
}

const categorySchema = z.object({
  categoryName: z.string().min(1, "Tên danh mục là bắt buộc"),
  description: z.string().optional(),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<Category | null>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: "",
      description: "",
      status: "Hoạt động",
    },
  })

  useEffect(() => {
    fetchCategory()
  }, [params.id])

  const fetchCategory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/category/${params.id}`)
      if (!response.ok) {
        throw new Error("Không thể tải thông tin danh mục")
      }
      const data = await response.json()
      setCategory(data)
      form.reset(data)
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error)
      toast.error("Không thể tải thông tin danh mục. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/category/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Không thể cập nhật danh mục")
      }

      const { addNotification } = useNotification();
addNotification({
        id: uuidv4(),
        title: "Cập nhật danh mục",
        message: `Danh mục đã được cập nhật thành công!`,
        date: new Date(),
        read: false,
      });
      toast.success("Cập nhật danh mục thành công!")
      router.push("/dashboard/categories")
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error)
      toast.error("Không thể cập nhật danh mục. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !category) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Danh Mục</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground mt-2">Đang tải dữ liệu...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Danh Mục</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Không tìm thấy danh mục</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Danh Mục</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Danh Mục</CardTitle>
          <CardDescription>Cập nhật thông tin chi tiết về danh mục</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Tên danh mục</Label>
                <Input
                  id="categoryName"
                  placeholder="Nhập tên danh mục"
                  {...form.register("categoryName")}
                />
                {form.formState.errors.categoryName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.categoryName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  onValueChange={(value) => form.setValue("status", value)}
                  defaultValue={form.getValues("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                    <SelectItem value="Không hoạt động">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả danh mục"
                {...form.register("description")}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật danh mục"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 