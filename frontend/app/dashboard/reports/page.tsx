"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Printer } from "lucide-react"
import toast from "react-hot-toast"

interface Report {
  reportID: string
  reportType: string
  startDate: string
  endDate: string
  generatedDate: string
  status: string
  downloadUrl: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/report")
      if (!response.ok) {
        throw new Error("Không thể tải danh sách báo cáo")
      }
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error("Lỗi khi tải danh sách báo cáo:", error)
      toast.error("Không thể tải danh sách báo cáo. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/report/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType,
          startDate,
          endDate,
        }),
      })

      if (!response.ok) {
        throw new Error("Không thể tạo báo cáo")
      }

      toast.success("Báo cáo đã được tạo thành công")
      fetchReports()
    } catch (error) {
      console.error("Lỗi khi tạo báo cáo:", error)
      toast.error("Không thể tạo báo cáo. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async (reportId: string) => {
    try {
      const response = await fetch(`http://localhost:5190/api/report/${reportId}/download`)
      if (!response.ok) {
        throw new Error("Không thể tải báo cáo")
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report_${reportId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error)
      toast.error("Không thể tải báo cáo. Vui lòng thử lại sau.")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Báo cáo</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tạo báo cáo mới</CardTitle>
          <CardDescription>Chọn loại báo cáo và khoảng thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reportType">Loại báo cáo</Label>
              <Select onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Báo cáo doanh thu</SelectItem>
                  <SelectItem value="inventory">Báo cáo tồn kho</SelectItem>
                  <SelectItem value="purchase">Báo cáo mua hàng</SelectItem>
                  <SelectItem value="payment">Báo cáo thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleGenerateReport} disabled={loading || !reportType || !startDate || !endDate}>
              {loading ? "Đang tạo..." : "Tạo báo cáo"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách báo cáo</CardTitle>
          <CardDescription>Xem và tải xuống các báo cáo đã tạo</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã báo cáo</TableHead>
                <TableHead>Loại báo cáo</TableHead>
                <TableHead>Từ ngày</TableHead>
                <TableHead>Đến ngày</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.reportID}>
                  <TableCell>{report.reportID}</TableCell>
                  <TableCell>
                    {report.reportType === "sales" && "Báo cáo doanh thu"}
                    {report.reportType === "inventory" && "Báo cáo tồn kho"}
                    {report.reportType === "purchase" && "Báo cáo mua hàng"}
                    {report.reportType === "payment" && "Báo cáo thanh toán"}
                  </TableCell>
                  <TableCell>{formatDate(report.startDate)}</TableCell>
                  <TableCell>{formatDate(report.endDate)}</TableCell>
                  <TableCell>{formatDate(report.generatedDate)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.status === "Hoàn thành" ? "bg-green-100 text-green-800" :
                      report.status === "Đang xử lý" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {report.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadReport(report.reportID)}
                        disabled={report.status !== "Hoàn thành"}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.print()}
                        disabled={report.status !== "Hoàn thành"}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

