"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Edit, Printer } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import toast from "react-hot-toast"

interface GoodsReceived {
  goodsReceivedID: string
  purchaseOrderID: string
  receivedDate: string
  totalAmount: number
  status: string
  notes: string
  goodsReceivedDetails: {
    productID: number
    product: {
      productName: string
      unit: string
    }
    quantity: number
    unitPrice: number
    amount: number
  }[]
  purchaseOrder: {
    supplier: {
      supplierName: string
      contactPerson: string
      phone: string
      email: string
      address: string
    }
  }
}

export default function ViewGoodsReceivedPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [goodsReceived, setGoodsReceived] = useState<GoodsReceived | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoodsReceived()
  }, [params.id])

  const fetchGoodsReceived = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/goodsreceived/${params.id}`)
      if (!response.ok) {
        throw new Error("Không thể tải thông tin phiếu nhập hàng")
      }
      const data = await response.json()
      setGoodsReceived(data)
    } catch (error) {
      console.error("Lỗi khi tải thông tin phiếu nhập hàng:", error)
      toast.error("Không thể tải thông tin phiếu nhập hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Đã nhập":
        return <Badge className="bg-green-500">Đã nhập</Badge>
      case "Đang xử lý":
        return <Badge className="bg-yellow-500">Đang xử lý</Badge>
      case "Đã hủy":
        return <Badge className="bg-red-500">Đã hủy</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!goodsReceived) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-lg text-muted-foreground">Không tìm thấy phiếu nhập hàng</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết Phiếu Nhập Hàng</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            In
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Tải xuống
          </Button>
          <Button size="sm" onClick={() => router.push(`/dashboard/goods-received/edit/${params.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã phiếu nhập</p>
                <p className="font-medium">{goodsReceived.goodsReceivedID}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                <p className="font-medium">{goodsReceived.purchaseOrderID}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày nhập</p>
                <p className="font-medium">{formatDate(goodsReceived.receivedDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <div className="mt-1">{getStatusBadge(goodsReceived.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Thông tin nhà cung cấp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tên nhà cung cấp</p>
                <p className="font-medium">{goodsReceived.purchaseOrder.supplier.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Người liên hệ</p>
                <p className="font-medium">{goodsReceived.purchaseOrder.supplier.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Điện thoại</p>
                <p className="font-medium">{goodsReceived.purchaseOrder.supplier.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{goodsReceived.purchaseOrder.supplier.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                <p className="font-medium">{goodsReceived.purchaseOrder.supplier.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goodsReceived.goodsReceivedDetails.map((detail) => (
                  <TableRow key={detail.productID}>
                    <TableCell>{detail.product.productName}</TableCell>
                    <TableCell>{detail.product.unit}</TableCell>
                    <TableCell>{formatCurrency(detail.unitPrice)}</TableCell>
                    <TableCell>{detail.quantity}</TableCell>
                    <TableCell>{formatCurrency(detail.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Tổng tiền
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(goodsReceived.totalAmount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {goodsReceived.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{goodsReceived.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 