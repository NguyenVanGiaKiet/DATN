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
    public class GoodsReceivedController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GoodsReceivedController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/GoodsReceived
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GoodsReceived>>> GetGoodsReceived()
        {
            return await _context.GoodsReceived
                .Include(g => g.PurchaseOrder)
                    .ThenInclude(p => p.Supplier)
                .ToListAsync();
        }

        // GET: api/GoodsReceived/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GoodsReceived>> GetGoodsReceived(int id)
        {
            var goodsReceived = await _context.GoodsReceived
                .Include(g => g.PurchaseOrder)
                    .ThenInclude(p => p.Supplier)
                .FirstOrDefaultAsync(g => g.GoodsReceivedID == id);

            if (goodsReceived == null)
            {
                return NotFound();
            }

            return goodsReceived;
        }

        // GET: api/GoodsReceived/Order/PO-2024-0001
        [HttpGet("Order/{orderId}")]
        public async Task<ActionResult<IEnumerable<GoodsReceived>>> GetGoodsReceivedByOrder(string orderId)
        {
            return await _context.GoodsReceived
                .Include(gr => gr.PurchaseOrder)
                .Where(gr => gr.PurchaseOrderID == orderId)
                .ToListAsync();
        }

        // POST: api/GoodsReceived
        [HttpPost]
        public async Task<ActionResult<GoodsReceived>> CreateGoodsReceived(GoodsReceived goodsReceived)
        {
            try
            {
                // Kiểm tra dữ liệu đầu vào
                if (string.IsNullOrEmpty(goodsReceived.Receiver))
                {
                    return BadRequest("Vui lòng nhập tên người nhận hàng");
                }

                if (string.IsNullOrEmpty(goodsReceived.PurchaseOrderID))
                {
                    return BadRequest("Mã đơn hàng không hợp lệ");
                }

                // Kiểm tra đơn hàng tồn tại
                var purchaseOrder = await _context.PurchaseOrders
                    .FirstOrDefaultAsync(p => p.PurchaseOrderID == goodsReceived.PurchaseOrderID);

                if (purchaseOrder == null)
                {
                    return BadRequest("Không tìm thấy đơn hàng");
                }

                // Tạo phiếu nhận hàng mới
                var newGoodsReceived = new GoodsReceived
                {
                    PurchaseOrderID = goodsReceived.PurchaseOrderID,
                    ReceivedDate = goodsReceived.ReceivedDate,
                    Receiver = goodsReceived.Receiver,
                    Status = goodsReceived.Status,
                    Remarks = goodsReceived.Remarks
                };

                _context.GoodsReceived.Add(newGoodsReceived);
                await _context.SaveChangesAsync();

                // Cập nhật trạng thái đơn hàng
                purchaseOrder.Status = "Đã nhận hàng";
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetGoodsReceived), new { id = newGoodsReceived.GoodsReceivedID }, newGoodsReceived);
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi khi tạo phiếu nhận hàng: {ex.Message}");
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