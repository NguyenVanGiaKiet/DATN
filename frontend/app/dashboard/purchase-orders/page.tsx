"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Plus, Search, SlidersHorizontal, Edit, Eye, Calendar, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface PurchaseOrder {
  purchaseOrderID: string
  supplierID: number
  supplier: {
    supplierName: string
  }
  orderDate: string
  expectedDeliveryDate: string
  totalAmount: number
  status: string
  approvedBy: string
  notes: string
  purchaseOrderDetails: {
    quantity: number
  }[]
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>()
  const [supplierFilter, setSupplierFilter] = useState<string>("all")
  const itemsPerPage = 5

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/purchaseorder")
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu đơn hàng")
      }
      const data = await response.json()
      // Sắp xếp đơn hàng theo ngày đặt hàng mới nhất
      const sortedOrders = data.sort((a: PurchaseOrder, b: PurchaseOrder) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )
      setOrders(sortedOrders)
    } catch (error) {
      console.error("Lỗi khi tải đơn đặt hàng:", error)
      toast.error("Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (orderId: string) => {
    router.push(`/dashboard/purchase-orders/edit/${orderId}`)
  }

  const handleView = (orderId: string) => {
    router.push(`/dashboard/purchase-orders/view/${orderId}`)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    } catch (error) {
      console.error("Lỗi định dạng ngày tháng:", error)
      return "N/A"
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors"
      case "Đã gửi email":
        return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 transition-colors"
      case "Đã xác nhận":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors"
      case "Đã hủy":
        return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 transition-colors"
      case "Đang giao hàng":
        return "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 transition-colors"
      case "Đã nhận hàng":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200 transition-colors"
      case "Đã trả hàng":
        return "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 transition-colors"
      case "Đang nhận hàng":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors"
      case "Đã xuất hóa đơn":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors"
      case "Đã thanh toán":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 transition-colors"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.purchaseOrderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesSupplier = supplierFilter === "all" || order.supplierID.toString() === supplierFilter
    const matchesDate = !dateFilter || 
      new Date(order.orderDate).toDateString() === dateFilter.toDateString()

    return matchesSearch && matchesStatus && matchesSupplier && matchesDate
  })

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  const uniqueSuppliers = Array.from(new Set(orders.map(order => order.supplierID)))
    .map(id => {
      const order = orders.find(o => o.supplierID === id)
      return {
        id: id.toString(),
        name: order?.supplier.supplierName || ""
      }
    })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Đơn Đặt Hàng</h1>
        <Link href="/dashboard/purchase-orders/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo Đơn Mới
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-primary">Danh Sách Đơn Hàng</CardTitle>
          <CardDescription>Quản lý và theo dõi tất cả đơn đặt hàng trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm relative">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input 
                placeholder="Tìm kiếm đơn hàng..." 
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
                  <SelectItem value="Đang chờ duyệt">Đang chờ duyệt</SelectItem>
                  <SelectItem value="Đã gửi email">Đã gửi email</SelectItem>
                  <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                  <SelectItem value="Đã xác nhận">Đã xác nhận</SelectItem>
                  <SelectItem value="Đang nhận hàng">Đang nhận hàng</SelectItem>
                  <SelectItem value="Đã nhận hàng">Đã nhận hàng</SelectItem>
                  <SelectItem value="Đã xuất hóa đơn">Đã xuất hóa đơn</SelectItem>
                  <SelectItem value="Thanh toán một phần">Thanh toán một phần</SelectItem>
                  <SelectItem value="Đã thanh toán">Đã thanh toán</SelectItem>
                  <SelectItem value="Đã hủy">Đã hủy</SelectItem>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "dd/MM/yyyy") : "Lọc theo ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setStatusFilter("all")
                  setSupplierFilter("all")
                  setDateFilter(undefined)
                  setSearchTerm("")
                }}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Xóa bộ lọc
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Ngày giao dự kiến</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Số lượng sản phẩm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người phê duyệt</TableHead>
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
                ) : paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Không tìm thấy đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow 
                      key={order.purchaseOrderID} 
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        if (order.status === "Đã xuất hóa đơn" || order.status === "Đã thanh toán" || order.status === "Thanh toán một phần") {
                          router.push(`/dashboard/purchase-orders/invoices/${order.purchaseOrderID}`)
                        } else {
                          router.push(`/dashboard/purchase-orders/edit/${order.purchaseOrderID}`)
                        }
                      }}
                    >
                      <TableCell className="font-medium">{order.purchaseOrderID}</TableCell>
                      <TableCell>{order.supplier.supplierName}</TableCell>
                      <TableCell>
                        {order.orderDate && format(new Date(order.orderDate), "dd/MM/yyyy", { locale: vi })}
                      </TableCell>
                      <TableCell>
                        {order.expectedDeliveryDate && format(new Date(order.expectedDeliveryDate), "dd/MM/yyyy", { locale: vi })}
                      </TableCell>
                      <TableCell>
                        {order.totalAmount.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND"
                        })}
                      </TableCell>
                      <TableCell>
                        {order.purchaseOrderDetails.reduce((total, item) => total + item.quantity, 0)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusClass(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.approvedBy || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hàng
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


