"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { Check, X, Search, Clock } from "lucide-react"

interface Approval {
  id: string
  type: "purchase_order" | "payment" | "goods_received"
  requestId: string
  requester: string
  date: string
  amount: number
  status: "pending" | "approved" | "rejected"
  description: string
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/approvals")
      if (!response.ok) {
        throw new Error("Không thể tải danh sách phê duyệt")
      }
      const data = await response.json()
      setApprovals(data)
    } catch (error) {
      console.error("Lỗi khi tải danh sách phê duyệt:", error)
      toast.error("Không thể tải danh sách phê duyệt. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5190/api/approvals/${id}/approve`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Không thể phê duyệt")
      }

      toast.success("Đã phê duyệt thành công")
      fetchApprovals()
    } catch (error) {
      console.error("Lỗi khi phê duyệt:", error)
      toast.error("Không thể phê duyệt. Vui lòng thử lại sau.")
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5190/api/approvals/${id}/reject`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Không thể từ chối")
      }

      toast.success("Đã từ chối thành công")
      fetchApprovals()
    } catch (error) {
      console.error("Lỗi khi từ chối:", error)
      toast.error("Không thể từ chối. Vui lòng thử lại sau.")
    }
  }

  const filteredApprovals = approvals.filter((approval) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      approval.requestId.toLowerCase().includes(searchLower) ||
      approval.requester.toLowerCase().includes(searchLower) ||
      approval.type.toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(filteredApprovals.length / itemsPerPage)
  const paginatedApprovals = filteredApprovals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "purchase_order":
        return "Đơn đặt hàng"
      case "payment":
        return "Thanh toán"
      case "goods_received":
        return "Nhập hàng"
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Đang chờ</Badge>
      case "approved":
        return <Badge variant="success">Đã phê duyệt</Badge>
      case "rejected":
        return <Badge variant="destructive">Đã từ chối</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Phê duyệt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu phê duyệt</CardTitle>
          <CardDescription>Quản lý các yêu cầu cần phê duyệt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo ID, người yêu cầu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Người yêu cầu</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApprovals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Không có yêu cầu phê duyệt nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>{approval.requestId}</TableCell>
                      <TableCell>{getTypeLabel(approval.type)}</TableCell>
                      <TableCell>{approval.requester}</TableCell>
                      <TableCell>{new Date(approval.date).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell>
                        {approval.amount.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell>{approval.description}</TableCell>
                      <TableCell>
                        {approval.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(approval.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Phê duyệt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(approval.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 