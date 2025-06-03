"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { vi } from "date-fns/locale"
import { format } from "date-fns"

interface Invoice {
  invoiceID: number
  purchaseOrderID: string
  invoiceDate: string
  totalAmount: number
  paymentStatus: string
  dueDate: string
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch("http://localhost:5190/api/Invoice")
        if (!response.ok) throw new Error("Không thể tải dữ liệu hóa đơn")
        const data = await response.json()
        const sortedData = data.sort((a: Invoice, b: Invoice) =>
          new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
        )
        setInvoices(sortedData)
      } catch (e) {
        setInvoices([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đã thanh toán":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors"
      case "Chưa thanh toán":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 transition-colors"
    }
  }
  const getStatusText = (status: string) => {
    switch (status) {
      case "Paid":
        return "Đã thanh toán"
      case "Pending":
        return "Chưa thanh toán"
      default:
        return status
    }
  }
  const filtered = invoices.filter(invoice =>
    String(invoice.purchaseOrderID || "").toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold tracking-tight">Hóa đơn</h1>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">Danh sách hóa đơn</CardTitle>
              <CardDescription>Quản lý thông tin các hóa đơn</CardDescription>
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
                  <TableHead>Mã hóa đơn</TableHead>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Ngày hóa đơn</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái thanh toán</TableHead>
                  <TableHead>Ngày đáo hạn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7}>Đang tải...</TableCell></TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow><TableCell colSpan={7}>Không có dữ liệu</TableCell></TableRow>
                ) : paginated.map((invoice, idx) => (
                  <TableRow
                    key={invoice.invoiceID}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">INV-{invoice.invoiceID.toString().padStart(4, '0')}</TableCell>
                    <TableCell>{invoice.purchaseOrderID}</TableCell>
                    <TableCell>{format(new Date(invoice.invoiceDate), "dd/MM/yyyy", { locale: vi })}</TableCell>
                    <TableCell>{invoice.totalAmount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusClass(invoice.paymentStatus)}>
                        {getStatusText(invoice.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), "dd/MM/yyyy", { locale: vi })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, filtered.length)} trong tổng số {filtered.length} hóa đơn
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
