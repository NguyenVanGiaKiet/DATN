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
    public class PurchaseOrderDetailController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchaseOrderDetailController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/PurchaseOrderDetail
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseOrderDetail>>> GetPurchaseOrderDetails()
        {
            return await _context.PurchaseOrderDetails
                .Include(pod => pod.PurchaseOrder)
                .Include(pod => pod.Product)
                .ToListAsync();
        }

        // GET: api/PurchaseOrderDetail/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderDetail>> GetPurchaseOrderDetail(int id)
        {
            var purchaseOrderDetail = await _context.PurchaseOrderDetails
                .Include(pod => pod.PurchaseOrder)
                .Include(pod => pod.Product)
                .FirstOrDefaultAsync(pod => pod.PODetailID == id);

            if (purchaseOrderDetail == null)
            {
                return NotFound();
            }

            return purchaseOrderDetail;
        }

        // GET: api/PurchaseOrderDetail/Order/PO-2024-0001
        [HttpGet("Order/{orderId}")]
        public async Task<ActionResult<IEnumerable<PurchaseOrderDetail>>> GetPurchaseOrderDetailsByOrder(string orderId)
        {
            return await _context.PurchaseOrderDetails
                .Include(pod => pod.PurchaseOrder)
                .Include(pod => pod.Product)
                .Where(pod => pod.PurchaseOrderID == orderId)
                .ToListAsync();
        }

        // POST: api/PurchaseOrderDetail
        [HttpPost]
        public async Task<ActionResult<PurchaseOrderDetail>> CreatePurchaseOrderDetail(PurchaseOrderDetail purchaseOrderDetail)
        {
            _context.PurchaseOrderDetails.Add(purchaseOrderDetail);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPurchaseOrderDetail), new { id = purchaseOrderDetail.PODetailID }, purchaseOrderDetail);
        }

        // PUT: api/PurchaseOrderDetail/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePurchaseOrderDetail(int id, PurchaseOrderDetail purchaseOrderDetail)
        {
            if (id != purchaseOrderDetail.PODetailID)
            {
                return BadRequest();
            }

            _context.Entry(purchaseOrderDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PurchaseOrderDetailExists(id))
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

        // DELETE: api/PurchaseOrderDetail/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePurchaseOrderDetail(int id)
        {
            var purchaseOrderDetail = await _context.PurchaseOrderDetails.FindAsync(id);
            if (purchaseOrderDetail == null)
            {
                return NotFound();
            }

            _context.PurchaseOrderDetails.Remove(purchaseOrderDetail);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PurchaseOrderDetailExists(int id)
        {
            return _context.PurchaseOrderDetails.Any(e => e.PODetailID == id);
        }
    }
} 