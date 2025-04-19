"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Plus, Search, SlidersHorizontal, Edit, Eye, Building2, Phone, Mail, MapPin, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Supplier {
  supplierID: number
  supplierName: string
  contactPerson: string
  phone: string
  email: string
  address: string
  rating: number
  paymentTerms: string
  deliveryTime: string
  status: string
  imageUrl: string
  products: any[]
  purchaseOrders: any[]
}

function getStatusClass(status: string) {
  switch (status) {
    case "Đang hợp tác":
      return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors"
    case "Ngừng hợp tác":
      return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 transition-colors"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 transition-colors"
  }
}

export default function SuppliersPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [deliveryTimeFilter, setDeliveryTimeFilter] = useState("all")
  const itemsPerPage = 10 // 2 hàng x 5 card

  // Hàm xóa tất cả bộ lọc
  const clearAllFilters = () => {
    setStatusFilter("all")
    setRatingFilter("all")
    setDeliveryTimeFilter("all")
    setSearchTerm("")
  }

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:5190/api/supplier')
        if (!response.ok) {
          throw new Error('Không thể tải danh sách nhà cung cấp')
        }
        const data = await response.json()
        // Sắp xếp theo supplierID giảm dần (mới nhất lên đầu)
        const sortedData = data.sort((a: Supplier, b: Supplier) => b.supplierID - a.supplierID)
        setSuppliers(sortedData)
      } catch (error) {
        console.error('Lỗi khi tải nhà cung cấp:', error)
        toast.error('Không thể tải danh sách nhà cung cấp')
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  // Lọc suppliers theo search term và các bộ lọc
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch =
      supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter
    const matchesRating = ratingFilter === "all" ||
      (ratingFilter === "5" && supplier.rating === 5) ||
      (ratingFilter === "4" && supplier.rating === 4) ||
      (ratingFilter === "3" && supplier.rating === 3) ||
      (ratingFilter === "2" && supplier.rating === 2) ||
      (ratingFilter === "1" && supplier.rating === 1)
    const matchesDeliveryTime = deliveryTimeFilter === "all" ||
      (deliveryTimeFilter === "fast" && parseInt(supplier.deliveryTime) <= 3) ||
      (deliveryTimeFilter === "medium" && parseInt(supplier.deliveryTime) > 3 && parseInt(supplier.deliveryTime) <= 7) ||
      (deliveryTimeFilter === "slow" && parseInt(supplier.deliveryTime) > 7)

    return matchesSearch && matchesStatus && matchesRating && matchesDeliveryTime
  })

  // Phân trang
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Nhà Cung Cấp</h1>
        </div>
        <Link href="/dashboard/suppliers/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Nhà Cung Cấp
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách Nhà Cung Cấp</CardTitle>
          <CardDescription>Quản lý và theo dõi tất cả nhà cung cấp trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm relative">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input
                placeholder="Tìm kiếm nhà cung cấp..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Đang hợp tác">Đang hợp tác</SelectItem>
                  <SelectItem value="Ngừng hợp tác">Ngừng hợp tác</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={ratingFilter}
                onValueChange={setRatingFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả đánh giá</SelectItem>
                  <SelectItem value="5">5 sao</SelectItem>
                  <SelectItem value="4">4 sao</SelectItem>
                  <SelectItem value="3">3 sao</SelectItem>
                  <SelectItem value="2">2 sao</SelectItem>
                  <SelectItem value="1">1 sao</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={deliveryTimeFilter}
                onValueChange={setDeliveryTimeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo thời gian giao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thời gian</SelectItem>
                  <SelectItem value="fast">Nhanh (≤ 3 ngày)</SelectItem>
                  <SelectItem value="medium">Trung bình (4-7 ngày)</SelectItem>
                  <SelectItem value="slow">Chậm (≥ 7 ngày)</SelectItem>
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
            </div>
          </div>

          {/* Hiển thị danh sách nhà cung cấp dạng card */}
          <div className="grid grid-cols-5 gap-4">
            {paginatedSuppliers.map((supplier) => (
              <Card
                key={supplier.supplierID}
                className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/dashboard/suppliers/edit/${supplier.supplierID}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-sm">{supplier.supplierName}</span>
                    <Badge variant="outline" className={getStatusClass(supplier.status)}>
                      {supplier.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">{supplier.contactPerson}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {supplier.imageUrl && (
                      <div className="w-full h-32 rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={supplier.imageUrl}
                          alt={`Ảnh ${supplier.supplierName}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{supplier.address}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredSuppliers.length)} trong tổng số {filteredSuppliers.length} nhà cung cấp
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

