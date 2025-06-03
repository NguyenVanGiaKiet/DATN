"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { vi } from "date-fns/locale"
import { format } from "date-fns"

interface ReturnOrder {
  returnID: number
  purchaseOrderID: string
  returnDate: string
  returnReason: string
  processedBy: string
}

export default function ReturnOrdersPage() {
  const router = useRouter();
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchReturnOrders = async () => {
      try {
        const response = await fetch("http://localhost:5190/api/ReturnToSupplier")
        if (!response.ok) throw new Error("Không thể tải dữ liệu đơn trả hàng")
        const data = await response.json()
        const sortedData = data.sort((a: ReturnOrder, b: ReturnOrder) =>
          new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime()
        )
        setReturnOrders(sortedData)
      } catch (e) {
        setReturnOrders([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchReturnOrders()
  }, [])

  const filtered = returnOrders.filter(order =>
    String(order.purchaseOrderID || "").toLowerCase().includes(searchTerm.toLowerCase())
  )
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filtered.length / itemsPerPage)

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
        <h1 className="text-3xl font-bold tracking-tight">Đơn trả hàng</h1>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">Danh sách đơn trả hàng</CardTitle>
              <CardDescription>Quản lý thông tin các đơn trả hàng</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full max-w-sm relative">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã trả hàng</TableHead>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Ngày trả</TableHead>
                  <TableHead>Lý do trả</TableHead>
                  <TableHead>Người trả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7}>Đang tải...</TableCell></TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow><TableCell colSpan={7}>Không có dữ liệu</TableCell></TableRow>
                ) : paginated.map((order, idx) => (
                  <TableRow
                    key={order.returnID}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">RT-{order.returnID.toString().padStart(4, '0')}</TableCell>
                    <TableCell>{order.purchaseOrderID}</TableCell>
                    <TableCell>{format(new Date(order.returnDate), "dd/MM/yyyy", { locale: vi })}</TableCell>
                    <TableCell>{order.returnReason}</TableCell>
                    <TableCell>{order.processedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, filtered.length)} trong tổng số {filtered.length} đơn trả hàng
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
