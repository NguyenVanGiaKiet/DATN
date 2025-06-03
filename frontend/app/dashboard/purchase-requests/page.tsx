"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Eye, Check, X, Search } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import toast from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PurchaseRequest {
    purchaseRequestID: number
    createdDate: string
    requester: string
    department: string
    note: string
    priority: string
    reason: string
    status: string
    reviewedBy: string
    purchaseOrderID: string // Thêm trường này để nhận biết đã có đơn hàng chưa
}
export default function PurchaseRequestPage() {
    const router = useRouter()
    const [requests, setRequests] = useState<PurchaseRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
    const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
    const [purchaseOrderStatus, setPurchaseOrderStatus] = useState<string | null>(null)
    const [purchaseOrderID, setPurchaseOrderID] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleActionClick = (pr: PurchaseRequest, type: "approve" | "reject") => {
        setSelectedRequest(pr);
        setActionType(type);
        setDialogOpen(true);
    };

    function sortRequests(data: PurchaseRequest[]) {
        return data.sort((a, b) => b.purchaseRequestID - a.purchaseRequestID)
    }
    const handleConfirm = async () => {
        if (!selectedRequest || !actionType) return;
        setProcessing(true);
        const endpoint = actionType === "approve"
            ? `http://localhost:5190/api/PurchaseRequest/${selectedRequest.purchaseRequestID}/approve`
            : `http://localhost:5190/api/PurchaseRequest/${selectedRequest.purchaseRequestID}/reject`;
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Chưa đăng nhập")
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Có lỗi khi cập nhật trạng thái");
            // reload data
            const dataRes = await fetch("http://localhost:5190/api/PurchaseRequest");
            const data = await dataRes.json();
            setRequests(sortRequests(data));
        } catch (e) {
            // handle error (có thể hiển thị toast)
        } finally {
            setProcessing(false);
            setDialogOpen(false);
            setSelectedRequest(null);
            setActionType(null);
        }
    };

    useEffect(() => {
        fetch("http://localhost:5190/api/PurchaseRequest")
            .then(res => res.json())
            .then(data => {
                setRequests(sortRequests(data))
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])




    // Filtered requests
    const filteredRequests = requests.filter(pr => {
        const matchesSearch =
            pr.purchaseRequestID.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pr.department.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const currentItems = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }
    const getStatusClass = (status: string) => {
        switch (status) {
            case "Đã duyệt":
                return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors"
            case "Không duyệt":
                return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 transition-colors"
            case "Chờ duyệt":
                return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 transition-colors"
            default:
                return "bg-gray-100 text-gray-800 border-gray-300"
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "Đã duyệt":
                return "Đã duyệt"
            case "Không duyệt":
                return "Không duyệt"
            case "Chờ duyệt":
                return "Chờ duyệt"
            default:
                return status
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Yêu cầu mua hàng</h1>
                <Link href="/dashboard/purchase-requests/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo yêu cầu
                    </Button>
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-primary">Danh sách yêu cầu mua hàng</CardTitle>
                            <CardDescription>
                                Quản lý thông tin các yêu cầu mua hàng
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full max-w-sm relative">
                            <Search className="h-4 w-4 text-muted-foreground absolute ml-2" />
                            <Input
                                placeholder="Tìm kiếm theo mã đơn hàng hoặc nhà cung cấp"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã yêu cầu</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead>Người yêu cầu</TableHead>
                                    <TableHead>Bộ phận</TableHead>
                                    <TableHead>Độ ưu tiên</TableHead>
                                    <TableHead>Lý do</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Người duyệt</TableHead>
                                    <TableHead>Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map((pr: PurchaseRequest) => (
                                    <TableRow
                                        key={pr.purchaseRequestID}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.push(`/dashboard/purchase-requests/edit/${pr.purchaseRequestID}`)}
                                    >
                                        <TableCell className="font-medium">PR-{pr.purchaseRequestID.toString().padStart(4, '0')}</TableCell>
                                        <TableCell>{format(new Date(pr.createdDate), "dd/MM/yyyy", { locale: vi })}</TableCell>
                                        <TableCell>{pr.requester}</TableCell>
                                        <TableCell>{pr.department}</TableCell>
                                        <TableCell>{pr.priority}</TableCell>
                                        <TableCell>{pr.reason}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusClass(pr.status)}>
                                                {getStatusText(pr.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{pr.reviewedBy}</TableCell>
                                        <TableCell className="flex gap-2">
                                            {/* Nếu chưa có purchaseOrderID và đã duyệt thì hiển thị nút tạo đơn hàng */}
                                            {pr.status === "Đã duyệt" && !pr.purchaseOrderID && (
                                                <Link href={`/dashboard/purchase-requests/edit/${pr.purchaseRequestID}`} passHref legacyBehavior>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        Chưa có đơn hàng
                                                    </Button>
                                                </Link>
                                            )}
                                            {/* Các nút duyệt/từ chối giữ nguyên logic cũ */}
                                            {/* Nếu chưa có purchaseOrderID và đã duyệt thì hiển thị nút tạo đơn hàng */}
                                            {pr.status === "Đã duyệt" && pr.purchaseOrderID && (
                                                <Link href={`/dashboard/purchase-requests/edit/${pr.purchaseRequestID}`} passHref legacyBehavior>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        Xem đơn hàng
                                                    </Button>
                                                </Link>
                                            )}
                                            {/* Các nút duyệt/từ chối giữ nguyên logic cũ */}
                                            {(pr.status !== "Đã duyệt" && pr.status !== "Không duyệt") && (
                                                <>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 rounded-full bg-green-100 hover:bg-green-200 text-green-600 border-green-300 flex items-center justify-center p-0"
                                                        title="Duyệt"
                                                        onClick={e => { e.stopPropagation(); handleActionClick(pr, "approve"); }}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 border-red-300 flex items-center justify-center p-0"
                                                        title="Từ chối"
                                                        onClick={e => { e.stopPropagation(); handleActionClick(pr, "reject"); }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến {Math.min(currentPage * itemsPerPage, filteredRequests.length)} trong tổng số {filteredRequests.length} yêu cầu
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionType === "approve" ? "Duyệt yêu cầu mua hàng" : "Từ chối yêu cầu mua hàng"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionType === "approve"
                                ? "Bạn có chắc chắn muốn duyệt yêu cầu này? Sau khi duyệt trạng thái sẽ là 'Đã duyệt'."
                                : "Bạn có chắc chắn muốn từ chối yêu cầu này? Sau khi từ chối trạng thái sẽ là 'Không duyệt'."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} disabled={processing} className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                            {processing ? "Đang xử lý..." : (actionType === "approve" ? "Đồng ý" : "Không duyệt")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
