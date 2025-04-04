"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Plus, Search, SlidersHorizontal, Edit, Eye, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  productID: number
  productName: string
  description: string
  unit: string
  unitPrice: number
  stockQuantity: number
  reorderLevel: number
  categoryID: number
  category: {
    categoryName: string
  }
  supplierID: number
  supplier: {
    supplierName: string
  }
  status: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [supplierFilter, setSupplierFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const itemsPerPage = 10

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/product")
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu sản phẩm")
      }
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error)
      toast.error("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (productId: number) => {
    router.push(`/dashboard/products/edit/${productId}`)
  }

  const handleView = (productId: number) => {
    router.push(`/dashboard/products/view/${productId}`)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đang bán":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
      case "Ngừng bán":
        return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
      case "Hết hàng":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.categoryID.toString() === categoryFilter
    const matchesSupplier = supplierFilter === "all" || product.supplierID.toString() === supplierFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter

    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus
  })

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const uniqueCategories = Array.from(new Set(products.map(product => product.categoryID)))
    .map(id => {
      const product = products.find(p => p.categoryID === id)
      return {
        id: id.toString(),
        name: product?.category.categoryName || ""
      }
    })

  const uniqueSuppliers = Array.from(new Set(products.map(product => product.supplierID)))
    .map(id => {
      const product = products.find(p => p.supplierID === id)
      return {
        id: id.toString(),
        name: product?.supplier.supplierName || ""
      }
    })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Sản phẩm</h1>
        <Link href="/dashboard/products/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Sản phẩm
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh Sách Sản phẩm</CardTitle>
          <CardDescription>Quản lý và theo dõi tất cả sản phẩm trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm relative">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input 
                placeholder="Tìm kiếm sản phẩm..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                  {uniqueSuppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Đang bán">Đang bán</SelectItem>
                  <SelectItem value="Ngừng bán">Ngừng bán</SelectItem>
                  <SelectItem value="Hết hàng">Hết hàng</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => {
                setCategoryFilter("all")
                setSupplierFilter("all")
                setStatusFilter("all")
                setSearchTerm("")
              }}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã sản phẩm</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Đơn vị tính</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Mức tồn kho tối thiểu</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Không tìm thấy sản phẩm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product) => (
                    <TableRow key={product.productID}>
                      <TableCell className="font-medium">{product.productID}</TableCell>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>{product.category.categoryName}</TableCell>
                      <TableCell>{product.supplier.supplierName}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.unitPrice)}
                      </TableCell>
                      <TableCell>{product.stockQuantity}</TableCell>
                      <TableCell>{product.reorderLevel}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(product.productID)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product.productID)}
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
              Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredProducts.length)} trong tổng số {filteredProducts.length} sản phẩm
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
    </div>
  )
}

