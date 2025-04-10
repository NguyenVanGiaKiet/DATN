"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Plus, Search, Calendar, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface GoodsReceived {
  goodsReceivedID: number
  purchaseOrderID: string
  receivedDate: string
  receiver: string
  status: string
  remarks: string
  purchaseOrder: {
    purchaseOrderID: string
    supplierID: number
    orderDate: string
    expectedDeliveryDate: string
    totalAmount: number
    status: string
    approvedBy: string
    notes: string
    supplier: {
      supplierID: number
      supplierName: string
    } | null
  }
}

export default function GoodsReceivedPage() {
  const router = useRouter()
  const [goodsReceived, setGoodsReceived] = useState<GoodsReceived[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const fetchGoodsReceived = async () => {
      try {
        const response = await fetch("http://localhost:5190/api/goodsreceived")
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu phiếu nhận hàng")
        }
        const data = await response.json()
        setGoodsReceived(data)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoodsReceived()
  }, [])

  const filteredGoodsReceived = goodsReceived.filter(gr => 
    gr.purchaseOrderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (gr.purchaseOrder.supplier?.supplierName.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "Partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Pending":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const uniqueSuppliers = [...new Set(goodsReceived
    .filter(gr => gr.purchaseOrder.supplier !== null)
    .map(gr => ({
      id: gr.purchaseOrder.supplier!.supplierID.toString(),
      name: gr.purchaseOrder.supplier!.supplierName
    })))]

  const paginatedGoodsReceived = filteredGoodsReceived.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredGoodsReceived.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Phiếu nhận hàng</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/dashboard/goods-received/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo phiếu nhận hàng
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiếu nhận hàng</CardTitle>
          <CardDescription>Quản lý các phiếu nhận hàng từ nhà cung cấp</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm relative">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input 
                placeholder="Tìm kiếm phiếu nhận hàng..." 
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
                  <SelectItem value="Completed">Hoàn thành</SelectItem>
                  <SelectItem value="Partial">Một phần</SelectItem>
                  <SelectItem value="Pending">Đang chờ</SelectItem>
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
                  <TableHead>Mã phiếu</TableHead>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày nhận</TableHead>
                  <TableHead>Người nhận</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedGoodsReceived.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Không tìm thấy phiếu nhận hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedGoodsReceived.map((gr) => (
                    <TableRow 
                      key={gr.goodsReceivedID} 
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/goods-received/edit/${gr.goodsReceivedID}`)}
                    >
                      <TableCell className="font-medium">{gr.goodsReceivedID}</TableCell>
                      <TableCell>{gr.purchaseOrderID}</TableCell>
                      <TableCell>{gr.purchaseOrder.supplier?.supplierName || "-"}</TableCell>
                      <TableCell>
                        {gr.receivedDate && format(new Date(gr.receivedDate), "dd/MM/yyyy", { locale: vi })}
                      </TableCell>
                      <TableCell>{gr.receiver}</TableCell>
                      <TableCell>
                        <Badge className={getStatusClass(gr.status)}>
                          {gr.status === "Completed" ? "Hoàn thành" : 
                           gr.status === "Partial" ? "Một phần" :
                           gr.status === "Pending" ? "Đang chờ" : gr.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{gr.remarks || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredGoodsReceived.length)} trong tổng số {filteredGoodsReceived.length} phiếu nhận hàng
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

