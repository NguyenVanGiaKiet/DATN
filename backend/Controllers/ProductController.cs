using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebAPI.Data;
using MyWebAPI.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace MyWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ProductController> _logger;

        public ProductController(AppDbContext context, ILogger<ProductController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Product
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .ToListAsync();
        }

        // GET: api/Product/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .FirstOrDefaultAsync(p => p.ProductID == id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // GET: api/Product/Category/5
        [HttpGet("Category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByCategory(int categoryId)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Where(p => p.CategoryID == categoryId)
                .ToListAsync();
        }

        // GET: api/Product/Supplier/5
        [HttpGet("Supplier/{supplierId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsBySupplier(int supplierId)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Where(p => p.SupplierID == supplierId)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct(ProductDTO dto)
        {
            var product = new Product
            {
                ProductName = dto.ProductName,
                CategoryID = dto.CategoryID,
                SupplierID = dto.SupplierID,
                Unit = dto.Unit,
                StockQuantity = dto.StockQuantity,
                ReorderLevel = dto.ReorderLevel,
                ImageUrl = dto.ImageUrl
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(product);
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

        // PUT: api/Product/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
        {
            try
            {
                if (id != product.ProductID)
                {
                    return BadRequest(new { message = "ID không khớp" });
                }

                // Kiểm tra sản phẩm tồn tại
                var existingProduct = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Supplier)
                    .FirstOrDefaultAsync(p => p.ProductID == id);

                if (existingProduct == null)
                {
                    return NotFound(new { message = "Sản phẩm không tồn tại" });
                }

                // Kiểm tra CategoryID và SupplierID
                var category = await _context.Categories.FindAsync(product.CategoryID);
                if (category == null)
                {
                    return BadRequest(new { message = "Danh mục không tồn tại" });
                }

                var supplier = await _context.Suppliers.FindAsync(product.SupplierID);
                if (supplier == null)
                {
                    return BadRequest(new { message = "Nhà cung cấp không tồn tại" });
                }

                // Cập nhật thông tin sản phẩm
                existingProduct.ProductName = product.ProductName;
                existingProduct.Unit = product.Unit;
                existingProduct.StockQuantity = product.StockQuantity;
                existingProduct.ReorderLevel = product.ReorderLevel;
                existingProduct.ImageUrl = product.ImageUrl;
                existingProduct.CategoryID = product.CategoryID;
                existingProduct.SupplierID = product.SupplierID;
                existingProduct.Category = category;
                existingProduct.Supplier = supplier;

                // Kiểm tra dữ liệu đầu vào
                if (string.IsNullOrEmpty(existingProduct.ProductName))
                {
                    return BadRequest(new { message = "Tên sản phẩm là bắt buộc" });
                }

                if (string.IsNullOrEmpty(existingProduct.Unit))
                {
                    return BadRequest(new { message = "Đơn vị tính là bắt buộc" });
                }

                if (existingProduct.StockQuantity < 0)
                {
                    return BadRequest(new { message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0" });
                }

                if (existingProduct.ReorderLevel < 0)
                {
                    return BadRequest(new { message = "Số lượng tồn kho tối thiểu phải lớn hơn hoặc bằng 0" });
                }

                try
                {
                    await _context.SaveChangesAsync();
                    return NoContent();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ProductExists(id))
                    {
                        return NotFound(new { message = "Sản phẩm không tồn tại" });
                    }
                    else
                    {
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật sản phẩm");
                return StatusCode(500, new { message = "Lỗi khi cập nhật sản phẩm", details = ex.Message });
            }
        }

        // DELETE: api/Product/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}/update-stock")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] JsonElement stockData)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = "Không tìm thấy sản phẩm" });
                }

                int quantity = stockData.GetProperty("quantity").GetInt32();
                string type = stockData.GetProperty("type").GetString();

                if (type == "in")
                {
                    product.StockQuantity += quantity;
                }
                else if (type == "out")
                {
                    if (product.StockQuantity < quantity)
                    {
                        return BadRequest(new { message = "Số lượng tồn kho không đủ" });
                    }
                    product.StockQuantity -= quantity;
                }
                else
                {
                    return BadRequest(new { message = "Loại cập nhật không hợp lệ" });
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Đã cập nhật tồn kho thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi cập nhật tồn kho: {ex.Message}" });
            }
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.ProductID == id);
        }
    }
}