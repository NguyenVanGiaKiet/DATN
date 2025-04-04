"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Plus, Search, SlidersHorizontal, Edit, Eye, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Category {
  categoryID: number
  categoryName: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/category")
      if (!response.ok) {
        throw new Error("Không thể tải danh mục")
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error)
      toast.error("Không thể tải danh mục. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (categoryId: number) => {
    router.push(`/dashboard/categories/edit/${categoryId}`)
  }

  const handleView = (categoryId: number) => {
    router.push(`/dashboard/categories/view/${categoryId}`)
  }

  const handleDelete = async () => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`http://localhost:5190/api/category/${selectedCategory.categoryID}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Không thể xóa danh mục")
      }

      toast.success("Danh mục đã được xóa thành công")
      setDeleteDialogOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error)
      toast.error("Không thể xóa danh mục. Vui lòng thử lại sau.")
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Danh Mục Sản Phẩm</h1>
        <Link href="/dashboard/categories/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Danh Mục
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh Sách Danh Mục</CardTitle>
          <CardDescription>Quản lý và theo dõi tất cả danh mục sản phẩm trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm relative">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input 
                placeholder="Tìm kiếm danh mục..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã danh mục</TableHead>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Không tìm thấy danh mục nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCategories.map((category) => (
                    <TableRow key={category.categoryID}>
                      <TableCell className="font-medium">{category.categoryID}</TableCell>
                      <TableCell>{category.categoryName}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          category.status === "Hoạt động" 
                            ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                            : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                        }>
                          {category.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(category.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell>{new Date(category.updatedAt).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(category.categoryID)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category.categoryID)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCategory(category)
                              setDeleteDialogOpen(true)
                            }}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredCategories.length)} trong tổng số {filteredCategories.length} danh mục
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{selectedCategory?.categoryName}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 