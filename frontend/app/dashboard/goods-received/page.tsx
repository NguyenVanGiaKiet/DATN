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
import { CalendarIcon, ChevronLeft, ChevronRight, Search } from "lucide-react"

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
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors"
      case "Partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors"
      case "Pending":
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 transition-colors"
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">Danh sách phiếu nhận hàng</CardTitle>
              <CardDescription>
                Quản lý thông tin các phiếu nhận hàng
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2 w-full max-w-sm relative">
              <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng hoặc nhà cung cấp"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(currentPage-1)*itemsPerPage+1} đến {Math.min(currentPage*itemsPerPage, filteredGoodsReceived.length)} trong tổng số {filteredGoodsReceived.length} đơn trả hàng
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

