"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface Invoice {
  invoiceID: number;
  purchaseOrderID: string;
  invoiceDate: string;
  totalAmount: number;
  paymentStatus: string;
  dueDate: string;
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`http://localhost:5190/api/Invoice/${id}`);
        if (!response.ok) throw new Error("Không thể tải dữ liệu hóa đơn");
        const data = await response.json();
        setInvoice(data);
      } catch {
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <div>Đang tải dữ liệu hóa đơn...</div>;
  if (!invoice) return <div>Không tìm thấy hóa đơn.</div>;

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Chi tiết hóa đơn</CardTitle>
        <CardDescription>Mã hóa đơn: {invoice.invoiceID}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div><b>Mã đơn hàng:</b> {invoice.purchaseOrderID}</div>
        <div><b>Ngày hóa đơn:</b> {new Date(invoice.invoiceDate).toLocaleDateString("vi-VN")}</div>
        <div><b>Tổng tiền:</b> {invoice.totalAmount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
        <div><b>Trạng thái thanh toán:</b> {invoice.paymentStatus}</div>
        <div><b>Hạn thanh toán:</b> {new Date(invoice.dueDate).toLocaleDateString("vi-VN")}</div>
      </CardContent>
    </Card>
  );
}
