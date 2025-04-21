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
using MyWebAPI.Services;

namespace MyWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public PurchaseOrderController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
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
        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<RecentOrderDTO>>> GetRecentOrders()
        {
            var recentOrders = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .OrderByDescending(po => po.OrderDate)
                .Take(5)
                .Select(po => new RecentOrderDTO
                {
                    PurchaseOrderID = po.PurchaseOrderID,
                    OrderDate = po.OrderDate,
                    ExpectedDeliveryDate = po.ExpectedDeliveryDate,
                    TotalAmount = po.TotalAmount,
                    Status = po.Status,
                    ApprovedBy = po.ApprovedBy,
                    SupplierName = po.Supplier.SupplierName,
                    ImageUrl = po.Supplier.ImageUrl
                })
                .ToListAsync();

            return recentOrders;
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

                return Ok(new
                {
                    message = $"Đơn hàng {purchaseOrder.PurchaseOrderID} đã được tạo thành công",
                    purchaseOrderID = purchaseOrder.PurchaseOrderID
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi tạo đơn hàng: {ex.Message}" });
            }
        }

        // POST: api/PurchaseOrder/{id}/send-email
        [HttpPost("{id}/send-email")]
        public async Task<IActionResult> SendEmail(string id)
        {
            try
            {
                var purchaseOrder = await _context.PurchaseOrders
                    .Include(po => po.PurchaseOrderDetails)
                        .ThenInclude(pod => pod.Product)
                        .Include(po => po.Supplier)
                    .FirstOrDefaultAsync(po => po.PurchaseOrderID == id);

                if (purchaseOrder == null)
                {
                    return NotFound("Không tìm thấy đơn hàng");
                }

                await _emailService.SendPurchaseOrderEmail(purchaseOrder);

                purchaseOrder.Status = "Đã gửi email";
                await _context.SaveChangesAsync();

                return Ok(new { message = "Email đã được gửi thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi gửi email: {ex.Message}" });
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
                string poId = purchaseOrderData.TryGetProperty("purchaseOrderID", out var poIdElement) ?
                    poIdElement.GetString() : string.Empty;

                if (id != poId)
                {
                    return BadRequest("ID trong đường dẫn không khớp với ID trong dữ liệu");
                }

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

                if (purchaseOrderData.TryGetProperty("notes", out var notesElement))
                    existingOrder.Notes = notesElement.GetString();

                if (purchaseOrderData.TryGetProperty("totalAmount", out var totalAmountElement))
                    existingOrder.TotalAmount = totalAmountElement.GetDecimal();

                if (purchaseOrderData.TryGetProperty("status", out var statusElement))
                    existingOrder.Status = statusElement.GetString();

                if (purchaseOrderData.TryGetProperty("approvedBy", out var approvedByElement))
                    existingOrder.ApprovedBy = approvedByElement.GetString();
                var detailsToRemove = existingOrder.PurchaseOrderDetails.ToList();
                foreach (var detail in detailsToRemove)
                {
                    _context.PurchaseOrderDetails.Remove(detail);
                }

                decimal totalValue = 0;
                bool allItemsReceived = true;
                bool hasUnreceivedItems = false;
                bool hasInvalidQuantity = false;
                string invalidProductName = "";

                if (purchaseOrderData.TryGetProperty("purchaseOrderDetails", out var detailsElement))
                {
                    foreach (var detailElement in detailsElement.EnumerateArray())
                    {
                        var newDetail = new PurchaseOrderDetail
                        {
                            PurchaseOrderID = id,
                            ProductID = detailElement.GetProperty("productID").GetInt32(),
                            Quantity = detailElement.GetProperty("quantity").GetInt32(),
                            UnitPrice = detailElement.GetProperty("unitPrice").GetDecimal(),
                            TotalPrice = detailElement.GetProperty("totalPrice").GetDecimal(),
                            ReceivedQuantity = detailElement.GetProperty("receivedQuantity").GetInt32(),
                            ReturnQuantity = detailElement.GetProperty("returnQuantity").GetInt32()
                        };

                        // Kiểm tra số lượng đặt có nhỏ hơn số lượng đã nhận không
                        if (newDetail.Quantity < newDetail.ReceivedQuantity)
                        {
                            var product = await _context.Products.FindAsync(newDetail.ProductID);
                            hasInvalidQuantity = true;
                            invalidProductName = product?.ProductName ?? "Không xác định";
                            break;
                        }

                        // Kiểm tra trạng thái nhận hàng
                        if (newDetail.Quantity > newDetail.ReceivedQuantity)
                        {
                            allItemsReceived = false;
                            hasUnreceivedItems = true;
                        }
                        else if (newDetail.Quantity == newDetail.ReceivedQuantity)
                        {
                            hasUnreceivedItems = false;
                        }

                        totalValue += newDetail.TotalPrice;
                        _context.PurchaseOrderDetails.Add(newDetail);
                    }
                }


                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Đơn hàng {id} đã được cập nhật thành công",
                    details = new
                    {
                        id = id,
                        totalValue = totalValue,
                        status = existingOrder.Status,
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

        [HttpPut("{id}/receive-products")]
        public async Task<IActionResult> ReceiveProducts(string id, [FromBody] JsonElement receiveData)
        {
            try
            {
                var purchaseOrder = await _context.PurchaseOrders
                    .Include(po => po.PurchaseOrderDetails)
                        .ThenInclude(pod => pod.Product)
                    .FirstOrDefaultAsync(po => po.PurchaseOrderID == id);

                if (purchaseOrder == null)
                {
                    return NotFound("Không tìm thấy đơn hàng");
                }

                // Cập nhật số lượng nhận cho từng sản phẩm
                var receivedQuantities = receiveData.GetProperty("receivedQuantities");
                foreach (var detail in purchaseOrder.PurchaseOrderDetails)
                {
                    if (receivedQuantities.TryGetProperty(detail.PODetailID.ToString(), out var quantityElement))
                    {
                        int receivedQty = quantityElement.GetInt32();
                        if (receivedQty < 0 || receivedQty > detail.Quantity)
                        {
                            return BadRequest($"Số lượng nhận không hợp lệ cho sản phẩm {detail.Product.ProductName}");
                        }
                        detail.ReceivedQuantity = receivedQty;

                        // Cập nhật tồn kho sản phẩm
                        var product = await _context.Products.FindAsync(detail.ProductID);
                        if (product != null)
                        {
                            product.StockQuantity += receivedQty;
                        }
                    }
                }

                // Cập nhật trạng thái đơn hàng
                purchaseOrder.Status = "Đã nhận hàng";

                await _context.SaveChangesAsync();

                return Ok(new { message = "Đã cập nhật số lượng nhận và tồn kho thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi cập nhật: {ex.Message}" });
            }
        }
    }
}