"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface Payment {
  paymentID: number;
  invoiceID: number;
  paymentDate: string;
  amountPaid: number;
  processedBy: string;
  paymentMethod: string;
}

export default function PaymentDetailPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await fetch(`http://localhost:5190/api/payment/${id}`);
        if (!response.ok) throw new Error("Không thể tải dữ liệu thanh toán");
        const data = await response.json();
        setPayment(data);
      } catch {
        setPayment(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

  if (loading) return <div>Đang tải dữ liệu thanh toán...</div>;
  if (!payment) return <div>Không tìm thấy thanh toán.</div>;

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Chi tiết thanh toán</CardTitle>
        <CardDescription>Mã thanh toán: {payment.paymentID}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div><b>Mã hóa đơn:</b> {payment.invoiceID}</div>
        <div><b>Ngày thanh toán:</b> {new Date(payment.paymentDate).toLocaleDateString("vi-VN")}</div>
        <div><b>Số tiền:</b> {payment.amountPaid.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
        <div><b>Người xử lý:</b> {payment.processedBy}</div>
        <div><b>Phương thức thanh toán:</b> {payment.paymentMethod}</div>
      </CardContent>
    </Card>
  );
}
