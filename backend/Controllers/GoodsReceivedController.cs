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
                .Include(gr => gr.PurchaseOrder)
                .ToListAsync();
        }

        // GET: api/GoodsReceived/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GoodsReceived>> GetGoodsReceived(int id)
        {
            var goodsReceived = await _context.GoodsReceived
                .Include(gr => gr.PurchaseOrder)
                .FirstOrDefaultAsync(gr => gr.GoodsReceivedID == id);

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
            _context.GoodsReceived.Add(goodsReceived);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGoodsReceived), new { id = goodsReceived.GoodsReceivedID }, goodsReceived);
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