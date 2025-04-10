"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Plus, Search, SlidersHorizontal, Edit, Eye, Package, Building2, Package2, DollarSign, Box } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  productID: number
  productName: string
  description: string
  unit: string
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
  unitPrice: number
  quantityInStock: number
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || product.categoryID.toString() === categoryFilter
    const matchesSupplier = supplierFilter === "all" || product.supplierID.toString() === supplierFilter
    
    return matchesSearch && matchesCategory && matchesSupplier
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

  const clearAllFilters = () => {
    setCategoryFilter("all")
    setSupplierFilter("all")
    setSearchTerm("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Sản Phẩm</h1>
        </div>
        <Link href="/dashboard/products/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Sản Phẩm
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách Sản Phẩm</CardTitle>
          <CardDescription>Quản lý và theo dõi tất cả sản phẩm trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm relative">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input 
                placeholder="Tìm kiếm sản phẩm..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={supplierFilter}
                onValueChange={setSupplierFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                  {uniqueSuppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Xóa bộ lọc
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Xuất
              </Button>
            </div>
          </div>

          {/* Hiển thị danh sách sản phẩm dạng card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8">
                Đang tải danh sách sản phẩm...
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="col-span-full text-center py-8">
                Không tìm thấy sản phẩm nào
              </div>
            ) : (
              paginatedProducts.map((product) => (
                <Card 
                  key={product.productID} 
                  className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/dashboard/products/edit/${product.productID}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{product.productName}</h3>
                        <div className="text-sm text-muted-foreground">
                          Mã: {product.productID}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        {product.category?.categoryName || "Chưa phân loại"}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {product.supplier?.supplierName || "Chưa có nhà cung cấp"}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Package2 className="h-4 w-4" />
                        Tồn kho: {product.stockQuantity} {product.unit}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Package2 className="h-4 w-4" />
                        Mức tồn kho tối thiểu: {product.reorderLevel} {product.unit}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
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

