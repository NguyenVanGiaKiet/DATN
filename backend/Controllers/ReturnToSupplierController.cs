using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyWebAPI.Data;
using MyWebAPI.Models;

namespace MyWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReturnToSupplierController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ReturnToSupplierController> _logger;

        public ReturnToSupplierController(AppDbContext context, ILogger<ReturnToSupplierController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Return
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReturnToSupplier>>> GetReturns()
        {
            try
            {
                var Returns = await _context.ReturnToSupplier
                    .Include(i => i.PurchaseOrder)
                    .Include(i => i.Product)
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(Returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Returns");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách Đơn trả hàng" });
            }
        }

        // GET: api/Return/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReturnToSupplier>> GetReturn(int id)
        {
            try
            {
                var Return = await _context.ReturnToSupplier
                    .Include(i => i.PurchaseOrder)
                    .Include(i => i.Product)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(i => i.ReturnID == id);

                if (Return == null)
                {
                    _logger.LogWarning("Return {Id} not found", id);
                    return NotFound(new { message = $"Không tìm thấy Đơn trả hàng với ID: {id}" });
                }

                return Ok(Return);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Return {Id}", id);
                return StatusCode(500, new { message = $"Lỗi khi lấy thông tin Đơn trả hàng: {id}" });
            }
        }

        // GET: api/Return/Order/PO-2024-0001
        [HttpGet("Order/{orderId}")]
        public async Task<ActionResult<IEnumerable<ReturnToSupplier>>> GetReturnsByOrder(string orderId)
        {
            try
            {
                var Returns = await _context.ReturnToSupplier
                    .Include(i => i.PurchaseOrder)
                    .Include(i => i.Product)
                    .AsNoTracking()
                    .Where(i => i.PurchaseOrderID == orderId)
                    .ToListAsync();

                return Ok(Returns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Returns for order {OrderId}", orderId);
                return StatusCode(500, new { message = $"Lỗi khi lấy danh sách Đơn trả hàng cho đơn hàng: {orderId}" });
            }
        }
        [HttpPost]
        public async Task<IActionResult> PostReturn(ReturnToSupplier returnToSupplier)
        {
            try
            {
                var purchaseOrder = await _context.PurchaseOrders
                    .FirstOrDefaultAsync(p => p.PurchaseOrderID == returnToSupplier.PurchaseOrderID);

                if (purchaseOrder == null)
                {
                    return BadRequest(new { message = $"Không tìm thấy đơn hàng với ID: {returnToSupplier.PurchaseOrderID}" });
                }

                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductID == returnToSupplier.ProductID);

                if (product == null)
                {
                    return BadRequest(new { message = $"Không tìm thấy sản phẩm với ID: {returnToSupplier.ProductID}" });
                }

                returnToSupplier.ReturnDate = returnToSupplier.ReturnDate == default ? DateTime.Now : returnToSupplier.ReturnDate;

                _context.ReturnToSupplier.Add(returnToSupplier);
                await _context.SaveChangesAsync();

                // Bổ sung: cập nhật lại số lượng đã nhận và đã trả trong PurchaseOrderDetail
                var poDetail = await _context.PurchaseOrderDetails
                    .FirstOrDefaultAsync(d =>
                        d.PurchaseOrderID == returnToSupplier.PurchaseOrderID &&
                        d.ProductID == returnToSupplier.ProductID
                    );

                if (poDetail != null)
                {
                    poDetail.ReceivedQuantity -= returnToSupplier.ReturnQuantity;
                    if (poDetail.ReceivedQuantity < 0) poDetail.ReceivedQuantity = 0;
                    await _context.SaveChangesAsync();
                }

                // Bổ sung: Kiểm tra lại trạng thái đơn hàng sau khi cập nhật số lượng nhận
                var allDetails = await _context.PurchaseOrderDetails
                    .Where(d => d.PurchaseOrderID == returnToSupplier.PurchaseOrderID)
                    .ToListAsync();

                bool allReceived = allDetails.All(d => d.ReceivedQuantity >= d.Quantity);
                bool anyReceived = allDetails.Any(d => d.ReceivedQuantity > 0);

                var order = await _context.PurchaseOrders
                    .FirstOrDefaultAsync(p => p.PurchaseOrderID == returnToSupplier.PurchaseOrderID);

                if (order != null)
                {
                    if (allReceived)
                        order.Status = "Đã nhận hàng";
                    else if (anyReceived)
                        order.Status = "Đang nhận hàng";
                    else
                        order.Status = "Đã xác nhận";

                    await _context.SaveChangesAsync();
                }

                var createdReturn = await _context.ReturnToSupplier
                    .Include(i => i.PurchaseOrder)
                    .Include(i => i.Product)
                    .FirstOrDefaultAsync(i => i.ReturnID == returnToSupplier.ReturnID);

                _logger.LogInformation("Created new Return with ID {Id}", returnToSupplier.ReturnID);

                return Ok(new
                {
                    message = "Tạo đơn trả hàng thành công",
                    data = createdReturn
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Return");
                return StatusCode(500, new { message = "Lỗi khi tạo Đơn trả hàng mới" });
            }
        }


        private async Task<bool> ReturnExists(int id)
        {
            return await _context.ReturnToSupplier.AnyAsync(e => e.ReturnID == id);
        }

    }
}