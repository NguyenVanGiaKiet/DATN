using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebAPI.Data;
using MyWebAPI.Models;

namespace MyWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GoodsReceivedController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GoodsReceivedController(AppDbContext context)
        {
            _context = context;
        }

        private object FormatGoodsReceivedResponse(GoodsReceived goodsReceived)
        {
            return new
            {
                goodsReceived.GoodsReceivedID,
                goodsReceived.PurchaseOrderID,
                goodsReceived.ReceivedDate,
                goodsReceived.Receiver,
                goodsReceived.Status,
                goodsReceived.Remarks,
                PurchaseOrder = goodsReceived.PurchaseOrder == null ? null : new
                {
                    goodsReceived.PurchaseOrder.PurchaseOrderID,
                    goodsReceived.PurchaseOrder.SupplierID,
                    goodsReceived.PurchaseOrder.OrderDate,
                    goodsReceived.PurchaseOrder.ExpectedDeliveryDate,
                    goodsReceived.PurchaseOrder.TotalAmount,
                    goodsReceived.PurchaseOrder.Status,
                    goodsReceived.PurchaseOrder.ApprovedBy,
                    goodsReceived.PurchaseOrder.Notes,
                    Supplier = goodsReceived.PurchaseOrder.Supplier == null ? null : new
                    {
                        goodsReceived.PurchaseOrder.Supplier.SupplierID,
                        goodsReceived.PurchaseOrder.Supplier.SupplierName,
                        goodsReceived.PurchaseOrder.Supplier.ContactPerson,
                        goodsReceived.PurchaseOrder.Supplier.Phone,
                        goodsReceived.PurchaseOrder.Supplier.Email,
                        goodsReceived.PurchaseOrder.Supplier.Address
                    },
                    PurchaseOrderDetails = goodsReceived.PurchaseOrder.PurchaseOrderDetails?.Select(pod => new
                    {
                        pod.PODetailID,
                        pod.ProductID,
                        pod.Quantity,
                        pod.UnitPrice,
                        pod.TotalPrice,
                        pod.ReceivedQuantity,
                        pod.ReturnQuantity,
                        Product = pod.Product == null ? null : new
                        {
                            pod.Product.ProductID,
                            pod.Product.ProductName,
                            pod.Product.Unit,
                            pod.Product.StockQuantity
                        }
                    })
                }
            };
        }

        // GET: api/GoodsReceived
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetGoodsReceived()
        {
            var goodsReceived = await _context.GoodsReceived
                .Include(g => g.PurchaseOrder)
                    .ThenInclude(p => p.PurchaseOrderDetails)
                        .ThenInclude(pod => pod.Product)
                .Include(g => g.PurchaseOrder)
                    .ThenInclude(p => p.Supplier)
                .ToListAsync();

            return Ok(goodsReceived.Select(g => FormatGoodsReceivedResponse(g)));
        }

        // GET: api/GoodsReceived/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetGoodsReceived(int id)
        {
            var goodsReceived = await _context.GoodsReceived
                .Include(g => g.PurchaseOrder)
                    .ThenInclude(p => p.PurchaseOrderDetails)
                        .ThenInclude(pod => pod.Product)
                .Include(g => g.PurchaseOrder)
                    .ThenInclude(p => p.Supplier)
                .FirstOrDefaultAsync(g => g.GoodsReceivedID == id);

            if (goodsReceived == null)
            {
                return NotFound();
            }

            return FormatGoodsReceivedResponse(goodsReceived);
        }

        // GET: api/GoodsReceived/Order/PO-2024-0001
        [HttpGet("Order/{orderId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetGoodsReceivedByOrder(string orderId)
        {
            var goodsReceived = await _context.GoodsReceived
                .Include(g => g.PurchaseOrder)
                    .ThenInclude(p => p.PurchaseOrderDetails)
                        .ThenInclude(pod => pod.Product)
                .Include(g => g.PurchaseOrder)
                    .ThenInclude(p => p.Supplier)
                .Where(g => g.PurchaseOrderID == orderId)
                .ToListAsync();

            return Ok(goodsReceived.Select(g => FormatGoodsReceivedResponse(g)));
        }

        // POST: api/GoodsReceived
        [HttpPost]
        public async Task<ActionResult<GoodsReceived>> CreateGoodsReceived([FromBody] JsonElement goodsReceivedData)
        {
            try
            {
                // Validate input data
                if (!goodsReceivedData.TryGetProperty("purchaseOrderID", out var poIdElement) ||
                    !goodsReceivedData.TryGetProperty("receivedDate", out var dateElement) ||
                    !goodsReceivedData.TryGetProperty("receiver", out var receiverElement) ||
                    !goodsReceivedData.TryGetProperty("status", out var statusElement) ||
                    !goodsReceivedData.TryGetProperty("receivedQuantities", out var quantitiesElement))
                {
                    return BadRequest(new { message = "Thiếu thông tin bắt buộc" });
                }

                var purchaseOrderId = poIdElement.GetString();
                var receivedDate = dateElement.GetString();
                var receiver = receiverElement.GetString();
                var status = statusElement.GetString();

                if (string.IsNullOrEmpty(purchaseOrderId) || 
                    string.IsNullOrEmpty(receivedDate) ||
                    string.IsNullOrEmpty(receiver) ||
                    string.IsNullOrEmpty(status))
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                // Kiểm tra đơn hàng tồn tại
                var purchaseOrder = await _context.PurchaseOrders
                    .Include(po => po.PurchaseOrderDetails)
                        .ThenInclude(pod => pod.Product)
                    .FirstOrDefaultAsync(po => po.PurchaseOrderID == purchaseOrderId);

                if (purchaseOrder == null)
                {
                    return NotFound(new { message = "Không tìm thấy đơn hàng" });
                }

                // Tạo phiếu nhận hàng mới
                var goodsReceived = new GoodsReceived
                {
                    PurchaseOrderID = purchaseOrderId,
                    ReceivedDate = DateTime.Parse(receivedDate),
                    Receiver = receiver,
                    Status = status,
                    Remarks = goodsReceivedData.TryGetProperty("remarks", out var remarksElement) ? 
                        remarksElement.GetString() ?? string.Empty : string.Empty
                };

                // Cập nhật số lượng nhận cho từng sản phẩm
                foreach (var detail in purchaseOrder.PurchaseOrderDetails)
                {
                    if (quantitiesElement.TryGetProperty(detail.PODetailID.ToString(), out var quantityElement))
                    {
                        int receivedQty = quantityElement.GetInt32();
                        if (receivedQty < 0 || receivedQty > detail.Quantity - detail.ReceivedQuantity)
                        {
                            return BadRequest(new { 
                                message = $"Số lượng nhận không hợp lệ cho sản phẩm {detail.Product.ProductName}. Số lượng còn lại có thể nhận: {detail.Quantity - detail.ReceivedQuantity}"
                            });
                        }

                        detail.ReceivedQuantity += receivedQty;

                        // Cập nhật số lượng tồn kho của sản phẩm
                        var product = await _context.Products.FindAsync(detail.ProductID);
                        if (product != null)
                        {
                            product.StockQuantity += receivedQty;
                        }
                    }
                }

                // Cập nhật trạng thái đơn hàng
                bool isFullyReceived = purchaseOrder.PurchaseOrderDetails
                    .All(pod => pod.ReceivedQuantity >= pod.Quantity);
                purchaseOrder.Status = isFullyReceived ? "Đã nhận hàng" : "Đang nhận hàng";

                _context.GoodsReceived.Add(goodsReceived);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetGoodsReceived), 
                    new { id = goodsReceived.GoodsReceivedID }, 
                    FormatGoodsReceivedResponse(goodsReceived));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Lỗi khi tạo phiếu nhận hàng: {ex.Message}" });
            }
        }

        // PUT: api/GoodsReceived/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoodsReceived(int id, GoodsReceived goodsReceived)
        {
            if (id != goodsReceived.GoodsReceivedID)
            {
                return BadRequest();
            }

            _context.Entry(goodsReceived).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GoodsReceivedExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/GoodsReceived/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoodsReceived(int id)
        {
            var goodsReceived = await _context.GoodsReceived.FindAsync(id);
            if (goodsReceived == null)
            {
                return NotFound();
            }

            _context.GoodsReceived.Remove(goodsReceived);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GoodsReceivedExists(int id)
        {
            return _context.GoodsReceived.Any(e => e.GoodsReceivedID == id);
        }
    }
}