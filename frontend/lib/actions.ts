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
        purchaseOrderDetails?: { productID: number; unitPrice: number; receivedQuantity?: number; returnQuantity?: number }[];
    }

    interface SupplierPerformance {
        onTime: number;
        quality: number;
        price: number;
        count: number;
    }

    // Tính toán điểm cạnh tranh về giá
    // 1. Gom tất cả chi tiết đơn hàng lại
    const allDetails: { supplier: string; productId: number; price: number }[] = [];
    for (const order of orders) {
        const supplier = order.supplier?.supplierName || "Không rõ";
        for (const detail of order.purchaseOrderDetails || []) {
            if (detail.productID && typeof detail.unitPrice === 'number') {
                allDetails.push({ supplier, productId: detail.productID, price: detail.unitPrice });
            }
        }
    }
    // 2. Tìm giá thấp nhất cho từng sản phẩm
    const minPriceByProduct: Record<number, number> = {};
    for (const detail of allDetails) {
        if (minPriceByProduct[detail.productId] === undefined || detail.price < minPriceByProduct[detail.productId]) {
            minPriceByProduct[detail.productId] = detail.price;
        }
    }
    // 3. Đếm số lần mỗi nhà cung cấp bán giá thấp nhất
    const supplierPriceStats: Record<string, { bestPriceCount: number, total: number }> = {};
    for (const detail of allDetails) {
        if (!supplierPriceStats[detail.supplier]) supplierPriceStats[detail.supplier] = { bestPriceCount: 0, total: 0 };
        supplierPriceStats[detail.supplier].total += 1;
        if (detail.price === minPriceByProduct[detail.productId]) {
            supplierPriceStats[detail.supplier].bestPriceCount += 1;
        }
    }

    // 4. Gom nhóm các chỉ số đánh giá khác
    const grouped = orders.reduce((acc: Record<string, SupplierPerformance>, order: Order) => {
        const name = order.supplier?.supplierName || "Không rõ";
        if (!acc[name]) acc[name] = { onTime: 0, quality: 0, price: 0, count: 0 };

        const expected = new Date(order.expectedDeliveryDate);
        const actual = new Date(order.orderDate);
        const deliveredOnTime = actual <= expected;

        const detail = order.purchaseOrderDetails?.[0] || { receivedQuantity: 0, returnQuantity: 0 };
        const goodQuality = (detail.receivedQuantity || 0) > 0 && (detail.returnQuantity || 0) === 0;

        acc[name].onTime += deliveredOnTime ? 1 : 0;
        acc[name].quality += goodQuality ? 1 : 0;
        acc[name].count += 1;
        return acc;
    }, {} as Record<string, SupplierPerformance>);

    // 5. Trả về dữ liệu tổng hợp, tính điểm price
    return (Object.entries(grouped) as [string, SupplierPerformance][]).map(([name, data]) => {
        const priceStat = supplierPriceStats[name];
        const priceScore = priceStat && priceStat.total > 0 ? Math.round((priceStat.bestPriceCount / priceStat.total) * 100) : 0;
        return {
            name,
            onTime: Math.round((data.onTime / data.count) * 100),
            quality: Math.round((data.quality / data.count) * 100),
            price: priceScore,
        }
    })
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

