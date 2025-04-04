"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Printer, Download } from "lucide-react"
import toast from "react-hot-toast"

interface Category {
  categoryID: number
  categoryName: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function ViewCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

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
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error)
      toast.error("Không thể tải thông tin danh mục. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Chi Tiết Danh Mục</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Chi Tiết Danh Mục</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Chi Tiết Danh Mục</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push(`/dashboard/categories/edit/${category.categoryID}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Thông tin chi tiết về danh mục</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mã danh mục</p>
                <p className="text-lg font-semibold">{category.categoryID}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tên danh mục</p>
                <p className="text-lg font-semibold">{category.categoryName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                <Badge variant="outline" className={
                  category.status === "Hoạt động" 
                    ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                    : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                }>
                  {category.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                <p className="text-lg font-semibold">{new Date(category.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày cập nhật</p>
                <p className="text-lg font-semibold">{new Date(category.updatedAt).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mô tả</CardTitle>
            <CardDescription>Thông tin mô tả về danh mục</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{category.description || "Không có mô tả"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 