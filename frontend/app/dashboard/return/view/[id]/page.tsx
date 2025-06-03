"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface ReturnOrder {
  returnID: number;
  purchaseOrderID: string;
  returnDate: string;
  returnReason: string;
  processedBy: string;
}

export default function ReturnOrderDetailPage() {
  const { id } = useParams();
  const [returnOrder, setReturnOrder] = useState<ReturnOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturnOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5190/api/ReturnToSupplier/${id}`);
        if (!response.ok) throw new Error("Không thể tải dữ liệu đơn trả hàng");
        const data = await response.json();
        setReturnOrder(data);
      } catch {
        setReturnOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReturnOrder();
  }, [id]);

  if (loading) return <div>Đang tải dữ liệu đơn trả hàng...</div>;
  if (!returnOrder) return <div>Không tìm thấy đơn trả hàng.</div>;

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Chi tiết đơn trả hàng</CardTitle>
        <CardDescription>Mã trả hàng: {returnOrder.returnID}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div><b>Mã đơn hàng:</b> {returnOrder.purchaseOrderID}</div>
        <div><b>Ngày trả:</b> {new Date(returnOrder.returnDate).toLocaleDateString("vi-VN")}</div>
        <div><b>Lý do trả:</b> {returnOrder.returnReason}</div>
        <div><b>Người xử lý:</b> {returnOrder.processedBy}</div>
      </CardContent>
    </Card>
  );
}
