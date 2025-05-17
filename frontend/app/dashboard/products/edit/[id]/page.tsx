"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Edit, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import toast from "react-hot-toast"
import { useNotification } from "@/components/notification-context";
import { v4 as uuidv4 } from "uuid";
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
  deliveryTime: number
  status: string
  imageUrl: string
  products: any[]
  purchaseOrders: any[]
}

interface Product {
  productID: number
  productName: string
  unit: string
  stockQuantity: number
  reorderLevel: number
  imageUrl: string
  supplierID: number
  category: {
    categoryID: number
    categoryName: string
    description: string
  }
}

const productSchema = z.object({
  productName: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  description: z.string().optional(),
  unit: z.string().min(1, "Đơn vị tính là bắt buộc"),
  stockQuantity: z.number().min(0, "Số lượng tồn kho phải lớn hơn hoặc bằng 0"),
  reorderLevel: z.number().min(0, "Số lượng tồn kho tối thiểu phải lớn hơn hoặc bằng 0"),
  imageUrl: z.string().optional(),
  categoryID: z.number().min(1, "Danh mục là bắt buộc"),
  supplierID: z.number().min(1, "Nhà cung cấp là bắt buộc"),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)


  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      description: "",
      unit: "",
      stockQuantity: 0,
      reorderLevel: 0,
      imageUrl: "",
      categoryID: 0,
      supplierID: 0,
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
      if (data.imageUrl) {
        setAvatarSrc(data.imageUrl)
      }
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error)
      toast.error("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedCategory = categories.find(c => c.categoryID === form.getValues("categoryID"));
      const selectedSupplier = suppliers.find(s => s.supplierID === form.getValues("supplierID"));

      if (!selectedCategory || !selectedSupplier) {
        throw new Error("Vui lòng chọn danh mục và nhà cung cấp hợp lệ");
      }

      const response = await fetch(`http://localhost:5190/api/product/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productID: parseInt(params.id),
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
        throw new Error(errorData.message || 'Không thể cập nhật sản phẩm');
      }

      // Gửi notification lên NotificationCenter
      const { addNotification } = useNotification();
      addNotification({
        id: uuidv4(),
        title: "Cập nhật sản phẩm",
        message: `Sản phẩm đã được cập nhật thành công!`,
        date: new Date(),
        read: false,
      });
      toast.success("Cập nhật sản phẩm thành công!")
      router.push("/dashboard/products");
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;

    try {
      const categoryData = {
        categoryID: editingCategory.categoryID,
        categoryName: editingCategory.categoryName,
        description: editingCategory.description,
        products: []
      };

      console.log('Dữ liệu gửi đi:', categoryData);

      const response = await fetch(`http://localhost:5190/api/category/${editingCategory.categoryID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        let errorMessage = 'Không thể cập nhật danh mục';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Nếu không parse được JSON, sử dụng status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Nếu response thành công nhưng không có nội dung
      if (response.status === 204) {
        setCategories(categories.map(c => c.categoryID === editingCategory.categoryID ? editingCategory : c));
        setIsCategoryDialogOpen(false);
        setEditingCategory(null);
        toast.success('Cập nhật danh mục thành công');
        return;
      }

      // Nếu có nội dung JSON
      const data = await response.json();
      console.log('Dữ liệu nhận về:', data);

      setCategories(categories.map(c => c.categoryID === data.categoryID ? data : c));
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      toast.success('Cập nhật danh mục thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật danh mục:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật danh mục');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setAvatarSrc(previewURL); // Set ảnh preview

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

      // ✅ Cập nhật URL ảnh thật sau khi upload thành công
      form.setValue("imageUrl", imageUrl, { shouldDirty: true });
      setAvatarSrc(imageUrl); // Set ảnh thật vào preview

      toast.success("Tải ảnh thành công!");
    } catch (err) {
      toast.error("Tải ảnh thất bại");
      console.error(err);
    }
  };

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

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        {/* Card 1 */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-xl text-primary">Thông tin Sản phẩm</CardTitle>
            <CardDescription>Cập nhật thông tin chi tiết về sản phẩm</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="categoryID">Danh mục</Label>
                {/* Nút sửa danh mục */}
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const selectedCategory = categories.find(c => c.categoryID === form.getValues("categoryID"));
                        if (selectedCategory) {
                          setEditingCategory({ ...selectedCategory });
                        }
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      Sửa danh mục
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sửa Danh mục</DialogTitle>
                      <DialogDescription>Cập nhật chi tiết danh mục</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="editCategoryName">Tên danh mục</Label>
                        <Input
                          id="editCategoryName"
                          value={editingCategory?.categoryName || ""}
                          onChange={(e) =>
                            setEditingCategory(prev =>
                              prev ? { ...prev, categoryName: e.target.value } : null
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editCategoryDescription">Mô tả</Label>
                        <Textarea
                          id="editCategoryDescription"
                          value={editingCategory?.description || ""}
                          onChange={(e) =>
                            setEditingCategory(prev =>
                              prev ? { ...prev, description: e.target.value } : null
                            )
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Hủy</Button>
                        <Button type="button" onClick={handleEditCategory} disabled={!editingCategory?.categoryName}>Cập nhật</Button>
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
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-xl text-primary">Thông tin Kho & Hình ảnh</CardTitle>
            <CardDescription>Thông tin số lượng và ảnh sản phẩm</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-5">
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
              <Label htmlFor="reorderLevel">Tồn kho tối thiểu</Label>
              <Input
                id="reorderLevel"
                type="number"
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
              <Label>Hình ảnh sản phẩm</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center relative group">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="Ảnh sản phẩm" />
                  <AvatarFallback>SP</AvatarFallback>
                </Avatar>

                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />

                <Upload className="h-6 w-6 text-muted-foreground mb-2 group-hover:text-primary transition" />
                <p className="text-sm text-muted-foreground group-hover:text-primary">
                  Nhấp để thay đổi ảnh
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG hoặc GIF (tối đa 2MB)
                </p>
              </div>
            </div>

            {/* Nút submit */}
            <div className="md:col-span-2 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
              </Button>
            </div>
          </CardContent>
        </Card>


      </form>
    </div>

  )
} 