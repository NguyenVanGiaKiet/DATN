"use client"

import { useState } from "react"
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

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    productName: "",
    productCode: "",
    categoryID: "",
    supplierID: "",
    description: "",
    unit: "",
    stockQuantity: 0,
    reorderLevel: 0,
    unitPrice: 0,
    image: null as File | null
  })

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Không thể tạo sản phẩm")
      }

      toast.success("Tạo sản phẩm thành công!")
      router.push("/dashboard/products")
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error)
      toast.error("Không thể tạo sản phẩm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Thêm sản phẩm mới</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sản phẩm</CardTitle>
            <CardDescription>Nhập thông tin chi tiết cho sản phẩm mới</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Tên sản phẩm</Label>
              <Input
                id="product-name"
                placeholder="Nhập tên sản phẩm"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-code">Mã sản phẩm</Label>
              <Input
                id="product-code"
                placeholder="Nhập mã sản phẩm"
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select
                value={formData.categoryID}
                onValueChange={(value) => setFormData({ ...formData, categoryID: value })}
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
                value={formData.supplierID}
                onValueChange={(value) => setFormData({ ...formData, supplierID: value })}
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin kho hàng & Giá</CardTitle>
            <CardDescription>Thiết lập thông tin kho và giá cho sản phẩm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Đơn vị tính</Label>
                <Input
                  id="unit"
                  placeholder="Ví dụ: cái, hộp, kg"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock-quantity">Số lượng tồn kho</Label>
                <Input
                  id="stock-quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
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
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
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
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
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
            <Button variant="outline">Lưu nháp</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo sản phẩm"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

