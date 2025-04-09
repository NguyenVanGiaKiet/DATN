using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebAPI.Data;
using MyWebAPI.Models;
using Microsoft.Extensions.Logging;

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

        // POST: api/Product
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] Product product)
        {
            try
            {
                // Kiểm tra dữ liệu đầu vào
                if (product == null)
                {
                    return BadRequest(new { message = "Dữ liệu sản phẩm không hợp lệ" });
                }

                // Kiểm tra CategoryID tồn tại
                var category = await _context.Categories.FindAsync(product.CategoryID);
                if (category == null)
                {
                    return BadRequest(new { message = "Danh mục không tồn tại" });
                }

                // Kiểm tra SupplierID tồn tại
                var supplier = await _context.Suppliers.FindAsync(product.SupplierID);
                if (supplier == null)
                {
                    return BadRequest(new { message = "Nhà cung cấp không tồn tại" });
                }

                // Kiểm tra dữ liệu đầu vào
                if (string.IsNullOrEmpty(product.ProductName))
                {
                    return BadRequest(new { message = "Tên sản phẩm là bắt buộc" });
                }

                if (string.IsNullOrEmpty(product.Unit))
                {
                    return BadRequest(new { message = "Đơn vị tính là bắt buộc" });
                }

                if (product.StockQuantity < 0)
                {
                    return BadRequest(new { message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0" });
                }

                if (product.ReorderLevel < 0)
                {
                    return BadRequest(new { message = "Số lượng tồn kho tối thiểu phải lớn hơn hoặc bằng 0" });
                }

                // Thêm sản phẩm vào database
                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetProduct), new { id = product.ProductID }, product);
            }
            catch (Exception ex)
            {
                // Log lỗi
                Console.WriteLine($"Lỗi khi tạo sản phẩm: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                return StatusCode(500, new { message = $"Lỗi khi tạo sản phẩm: {ex.Message}" });
            }
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

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.ProductID == id);
        }
    }
} 