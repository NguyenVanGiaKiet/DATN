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

interface Payment {
  paymentID: number
  invoiceID: number
  paymentDate: string
  amountPaid: number
  processedBy: string
  paymentMethod: string
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch("http://localhost:5190/api/payment")
        if (!response.ok) throw new Error("Không thể tải dữ liệu thanh toán")
        const data = await response.json()
        const sortedData = data.sort((a: Payment, b: Payment) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        )
        setPayments(sortedData)
      } catch (e) {
        setPayments([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchPayments()
  }, [])

  const filtered = payments.filter(payment =>
    String(payment.invoiceID || "").toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold tracking-tight">Thanh toán</h1>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">Danh sách thanh toán</CardTitle>
              <CardDescription>Quản lý thông tin các thanh toán</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full max-w-sm relative">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input
                placeholder="Tìm kiếm theo mã hóa đơn..."
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
                  <TableHead>Mã thanh toán</TableHead>
                  <TableHead>Mã hóa đơn</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Phương thức thanh toán</TableHead>
                  <TableHead>Người thanh toán</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7}>Đang tải...</TableCell></TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow><TableCell colSpan={7}>Không có dữ liệu</TableCell></TableRow>
                ) : paginated.map((payment, idx) => (
                  <TableRow
                    key={payment.paymentID}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">PAY-{payment.paymentID.toString().padStart(4, '0')}</TableCell>
                    <TableCell className="font-medium">INV-{payment.invoiceID.toString().padStart(4, '0')}</TableCell>
                    <TableCell>{format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: vi })}</TableCell>
                    <TableCell>{payment.amountPaid?.toLocaleString()}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>{payment.processedBy}</TableCell>
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
