using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebAPI.Data;
using MyWebAPI.Models;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MyWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchaseOrderController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPurchaseOrders()
        {
            var purchaseOrders = await _context.PurchaseOrders
                .Include(po => po.PurchaseOrderDetails)
                .ThenInclude(pod => pod.Product)
                .Include(po => po.Supplier)
                .ToListAsync();

            var response = purchaseOrders.Select(po => FormatPurchaseOrderResponse(po));
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPurchaseOrder(string id)
        {
            var purchaseOrder = await _context.PurchaseOrders
                .Include(po => po.PurchaseOrderDetails)
                .ThenInclude(pod => pod.Product)
                .Include(po => po.Supplier)
                .FirstOrDefaultAsync(po => po.PurchaseOrderID == id);

            if (purchaseOrder == null)
            {
                return NotFound("Không tìm thấy đơn hàng.");
            }

            var response = FormatPurchaseOrderResponse(purchaseOrder);
            return Ok(response);
        }

        // GET: api/PurchaseOrder/Supplier/5
        [HttpGet("Supplier/{supplierId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetPurchaseOrdersBySupplier(int supplierId)
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.PurchaseOrderDetails)
                    .ThenInclude(pod => pod.Product)
                .Where(po => po.SupplierID == supplierId)
                .ToListAsync();
        }

        // POST: api/PurchaseOrder
        [HttpPost]
        public async Task<IActionResult> CreatePurchaseOrder([FromBody] JsonElement purchaseOrderData)
        {
            try
            {
                var purchaseOrder = new PurchaseOrder
                {
                    PurchaseOrderID = GenerateNewPurchaseOrderID(),
                    SupplierID = purchaseOrderData.GetProperty("supplierID").GetInt32(),
                    OrderDate = DateTime.Parse(purchaseOrderData.GetProperty("orderDate").GetString()),
                    ExpectedDeliveryDate = DateTime.Parse(purchaseOrderData.GetProperty("expectedDeliveryDate").GetString()),
                    TotalAmount = purchaseOrderData.GetProperty("totalAmount").GetDecimal(),
                    Status = "Đang xử lý",
                    ApprovedBy = "System",
                    Notes = purchaseOrderData.TryGetProperty("notes", out var notesElement) ? 
                        notesElement.GetString() : string.Empty
                };

                var details = new List<PurchaseOrderDetail>();
                var detailsArray = purchaseOrderData.GetProperty("purchaseOrderDetails").EnumerateArray();
                
                foreach (var detail in detailsArray)
                {
                    details.Add(new PurchaseOrderDetail
                    {
                        PurchaseOrderID = purchaseOrder.PurchaseOrderID,
                        ProductID = detail.GetProperty("productID").GetInt32(),
                        Quantity = detail.GetProperty("quantity").GetInt32(),
                        UnitPrice = detail.GetProperty("unitPrice").GetDecimal(),
                        TotalPrice = detail.GetProperty("totalPrice").GetDecimal(),
                        ReceivedQuantity = 0,
                        ReturnQuantity = 0
                    });
                }

                purchaseOrder.PurchaseOrderDetails = details;

                _context.PurchaseOrders.Add(purchaseOrder);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = $"Đơn hàng {purchaseOrder.PurchaseOrderID} đã được tạo thành công",
                    purchaseOrderID = purchaseOrder.PurchaseOrderID
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi tạo đơn hàng: {ex.Message}" });
            }
        }

        private object FormatPurchaseOrderResponse(PurchaseOrder purchaseOrder)
        {
            return new
            {
                purchaseOrder.PurchaseOrderID,
                purchaseOrder.SupplierID,
                purchaseOrder.OrderDate,
                purchaseOrder.ExpectedDeliveryDate,
                purchaseOrder.TotalAmount,
                purchaseOrder.Status,
                purchaseOrder.ApprovedBy,
                purchaseOrder.Notes,
                supplier = new
                {
                    supplierID = purchaseOrder.SupplierID,
                    supplierName = purchaseOrder.Supplier?.SupplierName ?? "Không xác định",
                    contactPerson = purchaseOrder.Supplier?.ContactPerson ?? "Không xác định",
                    phone = purchaseOrder.Supplier?.Phone ?? "Không xác định",
                    email = purchaseOrder.Supplier?.Email ?? "Không xác định",
                    address = purchaseOrder.Supplier?.Address ?? "Không xác định"
                },
                PurchaseOrderDetails = purchaseOrder.PurchaseOrderDetails?.Select(pod => new
                {
                    pod.PODetailID,
                    pod.ProductID,
                    pod.Quantity,
                    pod.UnitPrice,
                    pod.TotalPrice,
                    pod.ReceivedQuantity,
                    pod.ReturnQuantity,
                    product = new
                    {
                        productID = pod.ProductID,
                        productName = pod.Product?.ProductName ?? "Không xác định",
                        unit = pod.Product?.Unit ?? "Không xác định"
                    }
                })
            };
        }

        // PUT: api/PurchaseOrder/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePurchaseOrder(string id, [FromBody] JsonElement purchaseOrderData)
        {
            try
            {
                // Đảm bảo ID khớp với ID trong dữ liệu
                string poId = purchaseOrderData.TryGetProperty("purchaseOrderID", out var poIdElement) ? 
                    poIdElement.GetString() : string.Empty;
                    
                if (id != poId)
                {
                    return BadRequest("ID trong đường dẫn không khớp với ID trong dữ liệu");
                }

                // Lấy đơn hàng hiện tại từ database
                var existingOrder = await _context.PurchaseOrders
                    .Include(po => po.PurchaseOrderDetails)
                    .FirstOrDefaultAsync(po => po.PurchaseOrderID == id);

                if (existingOrder == null)
                {
                    return NotFound("Không tìm thấy đơn hàng với ID này");
                }

                // Cập nhật thông tin cơ bản của đơn hàng
                if (purchaseOrderData.TryGetProperty("supplierID", out var supplierIdElement))
                    existingOrder.SupplierID = supplierIdElement.GetInt32();
                    
                if (purchaseOrderData.TryGetProperty("orderDate", out var orderDateElement))
                    existingOrder.OrderDate = DateTime.Parse(orderDateElement.GetString());
                    
                if (purchaseOrderData.TryGetProperty("expectedDeliveryDate", out var expectedDeliveryDateElement))
                    existingOrder.ExpectedDeliveryDate = DateTime.Parse(expectedDeliveryDateElement.GetString());
                    
                if (purchaseOrderData.TryGetProperty("totalAmount", out var totalAmountElement))
                    existingOrder.TotalAmount = totalAmountElement.GetDecimal();
                    
                if (purchaseOrderData.TryGetProperty("status", out var statusElement))
                    existingOrder.Status = statusElement.GetString();
                    
                if (purchaseOrderData.TryGetProperty("approvedBy", out var approvedByElement))
                    existingOrder.ApprovedBy = approvedByElement.GetString();
                    
                if (purchaseOrderData.TryGetProperty("notes", out var notesElement))
                    existingOrder.Notes = notesElement.GetString();

                // Xóa hết chi tiết đơn hàng hiện tại
                var detailsToRemove = existingOrder.PurchaseOrderDetails.ToList();
                foreach (var detail in detailsToRemove)
                {
                    _context.PurchaseOrderDetails.Remove(detail);
                }
                
                int totalItems = 0;
                decimal totalValue = 0;
                
                // Cập nhật chi tiết đơn hàng nếu có
                if (purchaseOrderData.TryGetProperty("purchaseOrderDetails", out var detailsElement))
                {
                    foreach (var detailElement in detailsElement.EnumerateArray())
                    {
                        totalItems++;
                        
                        // Tạo chi tiết đơn hàng mới
                        var newDetail = new PurchaseOrderDetail
                        {
                            PurchaseOrderID = id,
                            ProductID = detailElement.GetProperty("productID").GetInt32(),
                            Quantity = detailElement.GetProperty("quantity").GetInt32(),
                            UnitPrice = detailElement.GetProperty("unitPrice").GetDecimal(),
                            TotalPrice = detailElement.GetProperty("totalPrice").GetDecimal(),
                            ReceivedQuantity = detailElement.TryGetProperty("receivedQuantity", out var recQtyElement) ? 
                                recQtyElement.GetInt32() : 0,
                            ReturnQuantity = detailElement.TryGetProperty("returnQuantity", out var retQtyElement) ? 
                                retQtyElement.GetInt32() : 0
                        };
                        
                        totalValue += newDetail.TotalPrice;
                        
                        _context.PurchaseOrderDetails.Add(newDetail);
                    }
                }

                // Lưu thay đổi
                await _context.SaveChangesAsync();
                
                // Trả về kết quả chi tiết
                return Ok(new { 
                    message = $"Đơn hàng {id} đã được cập nhật thành công", 
                    details = new {
                        id = id,
                        totalItems = totalItems,
                        totalValue = totalValue,
                        updatedAt = DateTime.Now
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi cập nhật đơn hàng: {ex.Message}" });
            }
        }

        // DELETE: api/PurchaseOrder/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePurchaseOrder(string id)
        {
            var purchaseOrder = await _context.PurchaseOrders.FindAsync(id);
            if (purchaseOrder == null)
            {
                return NotFound();
            }

            _context.PurchaseOrders.Remove(purchaseOrder);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PurchaseOrderExists(string id)
        {
            return _context.PurchaseOrders.Any(e => e.PurchaseOrderID == id);
        }

        private string GenerateNewPurchaseOrderID()
        {
            var currentYear = DateTime.Now.Year;
            var lastOrder = _context.PurchaseOrders
                .Where(po => po.PurchaseOrderID.StartsWith($"PO-{currentYear}"))
                .OrderByDescending(po => po.PurchaseOrderID)
                .FirstOrDefault();

            if (lastOrder == null)
            {
                return $"PO-{currentYear}-0001";
            }

            var lastNumber = int.Parse(lastOrder.PurchaseOrderID.Split('-').Last());
            return $"PO-{currentYear}-{(lastNumber + 1).ToString("D4")}";
        }
    }
}