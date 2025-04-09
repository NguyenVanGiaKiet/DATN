"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Search, Edit, Eye, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

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
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [editForm, setEditForm] = useState({
    categoryName: "",
    description: "",
    status: "Active"
  })
  const itemsPerPage = 10

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/category")
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu danh mục")
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error)
      toast.error("Không thể tải dữ liệu danh mục. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setEditForm({
      categoryName: category.categoryName,
      description: category.description || "",
      status: category.status
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedCategory) return

    try {
      const response = await fetch(`http://localhost:5190/api/category/${selectedCategory.categoryID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        throw new Error("Không thể cập nhật danh mục")
      }

      toast.success("Cập nhật danh mục thành công")
      setIsEditDialogOpen(false)
      fetchCategories()
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error)
      toast.error("Không thể cập nhật danh mục. Vui lòng thử lại sau.")
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
    }
  }

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = 
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || category.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Danh mục</h1>
        <Link href="/dashboard/categories/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Danh mục
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh Sách Danh mục</CardTitle>
          <CardDescription>Quản lý và theo dõi tất cả danh mục trong hệ thống</CardDescription>
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
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Không tìm thấy danh mục nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCategories.map((category) => (
                    <TableRow key={category.categoryID}>
                      <TableCell className="font-medium">{category.categoryID}</TableCell>
                      <TableCell>{category.categoryName}</TableCell>
                      <TableCell>{category.description || "Không có mô tả"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusClass(category.status)}>
                          {category.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Danh mục</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh mục sản phẩm
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="categoryName" className="text-sm font-medium">
                Tên danh mục
              </label>
              <Input
                id="categoryName"
                value={editForm.categoryName}
                onChange={(e) => setEditForm({ ...editForm, categoryName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Mô tả
              </label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Trạng thái
              </label>
              <select
                id="status"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 