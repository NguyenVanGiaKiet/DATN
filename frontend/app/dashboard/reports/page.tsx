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

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

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
        // Lấy dữ liệu gốc
        const spendingDataRaw = await getMonthlySpendingData()
        const performanceDataRaw = await getSupplierPerformanceData()
        const categoryDataRaw = await getProductCategoryData()

        // Lọc dữ liệu theo ngày ở frontend
        const filteredSpending = spendingDataRaw.filter((item: any) => {
          // item.name dạng MM/YYYY
          const [month, year] = item.name.split('/').map(Number)
          const date = new Date(year, month - 1)
          return date >= fromDate && date <= toDate
        })
        const filteredPerformance = performanceDataRaw.filter((item: any) => {
          // Không có thông tin ngày, nên không lọc được, giữ nguyên
          return true
        })
        const filteredCategory = categoryDataRaw // Không có ngày, giữ nguyên

        setMonthlySpendingData(filteredSpending)
        setSupplierPerformanceData(filteredPerformance)
        setProductCategoryData(filteredCategory)
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

    // Thực tế xuất PDF bằng jsPDF
    if (data.length === 0) {
      alert("Không có dữ liệu để xuất PDF!")
      return
    }
    import('jspdf').then(jsPDFModule => {
      const doc = new jsPDFModule.jsPDF({ orientation: 'landscape' })
      const pageWidth = doc.internal.pageSize.getWidth()
      let y = 20
      // Tiêu đề căn giữa
      doc.setFontSize(18)
      doc.text(filename.toUpperCase(), pageWidth / 2, y, { align: 'center' })
      y += 10
      doc.setFontSize(12)
      const headers = Object.keys(data[0])
      // Tạo bảng header
      const colWidths = headers.map(() => pageWidth / headers.length - 2)
      let x = 10
      y += 10
      // Header row
      headers.forEach((header, idx) => {
        doc.text(header, x, y, { maxWidth: colWidths[idx] })
        x += colWidths[idx]
      })
      y += 8
      // Data rows
      data.forEach(row => {
        x = 10
        headers.forEach((header, idx) => {
          let cell = row[header] !== undefined && row[header] !== null ? String(row[header]) : ''
          // Nếu dài quá thì cắt hoặc xuống dòng
          if (cell.length > 30) cell = cell.slice(0, 27) + '...'
          doc.text(cell, x, y, { maxWidth: colWidths[idx] })
          x += colWidths[idx]
        })
        y += 8
        // Nếu gần cuối trang thì sang trang mới
        if (y > doc.internal.pageSize.getHeight() - 15) {
          doc.addPage()
          y = 20
        }
      })
      doc.save(`${filename}.pdf`)
    }).catch(() => {
      alert('Chưa cài jsPDF, hãy chạy: npm install jspdf')
    })
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
            <CardTitle className="text-xl text-primary">Bộ lọc báo cáo</CardTitle>
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
                  <CardTitle className="text-xl text-primary">Phân tích chi tiêu theo tháng</CardTitle>
                  <CardDescription>Tổng quan về chi tiêu mua hàng theo thời gian</CardDescription>
                </CardHeader>
                <CardContent>
                  {monthlySpendingData.length === 0 ? (
                    <div className="flex items-center justify-center h-[400px] text-gray-400">Không có dữ liệu</div>
                  ) : (
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlySpendingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={formatCurrencyShort} />
                          <Tooltip formatter={(value) => [formatCurrencyShort(Number(value)), "Chi tiêu"]} />
                          <Legend />
                          <Bar dataKey="amount" fill="hsl(var(--chart-1))" name="Chi tiêu (VND)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {reportType === "suppliers" && (
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Phân tích hiệu suất nhà cung cấp</CardTitle>
                  <CardDescription>So sánh các chỉ số hiệu suất chính của nhà cung cấp</CardDescription>
                </CardHeader>
                <CardContent>
                  {supplierPerformanceData.length === 0 ? (
                    <div className="flex items-center justify-center h-[400px] text-gray-400">Không có dữ liệu</div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            )}

            {reportType === "categories" && (
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Phân bố danh mục sản phẩm</CardTitle>
                  <CardDescription>Phân tích mua hàng theo danh mục sản phẩm</CardDescription>
                </CardHeader>
                <CardContent>
                  {productCategoryData.length === 0 ? (
                    <div className="flex items-center justify-center h-[400px] text-gray-400">Không có dữ liệu</div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

