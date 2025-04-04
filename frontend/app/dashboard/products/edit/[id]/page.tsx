"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload } from "lucide-react"
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
  categoryID: number
  supplierID: number
  category: {
    categoryName: string
  }
  supplier: {
    supplierName: string
  }
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)

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

  const handleSubmit = async () => {
    if (!product) return

    try {
      setSaving(true)
      const response = await fetch(`http://localhost:5190/api/product/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        throw new Error("Không thể cập nhật sản phẩm")
      }

      toast.success("Cập nhật sản phẩm thành công!")
      router.push("/dashboard/products")
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error)
      toast.error("Không thể cập nhật sản phẩm. Vui lòng thử lại sau.")
    } finally {
      setSaving(false)
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
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa sản phẩm</h1>
          <p className="text-muted-foreground">Mã sản phẩm: {product.productCode}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sản phẩm</CardTitle>
            <CardDescription>Chỉnh sửa thông tin chi tiết sản phẩm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Tên sản phẩm</Label>
              <Input
                id="product-name"
                placeholder="Nhập tên sản phẩm"
                value={product.productName}
                onChange={(e) => setProduct({ ...product, productName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select
                value={product.categoryID.toString()}
                onValueChange={(value) => setProduct({ ...product, categoryID: parseInt(value) })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Đèn chiếu sáng</SelectItem>
                  <SelectItem value="2">Lọc nước</SelectItem>
                  <SelectItem value="3">Chậu cây</SelectItem>
                  <SelectItem value="4">Thiết bị gia dụng</SelectItem>
                  <SelectItem value="5">Thiết bị đeo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Nhà cung cấp</Label>
              <Select
                value={product.supplierID.toString()}
                onValueChange={(value) => setProduct({ ...product, supplierID: parseInt(value) })}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Chọn nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Luminance Creations</SelectItem>
                  <SelectItem value="2">HydraClean Solutions</SelectItem>
                  <SelectItem value="3">GreenGrowth Designers</SelectItem>
                  <SelectItem value="4">FreshTech Appliances</SelectItem>
                  <SelectItem value="5">Vitality Gear Co.</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả sản phẩm"
                rows={4}
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin kho hàng & Giá</CardTitle>
            <CardDescription>Cập nhật thông tin kho và giá cho sản phẩm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Đơn vị tính</Label>
                <Input
                  id="unit"
                  placeholder="Ví dụ: cái, hộp, kg"
                  value={product.unit}
                  onChange={(e) => setProduct({ ...product, unit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock-quantity">Số lượng tồn kho</Label>
                <Input
                  id="stock-quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={product.stockQuantity}
                  onChange={(e) => setProduct({ ...product, stockQuantity: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reorder-level">Mức tồn kho tối thiểu</Label>
                <Input
                  id="reorder-level"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={product.reorderLevel}
                  onChange={(e) => setProduct({ ...product, reorderLevel: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-price">Đơn giá</Label>
                <Input
                  id="unit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={product.unitPrice}
                  onChange={(e) => setProduct({ ...product, unitPrice: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh sản phẩm</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Kéo thả hoặc nhấp để tải lên</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG hoặc GIF (tối đa 2MB)</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Chọn tệp
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 