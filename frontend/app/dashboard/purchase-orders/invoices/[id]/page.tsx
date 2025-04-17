"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Save, DollarSign, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DatePicker } from "@/components/date-picker"
import toast from "react-hot-toast"
import { addDays } from "date-fns"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface PurchaseOrderDetail {
    poDetailID: number
    productID: number
    product: {
        productName: string
        unit: string
    }
    quantity: number
    unitPrice: number
    totalPrice: number
    receivedQuantity: number
}

interface PurchaseOrder {
    purchaseOrderID: string
    supplier: {
        supplierName: string
    }
    orderDate: string
    expectedDeliveryDate: string
    totalAmount: number
    status: string
    purchaseOrderDetails: PurchaseOrderDetail[]
    invoiceID?: string
}

interface Invoice {
    invoiceID: number
    purchaseOrderID: string
    invoiceDate: string
    dueDate: string
    totalAmount: number
    paymentStatus: string
    payments?: { amountPaid: number }[]
}

export default function InvoicePage() {
    const router = useRouter()
    const params = useParams()
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
    const [invoiceDate, setInvoiceDate] = useState<Date>(new Date())
    const [paymentDueDate, setPaymentDueDate] = useState<Date>(addDays(new Date(), 30)) // Mặc định 30 ngày
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("Bank Transfer")
    const [processedBy, setProcessedBy] = useState("")
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)
    const [paymentDate, setPaymentDate] = useState<Date>(new Date())

    useEffect(() => {
        const fetchPurchaseOrder = async () => {
            try {
                setIsLoading(true)
                if (!params || !params.id) {
                    throw new Error("Invalid parameters");
                }
                const response = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
                if (!response.ok) {
                    throw new Error("Không thể tải thông tin đơn hàng")
                }
                const data = await response.json()
                setPurchaseOrder(data)
            } catch (error) {
                console.error("Lỗi khi tải thông tin đơn hàng:", error)
                toast.error("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.")
            } finally {
                setIsLoading(false)
            }
        }

        if (params && params.id) {
            fetchPurchaseOrder()
        }
    }, [params?.id])

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                if (!params || !params.id) return

                const response = await fetch(`http://localhost:5190/api/invoice/order/${params.id}`)
                if (!response.ok) {
                    throw new Error("Không thể tải thông tin hóa đơn")
                }
                const data = await response.json()
                // Lấy hóa đơn mới nhất nếu có nhiều hóa đơn
                if (Array.isArray(data) && data.length > 0) {
                    setInvoice(data[0])
                }
            } catch (error) {
                console.error("Lỗi khi tải hóa đơn:", error)
                toast.error(error instanceof Error ? error.message : "Không thể tải thông tin hóa đơn")
            }
        }

        fetchInvoice()
    }, [params?.id])

    useEffect(() => {
        // Khi purchaseOrder thay đổi, cập nhật số tiền thanh toán
        if (purchaseOrder) {
            setPaymentAmount(purchaseOrder.totalAmount.toString())
        }
    }, [purchaseOrder])

    const handleCreateInvoice = async () => {
        try {
            setIsCreatingInvoice(true)
            if (!params || !params.id) {
                throw new Error("Invalid parameters");
            }

            const invoiceData = {
                purchaseOrderID: params.id,
                invoiceDate: invoiceDate.toISOString(),
                dueDate: paymentDueDate.toISOString(),
                totalAmount: purchaseOrder?.totalAmount || 0,
                paymentStatus: "Chưa thanh toán"
            };

            const response = await fetch(`http://localhost:5190/api/invoice`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(invoiceData)
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể tạo hóa đơn");
            }

            const result = await response.json();
            toast.success("Hóa đơn đã được tạo thành công!")
            window.location.reload()
            // Update purchaseOrder with the new invoiceID
            if (purchaseOrder) {
                setPurchaseOrder({
                    ...purchaseOrder,
                    invoiceID: result.invoiceId.toString()
                });
            }

            // Tải lại thông tin đơn hàng để cập nhật trạng thái
            const orderResponse = await fetch(`http://localhost:5190/api/purchaseorder/${params.id}`)
            if (orderResponse.ok) {
                const updatedOrder = await orderResponse.json()
                setPurchaseOrder(prev => ({
                    ...updatedOrder,
                    invoiceID: result.invoiceId.toString()
                }))
            }
        } catch (error) {
            console.error("Lỗi khi tạo hóa đơn:", error)
            toast.error(error instanceof Error ? error.message : "Không thể tạo hóa đơn. Vui lòng thử lại sau.")
        } finally {
            setIsCreatingInvoice(false)
        }
    }

    const handleCreatePayment = async () => {
        try {
            // Validate processedBy
            if (!processedBy.trim()) {
                toast.error("Vui lòng nhập tên người xử lý thanh toán");
                return;
            }

            setIsProcessingPayment(true)

            // Kiểm tra có hóa đơn không
            if (!invoice) {
                throw new Error("Không tìm thấy thông tin hóa đơn");
            }

            const paymentData = {
                invoiceID: invoice.invoiceID,
                paymentDate: paymentDate.toISOString(),
                amountPaid: Number(paymentAmount),
                paymentMethod: paymentMethod,
                processedBy: processedBy.trim()
            };

            const response = await fetch(`http://localhost:5190/api/payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Payment creation failed:", errorData);
                throw new Error(errorData.message || "Không thể tạo thanh toán");
            }

            const result = await response.json();
            console.log("Payment created successfully:", result);

            // Cập nhật thông tin hóa đơn sau khi thanh toán thành công
            const updatedInvoiceResponse = await fetch(`http://localhost:5190/api/invoice/order/${params?.id}`);
            if (updatedInvoiceResponse.ok) {
                const updatedInvoices = await updatedInvoiceResponse.json();
                if (Array.isArray(updatedInvoices) && updatedInvoices.length > 0) {
                    setInvoice(updatedInvoices[0]);
                }
            }

            // Cập nhật thông tin đơn hàng
            const updatedOrderResponse = await fetch(`http://localhost:5190/api/purchaseorder/${params?.id}`);
            if (updatedOrderResponse.ok) {
                const updatedOrder = await updatedOrderResponse.json();
                setPurchaseOrder(updatedOrder);
            }

            toast.success("Đã ghi nhận thanh toán thành công!")
            setShowPaymentDialog(false)

            // Reset form fields
            setPaymentAmount("");
            setProcessedBy("");
            setPaymentMethod("Bank Transfer");
            setPaymentDate(new Date());

        } catch (error) {
            console.error("Payment creation error:", error)
            toast.error(error instanceof Error ? error.message : "Không thể tạo thanh toán. Vui lòng thử lại sau.")
        } finally {
            setIsProcessingPayment(false)
        }
    }

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
    const formatNumber = (value: string) => {
        // Xóa tất cả ký tự không phải số
        const numericValue = value.replace(/\D/g, '');
        // Thêm dấu chấm mỗi 3 chữ số
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const numericValue = rawValue.replace(/\D/g, ''); // giữ lại số
        setPaymentAmount(numericValue); // lưu giá trị raw
    };
    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-bold">
                        {purchaseOrder?.status === "Đã xuất hóa đơn" ? "Ghi nhận thanh toán" : "Tạo hóa đơn"} cho đơn hàng {params?.id || "N/A"}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    {invoice && (
                        <div className="text-sm text-gray-600">
                            Số tiền đã thanh toán: {invoice.payments?.reduce((sum, payment) => sum + payment.amountPaid, 0).toLocaleString("vi-VN")} VND
                        </div>
                    )}
                    {purchaseOrder?.status === "Đã xuất hóa đơn" || purchaseOrder?.status === "Thanh toán một phần"? (
                        <Button
                            onClick={() => setShowPaymentDialog(true)}
                            disabled={isProcessingPayment}
                        >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Ghi nhận thanh toán
                        </Button>
                    ) : (
                        <Button
                            onClick={handleCreateInvoice}
                            disabled={isCreatingInvoice || purchaseOrder?.status === "Đã thanh toán"}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            {isCreatingInvoice ? "Đang tạo..." : "Xác nhận"}
                        </Button>
                    )}
                </div>
            </div>

            {purchaseOrder && (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin hóa đơn</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Ngày xuất hóa đơn</label>
                                    <DatePicker
                                        date={invoiceDate}
                                        onSelect={setInvoiceDate}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Ngày đến hạn thanh toán</label>
                                    <DatePicker
                                        date={paymentDueDate}
                                        onSelect={setPaymentDueDate}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nhà cung cấp</p>
                                    <p className="font-medium">{purchaseOrder.supplier.supplierName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày đặt hàng</p>
                                    <p className="font-medium">
                                        {new Date(purchaseOrder.orderDate).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày giao hàng dự kiến</p>
                                    <p className="font-medium">
                                        {new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tổng giá trị</p>
                                    <p className="font-medium">
                                        {purchaseOrder.totalAmount.toLocaleString("vi-VN")} VND
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết sản phẩm</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead>Đơn vị</TableHead>
                                        <TableHead className="text-left">Đơn giá</TableHead>
                                        <TableHead className="text-left">Số lượng đặt</TableHead>
                                        <TableHead className="text-left">Số lượng đã nhận</TableHead>
                                        <TableHead className="text-left">Thành tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchaseOrder.purchaseOrderDetails.map((detail) => (
                                        <TableRow key={detail.poDetailID}>
                                            <TableCell>{detail.product.productName}</TableCell>
                                            <TableCell>{detail.product.unit}</TableCell>
                                            <TableCell className="text-left">
                                                {detail.unitPrice.toLocaleString("vi-VN")}
                                            </TableCell>
                                            <TableCell className="text-left">{detail.quantity}</TableCell>
                                            <TableCell className="text-left">{detail.receivedQuantity}</TableCell>
                                            <TableCell className="text-left">
                                                {detail.totalPrice.toLocaleString("vi-VN")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Ghi nhận thanh toán</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin thanh toán cho hóa đơn
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="paymentDate" className="text-right">
                                Ngày thanh toán
                            </Label>
                            <div className="col-span-3">
                                <DatePicker
                                    date={paymentDate}
                                    onSelect={setPaymentDate}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Số tiền
                            </Label>
                            <Input
                                id="amount"
                                type="text"
                                value={formatNumber(paymentAmount)}
                                onChange={handleChange}
                                className="col-span-3"
                                placeholder="Nhập số tiền thanh toán"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="method" className="text-right">
                                Phương thức
                            </Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Chọn phương thức thanh toán" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bank Transfer">Chuyển khoản</SelectItem>
                                    <SelectItem value="Cash">Tiền mặt</SelectItem>
                                    <SelectItem value="Credit Card">Thẻ tín dụng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="processedBy" className="text-right">
                                Người xử lý
                            </Label>
                            <Input
                                id="processedBy"
                                value={processedBy}
                                onChange={(e) => setProcessedBy(e.target.value)}
                                className="col-span-3"
                                placeholder="Nhập tên người xử lý"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreatePayment} disabled={isProcessingPayment}>
                            {isProcessingPayment ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác nhận"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}