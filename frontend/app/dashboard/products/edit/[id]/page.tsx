"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"

interface Category {
  categoryID: number
  categoryName: string
}

interface Supplier {
  supplierID: number
  supplierName: string
}

interface Product {
  productID: number
  productName: string
  description: string
  unit: string
  unitPrice: number
  stockQuantity: number
  categoryID: number
  supplierID: number
  status: string
}

const productSchema = z.object({
  productName: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  description: z.string().optional(),
  unit: z.string().min(1, "Đơn vị tính là bắt buộc"),
  unitPrice: z.number().min(0, "Giá phải lớn hơn 0"),
  stockQuantity: z.number().min(0, "Số lượng tồn kho phải lớn hơn hoặc bằng 0"),
  categoryID: z.number().min(1, "Danh mục là bắt buộc"),
  supplierID: z.number().min(1, "Nhà cung cấp là bắt buộc"),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      description: "",
      unit: "",
      unitPrice: 0,
      stockQuantity: 0,
      categoryID: 0,
      supplierID: 0,
      status: "Đang bán",
    },
  })

  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
    fetchProduct()
  }, [params.id])

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5190/api/category")
      if (!response.ok) {
        throw new Error("Không thể tải danh mục")
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error)
      toast.error("Không thể tải danh mục. Vui lòng thử lại sau.")
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("http://localhost:5190/api/supplier")
      if (!response.ok) {
        throw new Error("Không thể tải nhà cung cấp")
      }
      const data = await response.json()
      setSuppliers(data)
    } catch (error) {
      console.error("Lỗi khi tải nhà cung cấp:", error)
      toast.error("Không thể tải nhà cung cấp. Vui lòng thử lại sau.")
    }
  }

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/product/${params.id}`)
      if (!response.ok) {
        throw new Error("Không thể tải thông tin sản phẩm")
      }
      const data = await response.json()
      setProduct(data)
      form.reset(data)
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error)
      toast.error("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5190/api/product/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Không thể cập nhật sản phẩm")
      }

      toast.success("Sản phẩm đã được cập nhật thành công")
      router.push("/dashboard/products")
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error)
      toast.error("Không thể cập nhật sản phẩm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !product) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Sản phẩm</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Sản phẩm</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Sản phẩm</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Sản phẩm</CardTitle>
          <CardDescription>Cập nhật thông tin chi tiết về sản phẩm</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Tên sản phẩm</Label>
                <Input
                  id="productName"
                  placeholder="Nhập tên sản phẩm"
                  {...form.register("productName")}
                />
                {form.formState.errors.productName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.productName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Đơn vị tính</Label>
                <Input
                  id="unit"
                  placeholder="Nhập đơn vị tính"
                  {...form.register("unit")}
                />
                {form.formState.errors.unit && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.unit.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Giá</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  placeholder="Nhập giá sản phẩm"
                  {...form.register("unitPrice", { valueAsNumber: true })}
                />
                {form.formState.errors.unitPrice && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.unitPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Tồn kho</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  placeholder="Nhập số lượng tồn kho"
                  {...form.register("stockQuantity", { valueAsNumber: true })}
                />
                {form.formState.errors.stockQuantity && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.stockQuantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryID">Danh mục</Label>
                <Select
                  onValueChange={(value) => form.setValue("categoryID", parseInt(value))}
                  defaultValue={form.getValues("categoryID").toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.categoryID} value={category.categoryID.toString()}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryID && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.categoryID.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierID">Nhà cung cấp</Label>
                <Select
                  onValueChange={(value) => form.setValue("supplierID", parseInt(value))}
                  defaultValue={form.getValues("supplierID").toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.supplierID} value={supplier.supplierID.toString()}>
                        {supplier.supplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.supplierID && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.supplierID.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  onValueChange={(value) => form.setValue("status", value)}
                  defaultValue={form.getValues("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đang bán">Đang bán</SelectItem>
                    <SelectItem value="Ngừng bán">Ngừng bán</SelectItem>
                    <SelectItem value="Hết hàng">Hết hàng</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả sản phẩm"
                {...form.register("description")}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 