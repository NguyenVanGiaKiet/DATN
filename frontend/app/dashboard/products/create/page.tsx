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
import { ArrowLeft, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"

interface Category {
  categoryID: number
  categoryName: string
  description: string
}

interface Supplier {
  supplierID: number
  supplierName: string
  contactPerson: string
  phone: string
  email: string
  address: string
  rating: number
  paymentTerms: string
  deliveryTime: string
  status: string
  imageUrl?: string
}

const productSchema = z.object({
  productName: z.string()
    .min(1, "Tên sản phẩm là bắt buộc")
    .max(100, "Tên sản phẩm không được quá 100 ký tự"),
  unit: z.string()
    .min(1, "Đơn vị tính là bắt buộc")
    .max(20, "Đơn vị tính không được quá 20 ký tự"),
  stockQuantity: z.number()
    .int("Số lượng tồn kho phải là số nguyên")
    .min(0, "Số lượng tồn kho phải lớn hơn hoặc bằng 0"),
  reorderLevel: z.number()
    .int("Số lượng tồn kho tối thiểu phải là số nguyên")
    .min(0, "Số lượng tồn kho tối thiểu phải lớn hơn hoặc bằng 0"),
  imageUrl: z.string().optional(),
  categoryID: z.number().min(1, "Danh mục là bắt buộc"),
  supplierID: z.number().min(1, "Nhà cung cấp là bắt buộc"),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function CreateProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    categoryName: "",
    description: ""
  })

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      unit: "",
      stockQuantity: 0,
      reorderLevel: 0,
      imageUrl: "",
      categoryID: 0,
      supplierID: 0,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch("http://localhost:5190/api/category")
        if (!categoriesResponse.ok) {
          throw new Error("Không thể tải danh mục")
        }
        const categoriesData = await categoriesResponse.json()
        console.log("Danh mục:", categoriesData)
        setCategories(categoriesData)

        // Fetch suppliers
        const suppliersResponse = await fetch("http://localhost:5190/api/supplier")
        if (!suppliersResponse.ok) {
          throw new Error("Không thể tải nhà cung cấp")
        }
        const suppliersData = await suppliersResponse.json()
        console.log("Nhà cung cấp:", suppliersData)
        setSuppliers(suppliersData)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.")
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedCategory = categories.find(c => c.categoryID === form.getValues("categoryID"));
      const selectedSupplier = suppliers.find(s => s.supplierID === form.getValues("supplierID"));

      if (!selectedCategory || !selectedSupplier) {
        throw new Error("Vui lòng chọn danh mục và nhà cung cấp hợp lệ");
      }

      const response = await fetch('http://localhost:5190/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: form.getValues("productName"),
          unit: form.getValues("unit"),
          stockQuantity: form.getValues("stockQuantity"),
          reorderLevel: form.getValues("reorderLevel"),
          imageUrl: form.getValues("imageUrl"),
          categoryID: form.getValues("categoryID"),
          supplierID: form.getValues("supplierID"),
          Category: {
            categoryID: selectedCategory.categoryID,
            categoryName: selectedCategory.categoryName,
            description: selectedCategory.description,
            products: []
          },
          Supplier: {
            supplierID: selectedSupplier.supplierID,
            supplierName: selectedSupplier.supplierName,
            contactPerson: selectedSupplier.contactPerson,
            phone: selectedSupplier.phone,
            email: selectedSupplier.email,
            address: selectedSupplier.address,
            rating: selectedSupplier.rating,
            paymentTerms: selectedSupplier.paymentTerms,
            deliveryTime: selectedSupplier.deliveryTime,
            status: selectedSupplier.status,
            imageUrl: selectedSupplier.imageUrl,
            products: [],
            purchaseOrders: []
          },
          ReturnsToSupplier: [],
          PurchaseOrderDetails: []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lỗi từ server:', errorData);
        throw new Error(errorData.message || 'Không thể tạo sản phẩm');
      }

      const data = await response.json();
      toast.success('Tạo sản phẩm thành công');
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      const categoryData = {
        categoryName: newCategory.categoryName,
        description: newCategory.description,
        products: []
      };

      console.log('Dữ liệu gửi đi:', categoryData);

      const response = await fetch("http://localhost:5190/api/category", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        let errorMessage = 'Không thể tạo danh mục';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Dữ liệu nhận về:', data);

      setCategories([...categories, data]);
      setIsCategoryDialogOpen(false);
      setNewCategory({ categoryName: "", description: "" });
      toast.success('Tạo danh mục thành công');
    } catch (error) {
      console.error('Lỗi khi tạo danh mục:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể tạo danh mục');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5190/api/product/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      const imageUrl = data.url;

      // ✅ Gán giá trị ảnh vào form
      form.setValue("imageUrl", imageUrl, { shouldDirty: true });

      toast.success("Tải ảnh thành công!");
    } catch (err) {
      toast.error("Tải ảnh thất bại");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Thêm Sản phẩm Mới</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Sản phẩm</CardTitle>
          <CardDescription>Nhập thông tin chi tiết về sản phẩm mới</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <Label htmlFor="stockQuantity">Số lượng tồn kho</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  step="1"
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
                <Label htmlFor="reorderLevel">Số lượng tồn kho tối thiểu</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  step="1"
                  placeholder="Nhập số lượng tồn kho tối thiểu"
                  {...form.register("reorderLevel", { valueAsNumber: true })}
                />
                {form.formState.errors.reorderLevel && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.reorderLevel.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="categoryID">Danh mục</Label>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Thêm danh mục
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm Danh mục Mới</DialogTitle>
                        <DialogDescription>
                          Thêm thông tin chi tiết về danh mục sản phẩm mới
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newCategoryName">Tên danh mục</Label>
                          <Input
                            id="newCategoryName"
                            value={newCategory.categoryName}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, categoryName: e.target.value }))}
                            placeholder="Nhập tên danh mục"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newCategoryDescription">Mô tả</Label>
                          <Textarea
                            id="newCategoryDescription"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Nhập mô tả danh mục"
                          />
                        </div>
                        <div className="flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCategoryDialogOpen(false)}
                          >
                            Hủy
                          </Button>
                          <Button
                            type="button"
                            onClick={handleAddCategory}
                            disabled={!newCategory.categoryName}
                          >
                            Thêm
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                <label className="block text-sm font-medium">Ảnh đại diện</label>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                {form.watch("imageUrl") && (
                  <img
                    src={form.watch("imageUrl")}
                    alt="Ảnh đại diện"
                    className="w-40 h-40 object-cover rounded-lg border mt-2"
                  />
                )}

              </div>
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
                {loading ? "Đang tạo..." : "Tạo sản phẩm"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

