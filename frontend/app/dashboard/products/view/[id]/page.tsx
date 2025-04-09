"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Package, Printer, FileText, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

interface Product {
  productID: number
  productName: string
  unit: string
  stockQuantity: number
  category: {
    categoryID: number
    categoryName: string
    description: string
  }
  supplierID: number
  supplier: {
    supplierName: string
    contactPerson: string
    phone: string
    email: string
    address: string
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

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết Sản phẩm</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground mt-2">Đang tải dữ liệu...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết Sản phẩm</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Không tìm thấy sản phẩm</p>
            </div>
          </CardContent>
        </Card>
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
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết Sản phẩm</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            In
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
          <Link href={`/dashboard/products/edit/${product.productID}`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Thông tin chi tiết về sản phẩm</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã sản phẩm</p>
                <p className="font-medium">{product.productID}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tên sản phẩm</p>
                <p className="font-medium">{product.productName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Danh mục</p>
                <p className="font-medium">{product.category.categoryName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đơn vị tính</p>
                <p className="font-medium">{product.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tồn kho</p>
                <p className="font-medium">{product.stockQuantity}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mô tả danh mục</p>
              <p className="font-medium">{product.category.description || "Không có mô tả"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhà cung cấp</CardTitle>
            <CardDescription>Thông tin về nhà cung cấp sản phẩm</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tên nhà cung cấp</p>
                <p className="font-medium">{product.supplier.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Người liên hệ</p>
                <p className="font-medium">{product.supplier.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{product.supplier.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{product.supplier.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                <p className="font-medium">{product.supplier.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 