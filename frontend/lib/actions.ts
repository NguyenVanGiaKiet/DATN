export async function getMonthlySpendingData() {
    const res = await fetch("http://localhost:5190/api/payment");
    const payments = await res.json();
  
    interface Payment {
      paymentDate: string;
      amountPaid: number;
    }
  
    const grouped = payments.reduce((acc: Record<string, number>, payment: Payment) => {
      const date = new Date(payment.paymentDate);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      acc[key] = (acc[key] || 0) + payment.amountPaid;
      return acc;
    }, {});
  
    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => {
        const [monthA, yearA] = a.name.split('/').map(Number);
        const [monthB, yearB] = b.name.split('/').map(Number);
        return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
      });
  }
  

export async function getSupplierPerformanceData() {
    const res = await fetch("http://localhost:5190/api/purchaseorder")
    const orders = await res.json()

    interface Order {
        supplier?: { supplierName?: string };
        expectedDeliveryDate: string;
        orderDate: string;
        purchaseOrderDetails?: { receivedQuantity?: number; returnQuantity?: number }[];
    }

    interface SupplierPerformance {
        onTime: number;
        quality: number;
        price: number;
        count: number;
    }

    const grouped = orders.reduce((acc: Record<string, SupplierPerformance>, order: Order) => {
        const name = order.supplier?.supplierName || "Không rõ";
        if (!acc[name]) acc[name] = { onTime: 0, quality: 0, price: 100, count: 0 };

        const expected = new Date(order.expectedDeliveryDate);
        const actual = new Date(order.orderDate);
        const deliveredOnTime = actual <= expected;

        const detail = order.purchaseOrderDetails?.[0] || {};
        const goodQuality = (detail.receivedQuantity || 0) > 0 && (detail.returnQuantity || 0) === 0;

        acc[name].onTime += deliveredOnTime ? 1 : 0;
        acc[name].quality += goodQuality ? 1 : 0;
        acc[name].count += 1;
        return acc;
    }, {} as Record<string, SupplierPerformance>);

    return (Object.entries(grouped) as [string, SupplierPerformance][]).map(([name, data]) => ({
        name,
        onTime: Math.round((data.onTime / data.count) * 100),
        quality: Math.round((data.quality / data.count) * 100),
        price: data.price,
    }))
}

export async function getProductCategoryData() {
    const res = await fetch("http://localhost:5190/api/product")
    const products = await res.json()

    interface Product {
        category?: { categoryName?: string };
    }

    const grouped = products.reduce((acc: Record<string, number>, product: Product) => {
        const category = product.category?.categoryName || "Không rõ";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
}

