using System;
using System.Collections.Generic;
using System.Linq;
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
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(AppDbContext context, ILogger<PaymentController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Payment
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
        {
            try
            {
                var payments = await _context.Payments
                    .Include(p => p.Invoice)
                    .AsNoTracking()
                    .ToListAsync();

                return Ok(payments.Select(p => FormatPaymentResponse(p)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payments");
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách thanh toán" });
            }
        }

        // GET: api/Payment/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Payment>> GetPayment(int id)
        {
            try
            {
                var payment = await _context.Payments
                    .Include(p => p.Invoice)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.PaymentID == id);

                if (payment == null)
                {
                    _logger.LogWarning("Payment {Id} not found", id);
                    return NotFound(new { message = $"Không tìm thấy thanh toán với ID: {id}" });
                }

                return Ok(FormatPaymentResponse(payment));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment {Id}", id);
                return StatusCode(500, new { message = $"Lỗi khi lấy thông tin thanh toán: {id}" });
            }
        }

        // GET: api/Payment/Invoice/5
        [HttpGet("Invoice/{invoiceId}")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByInvoice(int invoiceId)
        {
            try
            {
                var payments = await _context.Payments
                    .Include(p => p.Invoice)
                    .AsNoTracking()
                    .Where(p => p.InvoiceID == invoiceId)
                    .ToListAsync();

                return Ok(payments.Select(p => FormatPaymentResponse(p)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payments for invoice {InvoiceId}", invoiceId);
                return StatusCode(500, new { message = $"Lỗi khi lấy danh sách thanh toán cho hóa đơn: {invoiceId}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentDTO paymentDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
            try
            {
                _logger.LogInformation("Creating payment for invoice {InvoiceId}", paymentDto.InvoiceID);

                if (paymentDto == null)
                {
                    return BadRequest(new { message = "Dữ liệu thanh toán không hợp lệ" });
                }

                if (paymentDto.AmountPaid <= 0)
                {
                    return BadRequest(new { message = "Số tiền thanh toán phải lớn hơn 0" });
                }

                // Lock the invoice record for update
                var invoice = await _context.Invoices
                    .Include(i => i.Payments)
                    .Include(i => i.PurchaseOrder)
                    .FirstOrDefaultAsync(i => i.InvoiceID == paymentDto.InvoiceID);

                if (invoice == null)
                {
                    _logger.LogWarning("Invoice {InvoiceId} not found", paymentDto.InvoiceID);
                    return NotFound(new { message = $"Không tìm thấy hóa đơn với ID: {paymentDto.InvoiceID}" });
                }

                decimal totalPaid = invoice.Payments?.Sum(p => p.AmountPaid) ?? 0;
                decimal remainingAmount = invoice.TotalAmount - totalPaid;

                if (paymentDto.AmountPaid > remainingAmount)
                {
                    return BadRequest(new
                    {
                        message = $"Số tiền thanh toán ({paymentDto.AmountPaid:N0} VND) không được vượt quá số tiền còn lại ({remainingAmount:N0} VND)",
                        lastPayment = totalPaid > 0 ? $"Lần trước bạn đã thanh toán: {totalPaid:N0} VND" : null
                    });
                }

                decimal newTotalPaid = totalPaid + paymentDto.AmountPaid;
                invoice.PaymentStatus = newTotalPaid >= invoice.TotalAmount ? "Đã thanh toán" : "Thanh toán một phần";

                // Cập nhật trạng thái đơn hàng khi hóa đơn được thanh toán đầy đủ
                bool wasFullyPaid = invoice.PurchaseOrder.Status == "Đã thanh toán";
                if (newTotalPaid >= invoice.TotalAmount)
                {
                    invoice.PurchaseOrder.Status = "Đã thanh toán";
                    // Chỉ cộng vào kho nếu trước đó chưa "Đã thanh toán"
                    if (!wasFullyPaid)
                    {
                        // Lấy chi tiết đơn hàng
                        var poDetails = await _context.PurchaseOrderDetails
                            .Where(d => d.PurchaseOrderID == invoice.PurchaseOrder.PurchaseOrderID)
                            .ToListAsync();
                        foreach (var detail in poDetails)
                        {
                            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductID == detail.ProductID);
                            if (product != null)
                            {
                                // Cộng số lượng đã nhận vào tồn kho
                                product.StockQuantity += (int)detail.ReceivedQuantity;
                            }
                        }
                        await _context.SaveChangesAsync();
                    }
                }
                else
                {
                    invoice.PurchaseOrder.Status = "Thanh toán một phần";
                }

                var payment = new Payment
                {
                    InvoiceID = paymentDto.InvoiceID,
                    PaymentDate = paymentDto.PaymentDate,
                    AmountPaid = paymentDto.AmountPaid,
                    PaymentMethod = paymentDto.PaymentMethod,
                    ProcessedBy = paymentDto.ProcessedBy
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Created payment {PaymentId} for invoice {InvoiceId}", payment.PaymentID, payment.InvoiceID);

                return Ok(new
                {
                    message = "Thanh toán thành công",
                    payment = FormatPaymentResponse(payment),
                    invoice = new
                    {
                        invoice.InvoiceID,
                        invoice.TotalAmount,
                        PaidAmount = newTotalPaid,
                        LastPayment = totalPaid > 0 ? $"Lần trước bạn đã thanh toán: {totalPaid:N0} VND" : null,
                        RemainingAmount = invoice.TotalAmount - newTotalPaid,
                        invoice.PaymentStatus,
                        PurchaseOrderStatus = invoice.PurchaseOrder.Status
                    }
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating payment");
                return StatusCode(500, new { message = $"Lỗi khi tạo thanh toán: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePayment(int id, [FromBody] PaymentDTO paymentDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var payment = await _context.Payments
                    .Include(p => p.Invoice)
                    .ThenInclude(i => i.PurchaseOrder)
                    .FirstOrDefaultAsync(p => p.PaymentID == id);

                if (payment == null)
                {
                    return NotFound(new { message = "Không tìm thấy thanh toán" });
                }

                // Tính toán số tiền đã thanh toán (trừ đi số tiền của thanh toán hiện tại)
                var totalPaid = await _context.Payments
                    .Where(p => p.InvoiceID == payment.InvoiceID && p.PaymentID != id)
                    .SumAsync(p => p.AmountPaid);

                // Kiểm tra số tiền thanh toán mới
                decimal remainingAmount = payment.Invoice.TotalAmount - totalPaid;
                if (paymentDto.AmountPaid > remainingAmount + payment.AmountPaid)
                {
                    return BadRequest(new { 
                        message = $"Số tiền thanh toán ({paymentDto.AmountPaid:N0} VND) không được vượt quá số tiền còn lại ({(remainingAmount + payment.AmountPaid):N0} VND)",
                        lastPayment = totalPaid > 0 ? $"Lần trước bạn đã thanh toán: {totalPaid:N0} VND" : null
                    });
                }

                // Cập nhật thông tin thanh toán
                payment.PaymentDate = paymentDto.PaymentDate;
                payment.AmountPaid = paymentDto.AmountPaid;
                payment.PaymentMethod = paymentDto.PaymentMethod;
                payment.ProcessedBy = paymentDto.ProcessedBy;

                // Cập nhật trạng thái hóa đơn
                decimal newTotalPaid = totalPaid + paymentDto.AmountPaid;
                payment.Invoice.PaymentStatus = newTotalPaid >= payment.Invoice.TotalAmount ? "Đã thanh toán" : "Thanh toán một phần";

                // Cập nhật trạng thái đơn hàng
                bool wasFullyPaid = payment.Invoice.PurchaseOrder.Status == "Đã thanh toán";
                if (newTotalPaid >= payment.Invoice.TotalAmount)
                {
                    payment.Invoice.PurchaseOrder.Status = "Đã thanh toán";
                    // Chỉ cộng vào kho nếu trước đó chưa "Đã thanh toán"
                    if (!wasFullyPaid)
                    {
                        var poDetails = await _context.PurchaseOrderDetails
                            .Where(d => d.PurchaseOrderID == payment.Invoice.PurchaseOrder.PurchaseOrderID)
                            .ToListAsync();
                        foreach (var detail in poDetails)
                        {
                            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductID == detail.ProductID);
                            if (product != null)
                            {
                                product.StockQuantity += (int)detail.ReceivedQuantity;
                            }
                        }
                        await _context.SaveChangesAsync();
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Cập nhật thanh toán thành công",
                    payment = FormatPaymentResponse(payment),
                    invoice = new
                    {
                        payment.Invoice.InvoiceID,
                        payment.Invoice.TotalAmount,
                        PaidAmount = newTotalPaid,
                        LastPayment = totalPaid > 0 ? $"Lần trước bạn đã thanh toán: {totalPaid:N0} VND" : null,
                        RemainingAmount = payment.Invoice.TotalAmount - newTotalPaid,
                        payment.Invoice.PaymentStatus,
                        PurchaseOrderStatus = payment.Invoice.PurchaseOrder.Status
                    }
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error updating payment {PaymentId}", id);
                return StatusCode(500, new { message = "Lỗi khi cập nhật thanh toán" });
            }
        }

        private object FormatPaymentResponse(Payment payment)
        {
            return new
            {
                payment.PaymentID,
                payment.InvoiceID,
                payment.PaymentDate,
                payment.AmountPaid,
                payment.PaymentMethod,
                payment.ProcessedBy,
                Invoice = payment.Invoice == null ? null : new
                {
                    payment.Invoice.InvoiceID,
                    payment.Invoice.TotalAmount,
                    TotalAmountFormatted = $"{payment.Invoice.TotalAmount:N0} VND",
                    payment.Invoice.PaymentStatus
                }
            };
        }
    }
}