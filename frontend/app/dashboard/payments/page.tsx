"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Plus, Search, SlidersHorizontal, Edit, Eye, Calendar, Filter, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Payment {
  paymentID: number
  invoiceID: number
  paymentDate: string
  amountPaid: number
  paymentMethod: string
  processedBy: string
  invoice: {
    invoiceID: number
    purchaseOrderID: string
    invoiceDate: string
    totalAmount: number
    paymentStatus: string
    dueDate: string
    purchaseOrder: {
      supplier: {
        supplierName: string
      }
    } | null
    payments: (Payment | null)[]
  }
}

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>()
  const [supplierFilter, setSupplierFilter] = useState<string>("all")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/payment")
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu thanh toán")
      }
      const data = await response.json()
      setPayments(data)
    } catch (error) {
      console.error("Lỗi khi tải thanh toán:", error)
      toast.error("Không thể tải dữ liệu thanh toán. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (paymentId: number) => {
    router.push(`/dashboard/payments/edit/${paymentId}`)
  }

  const handleView = (paymentId: number) => {
    router.push(`/dashboard/payments/view/${paymentId}`)
  }

  const handleDelete = async (payment: Payment) => {
    setSelectedPayment(payment)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!selectedPayment) return

    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/payment/${selectedPayment.paymentID}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Không thể xóa thanh toán")
      }

      toast.success("Thanh toán đã được xóa thành công")
      fetchPayments()
    } catch (error) {
      console.error("Lỗi khi xóa thanh toán:", error)
      toast.error("Không thể xóa thanh toán. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
      setSelectedPayment(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đã thanh toán":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
      case "Đã hủy":
        return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      String(payment.paymentID).toLowerCase().includes(searchLower) ||
      String(payment.invoice.purchaseOrderID).toLowerCase().includes(searchLower) ||
      (payment.invoice.purchaseOrder?.supplier.supplierName.toLowerCase().includes(searchLower) ?? false) ||
      payment.invoice.paymentStatus.toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage)

  const uniqueSuppliers = Array.from(new Set(payments.map(payment => payment.invoice.purchaseOrder?.supplier.supplierName ?? "N/A")))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Thanh toán</h1>
        <Link href="/dashboard/payments/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo Thanh toán
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách Thanh toán</CardTitle>
          <CardDescription>Quản lý và theo dõi tất cả thanh toán trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm relative">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input 
                placeholder="Tìm kiếm thanh toán..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Đã thanh toán">Đã thanh toán</SelectItem>
                  <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                  <SelectItem value="Đã hủy">Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                  {uniqueSuppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
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

              <Button variant="outline" size="sm" onClick={() => {
                setStatusFilter("all")
                setSupplierFilter("all")
                setDateFilter(undefined)
                setSearchTerm("")
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã thanh toán</TableHead>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Không tìm thấy thanh toán nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPayments.map((payment) => (
                    <TableRow key={payment.paymentID}>
                      <TableCell className="font-medium">{payment.paymentID}</TableCell>
                      <TableCell>{payment.invoice.purchaseOrderID}</TableCell>
                      <TableCell>{payment.invoice.purchaseOrder?.supplier.supplierName ?? "N/A"}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>{formatCurrency(payment.amountPaid)}</TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusClass(payment.invoice.paymentStatus)}>
                          {payment.invoice.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(payment.paymentID)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(payment.paymentID)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(payment)}
                            className="h-8 w-8"
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
              Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredPayments.length)} trong tổng số {filteredPayments.length} thanh toán
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thanh toán {selectedPayment?.paymentID}? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 