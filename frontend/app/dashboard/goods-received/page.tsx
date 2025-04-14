"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import toast from "react-hot-toast"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"

interface GoodsReceived {
  goodsReceivedID: number
  purchaseOrderID: string
  receivedDate: string
  receiver: string
  status: string
  remarks: string
  purchaseOrder: {
    supplier: {
      supplierName: string
    }
  }
}

export default function GoodsReceivedPage() {
  const router = useRouter()
  const [goodsReceived, setGoodsReceived] = useState<GoodsReceived[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [date, setDate] = useState<Date>()
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const itemsPerPage = 5

  useEffect(() => {
    const fetchGoodsReceived = async () => {
      try {
        const response = await fetch("http://localhost:5190/api/goodsreceived")
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu phiếu nhận hàng")
        }
        const data = await response.json()
        const sortedData = data.sort((a: GoodsReceived, b: GoodsReceived) => 
          new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime()
        )
        setGoodsReceived(sortedData)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoodsReceived()
  }, [])

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "Partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Pending":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "Completed":
        return "Hoàn thành"
      case "Partial":
        return "Một phần"
      case "Pending":
        return "Đang chờ"
      default:
        return status
    }
  }

  const uniqueSuppliers = [...new Set(goodsReceived
    .filter(gr => gr.purchaseOrder.supplier !== null)
    .map(gr => ({
      id: gr.purchaseOrderID,
      name: gr.purchaseOrder.supplier?.supplierName || "-"
    })))]

  const filteredGoodsReceived = goodsReceived.filter(gr => {
    const matchesSearch = 
      gr.purchaseOrderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gr.purchaseOrder.supplier?.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !date || 
      format(new Date(gr.receivedDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    
    const matchesSupplier = !selectedSupplier || 
      gr.purchaseOrderID === selectedSupplier

    return matchesSearch && matchesDate && matchesSupplier
  })

  const totalPages = Math.ceil(filteredGoodsReceived.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredGoodsReceived.slice(startIndex, endIndex)

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
        <h1 className="text-3xl font-bold tracking-tight">Phiếu nhận hàng</h1>
        <Button onClick={() => router.push("/dashboard/goods-received/create")}>
          Tạo phiếu nhận hàng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách phiếu nhận hàng</CardTitle>
              <CardDescription>
                Quản lý thông tin các phiếu nhận hàng
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng hoặc nhà cung cấp"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <select
                className="h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                <option value="">Tất cả nhà cung cấp</option>
                {uniqueSuppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                {currentItems.map((gr) => (
                  <TableRow 
                    key={gr.goodsReceivedID}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/goods-received/edit/${gr.goodsReceivedID}`)}
                  >
                    <TableCell className="font-medium">GR-{gr.goodsReceivedID.toString().padStart(4, '0')}</TableCell>
                    <TableCell>{gr.purchaseOrderID}</TableCell>
                    <TableCell>{gr.purchaseOrder.supplier?.supplierName || "-"}</TableCell>
                    <TableCell>{format(new Date(gr.receivedDate), "dd/MM/yyyy", { locale: vi })}</TableCell>
                    <TableCell>{gr.receiver}</TableCell>
                    <TableCell>
                      <Badge className={getStatusClass(gr.status)}>
                        {getStatusText(gr.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{gr.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredGoodsReceived.length)} trong tổng số {filteredGoodsReceived.length} phiếu
            </div>
            <div className="flex items-center space-x-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(prev => Math.max(prev - 1, 1))
                      }}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                        isActive={currentPage === page}
                        className={currentPage === page ? "bg-primary text-primary-foreground" : ""}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(prev => Math.min(prev + 1, totalPages))
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

