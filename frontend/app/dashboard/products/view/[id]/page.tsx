"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Printer, Edit } from "lucide-react"
import toast from "react-hot-toast"

interface Product {
  productID: number
  productName: string
  productCode: string
  description: string
  unit: string
  unitPrice: number
  stockQuantity: number
  reorderLevel: number
  status: string
  category: {
    categoryName: string
  }
  supplier: {
    supplierName: string
    contactPerson: string
    phone: string
    email: string
  }
}

export default function ViewProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/product/${params.id}`)
      if (!response.ok) {
        throw new Error("Không thể tải thông tin sản phẩm")
      }
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error)
      toast.error("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Đang bán":
        return "bg-green-100 text-green-800 border-green-300"
      case "Ngừng bán":
        return "bg-red-100 text-red-800 border-red-300"
      case "Hết hàng":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Không tìm thấy thông tin sản phẩm</p>
        <Button onClick={() => router.push("/dashboard/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.productName}</h1>
            <p className="text-muted-foreground">Mã sản phẩm: {product.productCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            In thông tin
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
          <Link href={`/dashboard/products/edit/${product.productID}`}>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sản phẩm</CardTitle>
            <CardDescription>Chi tiết thông tin sản phẩm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              <Badge variant="outline" className={getStatusClass(product.status)}>
                {product.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Danh mục</span>
              <span>{product.category.categoryName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Đơn vị tính</span>
              <span>{product.unit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Đơn giá</span>
              <span className="font-medium">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(product.unitPrice)}
              </span>
            </div>
            {product.description && (
              <div className="space-y-2">
                <span className="text-muted-foreground">Mô tả</span>
                <p className="text-sm">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin kho hàng & Nhà cung cấp</CardTitle>
            <CardDescription>Chi tiết về tồn kho và nhà cung cấp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Số lượng tồn kho</span>
              <span>{product.stockQuantity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mức tồn kho tối thiểu</span>
              <span>{product.reorderLevel}</span>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Thông tin nhà cung cấp</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tên nhà cung cấp</span>
                  <span>{product.supplier.supplierName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Người liên hệ</span>
                  <span>{product.supplier.contactPerson}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Số điện thoại</span>
                  <span>{product.supplier.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{product.supplier.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 