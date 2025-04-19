using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebAPI.Data;
using MyWebAPI.Models;

namespace MyWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SupplierController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Supplier
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Supplier>>> GetSuppliers()
        {
            return await _context.Suppliers.ToListAsync();
        }

        // GET: api/Supplier/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSupplier(int id)
        {
            var supplier = await _context.Suppliers
                .Where(s => s.SupplierID == id)
                .Select(s => new
                {
                    s.SupplierID,
                    s.SupplierName,
                    s.ContactPerson,
                    s.Phone,
                    s.Email,
                    s.Address,
                    s.Rating,
                    s.PaymentTerms,
                    s.DeliveryTime,
                    s.Status,
                    s.ImageUrl,
                })
                .FirstOrDefaultAsync();

            if (supplier == null)
            {
                return NotFound(new { message = "Không tìm thấy nhà cung cấp" });
            }

            return Ok(supplier);
        }

        // POST: api/Supplier
        [HttpPost]
        public async Task<IActionResult> CreateSupplier([FromBody] SupplierUpdateDTO supplierDTO)
        {
            try
            {
                if (supplierDTO == null)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ." });
                }

                var supplier = new Supplier
                {
                    SupplierName = supplierDTO.SupplierName,
                    ContactPerson = supplierDTO.ContactPerson,
                    Phone = supplierDTO.Phone,
                    Email = supplierDTO.Email,
                    Address = supplierDTO.Address,
                    Rating = supplierDTO.Rating,
                    PaymentTerms = supplierDTO.PaymentTerms,
                    DeliveryTime = supplierDTO.DeliveryTime,
                    Status = supplierDTO.Status,
                    ImageUrl = supplierDTO.ImageUrl // Cập nhật URL hình ảnh nếu có
                };

                _context.Suppliers.Add(supplier);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Nhà cung cấp {supplier.SupplierName} đã được tạo thành công",
                    details = new
                    {
                        id = supplier.SupplierID,
                        name = supplier.SupplierName,
                        status = supplier.Status,
                        createdAt = DateTime.Now
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi thêm nhà cung cấp mới: {ex.Message}" });
            }
        }
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
            return Ok(new { url = fileUrl });
        }

        // PUT: api/Supplier/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupplier(int id, [FromBody] SupplierUpdateDTO supplierDTO)
        {
            try
            {
                if (supplierDTO == null || id != supplierDTO.SupplierID)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ hoặc ID không khớp." });
                }

                var existingSupplier = await _context.Suppliers
                    .Include(s => s.Products)
                    .Include(s => s.PurchaseOrders)
                    .FirstOrDefaultAsync(s => s.SupplierID == id);

                if (existingSupplier == null)
                {
                    return NotFound(new { message = $"Không tìm thấy nhà cung cấp với ID {id}." });
                }

                // Kiểm tra nếu đang chuyển sang trạng thái "Ngừng hợp tác"
                if (supplierDTO.Status == "Ngừng hợp tác" && existingSupplier.Status == "Đang hợp tác")
                {
                    // Kiểm tra xem có sản phẩm hoặc đơn hàng nào đang liên kết không
                    if (existingSupplier.Products?.Any() == true || existingSupplier.PurchaseOrders?.Any() == true)
                    {
                        return BadRequest(new
                        {
                            message = "Không thể cập nhật trạng thái nhà cung cấp sang 'Ngừng hợp tác' vì có sản phẩm hoặc đơn hàng đang liên kết.",
                            errors = new
                            {
                                Products = existingSupplier.Products?.Select(p => p.ProductID).ToList(),
                                PurchaseOrders = existingSupplier.PurchaseOrders?.Select(po => po.PurchaseOrderID).ToList()
                            }
                        });
                    }
                }

                // Cập nhật thông tin
                existingSupplier.SupplierName = supplierDTO.SupplierName;
                existingSupplier.ContactPerson = supplierDTO.ContactPerson;
                existingSupplier.Phone = supplierDTO.Phone;
                existingSupplier.Email = supplierDTO.Email;
                existingSupplier.Address = supplierDTO.Address;
                existingSupplier.Rating = supplierDTO.Rating;
                existingSupplier.PaymentTerms = supplierDTO.PaymentTerms;
                existingSupplier.DeliveryTime = supplierDTO.DeliveryTime;
                existingSupplier.Status = supplierDTO.Status;
                existingSupplier.ImageUrl = supplierDTO.ImageUrl; // Cập nhật URL hình ảnh nếu có

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Nhà cung cấp {existingSupplier.SupplierName} đã được cập nhật thành công",
                    details = new
                    {
                        id = existingSupplier.SupplierID,
                        name = existingSupplier.SupplierName,
                        status = existingSupplier.Status,
                        updatedAt = DateTime.Now
                    }
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SupplierExists(id))
                {
                    return NotFound(new { message = $"Không tìm thấy nhà cung cấp với ID {id}." });
                }
                throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi cập nhật nhà cung cấp: {ex.Message}" });
            }
        }

        // DELETE: api/Supplier/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            try
            {
                var supplier = await _context.Suppliers.FindAsync(id);
                if (supplier == null)
                {
                    return NotFound(new { message = $"Không tìm thấy nhà cung cấp với ID {id}." });
                }

                _context.Suppliers.Remove(supplier);
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Đã xóa nhà cung cấp với ID {id} thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi xóa nhà cung cấp: {ex.Message}");
            }
        }

        private bool SupplierExists(int id)
        {
            return _context.Suppliers.Any(e => e.SupplierID == id);
        }
    }
}