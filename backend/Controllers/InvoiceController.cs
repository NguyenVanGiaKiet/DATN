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
    public class InvoiceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<InvoiceController> _logger;

        public InvoiceController(AppDbContext context, ILogger<InvoiceController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Invoice
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
        {
            try 
            {
                var invoices = await _context.Invoices
                    .Include(i => i.PurchaseOrder)
                    .Include(i => i.Payments)
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(invoices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invoices");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách hóa đơn" });
            }
        }

        // GET: api/Invoice/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Invoice>> GetInvoice(int id)
        {
            try
            {
                var invoice = await _context.Invoices
                    .Include(i => i.PurchaseOrder)
                    .Include(i => i.Payments)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(i => i.InvoiceID == id);

                if (invoice == null)
                {
                    _logger.LogWarning("Invoice {Id} not found", id);
                    return NotFound(new { message = $"Không tìm thấy hóa đơn với ID: {id}" });
                }

                return Ok(invoice);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invoice {Id}", id);
                return StatusCode(500, new { message = $"Lỗi khi lấy thông tin hóa đơn: {id}" });
            }
        }

        // GET: api/Invoice/Order/PO-2024-0001
        [HttpGet("Order/{orderId}")]
        public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoicesByOrder(string orderId)
        {
            try
            {
                var invoices = await _context.Invoices
                    .Include(i => i.PurchaseOrder)
                    .Include(i => i.Payments)
                    .AsNoTracking()
                    .Where(i => i.PurchaseOrderID == orderId)
                    .ToListAsync();

                return Ok(invoices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invoices for order {OrderId}", orderId);
                return StatusCode(500, new { message = $"Lỗi khi lấy danh sách hóa đơn cho đơn hàng: {orderId}" });
            }
        }

        // POST: api/Invoice
        [HttpPost]
        public async Task<ActionResult<Invoice>> CreateInvoice([FromBody] JsonElement invoiceData)
        {
            using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            try
            {
                _logger.LogInformation("Creating invoice with data: {InvoiceData}", invoiceData.ToString());

                var purchaseOrderId = invoiceData.GetProperty("purchaseOrderID").GetString();
                var invoiceDate = DateTime.Parse(invoiceData.GetProperty("invoiceDate").GetString());
                var dueDate = DateTime.Parse(invoiceData.GetProperty("dueDate").GetString());
                var paymentStatus = invoiceData.GetProperty("paymentStatus").GetString();

                // Kiểm tra và lock đơn hàng để tránh race condition
                var purchaseOrder = await _context.PurchaseOrders
                    .Include(po => po.PurchaseOrderDetails)
                    .Include(po => po.Supplier)
                    .Include(po => po.Invoices)
                    .FirstOrDefaultAsync(po => po.PurchaseOrderID == purchaseOrderId);

                if (purchaseOrder == null)
                {
                    return BadRequest(new { message = "Không tìm thấy đơn hàng" });
                }

                if (purchaseOrder.Status != "Đã nhận hàng" && purchaseOrder.Status != "Đang nhận hàng")
                {
                    return BadRequest(new { message = "Chỉ có thể tạo hóa đơn cho đơn hàng đã nhận hàng hoặc đang nhận hàng" });
                }

                // Kiểm tra xem đã có hóa đơn chưa thanh toán cho đơn hàng này chưa
                if (purchaseOrder.Invoices.Any(i => i.PaymentStatus != "Đã thanh toán"))
                {
                    return BadRequest(new { message = "Đã tồn tại hóa đơn chưa thanh toán cho đơn hàng này" });
                }

                var invoice = new Invoice
                {
                    PurchaseOrderID = purchaseOrderId,
                    InvoiceDate = invoiceDate,
                    DueDate = dueDate,
                    TotalAmount = purchaseOrder.TotalAmount,
                    PaymentStatus = paymentStatus,
                    PurchaseOrder = purchaseOrder,
                    Payments = new List<Payment>()
                };

                _context.Invoices.Add(invoice);
                purchaseOrder.Status = "Đã xuất hóa đơn";
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Created invoice {InvoiceId} for order {OrderId}", invoice.InvoiceID, purchaseOrderId);

                return Ok(new
                {
                    message = "Tạo hóa đơn thành công",
                    invoiceId = invoice.InvoiceID
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating invoice");
                return StatusCode(500, new { message = $"Lỗi khi tạo hóa đơn: {ex.Message}" });
            }
        }

        // PUT: api/Invoice/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInvoice(int id, Invoice invoice)
        {
            if (id != invoice.InvoiceID)
            {
                return BadRequest(new { message = "ID hóa đơn không khớp" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Entry(invoice).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Cập nhật hóa đơn thành công" });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                if (!await InvoiceExists(id))
                {
                    return NotFound(new { message = $"Không tìm thấy hóa đơn với ID: {id}" });
                }
                throw;
            }
        }

        private async Task<bool> InvoiceExists(int id)
        {
            return await _context.Invoices.AnyAsync(e => e.InvoiceID == id);
        }
    }
}