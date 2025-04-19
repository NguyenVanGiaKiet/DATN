// Hàm xuất dữ liệu sang CSV
export function exportToCSV<T>(data: T[], filename: string) {
    if (!data || !data.length) {
      console.error("No data to export")
      return
    }
  
    // Lấy tên các cột từ đối tượng đầu tiên
    const headers = Object.keys(data[0] as object)
  
    // Tạo nội dung CSV
    const csvContent = [
      // Dòng tiêu đề
      headers.join(","),
      // Dữ liệu
      ...data.map((item) =>
        headers
          .map((header) => {
            // Xử lý giá trị để tránh lỗi với dấu phẩy
            const value = (item as any)[header]
            const cellValue = value === null || value === undefined ? "" : String(value)
            // Nếu có dấu phẩy, đặt giá trị trong dấu ngoặc kép
            return cellValue.includes(",") ? `"${cellValue}"` : cellValue
          })
          .join(","),
      ),
    ].join("\n")
  
    // Tạo blob và tải xuống
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
  
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
  
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Hàm xuất dữ liệu sang Excel (giả lập bằng CSV)
  export function exportToExcel<T>(data: T[], filename: string) {
    exportToCSV(data, filename)
  }
  
  // Hàm xuất dữ liệu sang PDF (giả lập)
  export function exportToPDF<T>(data: T[], filename: string) {
    alert(`Xuất dữ liệu sang PDF: ${filename}.pdf với ${data.length} bản ghi`)
  }
  
  