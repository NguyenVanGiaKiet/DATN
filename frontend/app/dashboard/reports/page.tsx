"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { Label } from "@/components/ui/label"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, FileDown, Printer } from "lucide-react"
import { getMonthlySpendingData, getSupplierPerformanceData, getProductCategoryData } from "@/lib/actions"
import { exportToCSV, exportToPDF } from "@/lib/export-utils"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function ReportsPage() {
  const [reportType, setReportType] = useState("spending")
  const [fromDate, setFromDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 6)))
  const [toDate, setToDate] = useState<Date>(new Date())
  const [monthlySpendingData, setMonthlySpendingData] = useState<any[]>([])
  const [supplierPerformanceData, setSupplierPerformanceData] = useState<any[]>([])
  const [productCategoryData, setProductCategoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Trong thực tế, các hàm này sẽ nhận tham số fromDate và toDate
        const spendingData = await getMonthlySpendingData()
        const performanceData = await getSupplierPerformanceData()
        const categoryData = await getProductCategoryData()

        setMonthlySpendingData(spendingData)
        setSupplierPerformanceData(performanceData)
        setProductCategoryData(categoryData)
      } catch (error) {
        console.error("Error fetching report data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fromDate, toDate])

  const handleExportCSV = () => {
    let data: any[] = []
    let filename = ""

    switch (reportType) {
      case "spending":
        data = monthlySpendingData
        filename = "bao-cao-chi-tieu"
        break
      case "suppliers":
        data = supplierPerformanceData
        filename = "bao-cao-nha-cung-cap"
        break
      case "categories":
        data = productCategoryData
        filename = "bao-cao-danh-muc"
        break
    }

    exportToCSV(data, filename)
  }

  const handleExportPDF = () => {
    let data: any[] = []
    let filename = ""

    switch (reportType) {
      case "spending":
        data = monthlySpendingData
        filename = "bao-cao-chi-tieu"
        break
      case "suppliers":
        data = supplierPerformanceData
        filename = "bao-cao-nha-cung-cap"
        break
      case "categories":
        data = productCategoryData
        filename = "bao-cao-danh-muc"
        break
    }

    exportToPDF(data, filename)
  }

  const handlePrint = () => {
    window.print()
  }

  function formatCurrencyShort(value: number): string {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}T`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return `${value}`;
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Báo cáo & Phân tích</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="mr-2 h-4 w-4" />
            Xuất CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            In báo cáo
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Bộ lọc báo cáo</CardTitle>
            <CardDescription>Chọn tham số để tạo báo cáo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="report-type">Loại báo cáo</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Chọn loại báo cáo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spending">Phân tích chi tiêu</SelectItem>
                    <SelectItem value="suppliers">Hiệu suất nhà cung cấp</SelectItem>
                    <SelectItem value="categories">Danh mục sản phẩm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-from">Từ ngày</Label>
                <DatePicker date={fromDate} onSelect={setFromDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">Đến ngày</Label>
                <DatePicker date={toDate} onSelect={setToDate} />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="md:col-span-3">
            <CardContent className="flex justify-center items-center h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : (
          <>
            {reportType === "spending" && (
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Phân tích chi tiêu theo tháng</CardTitle>
                  <CardDescription>Tổng quan về chi tiêu mua hàng theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlySpendingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatCurrencyShort} />
                        <Tooltip formatter={(value) => [formatCurrencyShort(Number(value)), "Chi tiêu"]} />
                        <Legend />
                        <Bar dataKey="amount" fill="#0088FE" name="Chi tiêu (VND)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {reportType === "suppliers" && (
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Phân tích hiệu suất nhà cung cấp</CardTitle>
                  <CardDescription>So sánh các chỉ số hiệu suất chính của nhà cung cấp</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={supplierPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="onTime" stroke="#0088FE" name="Giao hàng đúng hẹn %" />
                        <Line type="monotone" dataKey="quality" stroke="#00C49F" name="Chất lượng %" />
                        <Line type="monotone" dataKey="price" stroke="#FFBB28" name="Cạnh tranh về giá %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {reportType === "categories" && (
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Phân bố danh mục sản phẩm</CardTitle>
                  <CardDescription>Phân tích mua hàng theo danh mục sản phẩm</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {productCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Phần trăm"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

