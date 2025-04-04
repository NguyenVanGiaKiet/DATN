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
    public class ApprovalLogController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ApprovalLogController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ApprovalLog
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApprovalLog>>> GetApprovalLogs()
        {
            return await _context.ApprovalLogs
                .Include(a => a.PurchaseOrder)
                .ToListAsync();
        }

        // GET: api/ApprovalLog/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApprovalLog>> GetApprovalLog(int id)
        {
            var approvalLog = await _context.ApprovalLogs
                .Include(a => a.PurchaseOrder)
                .FirstOrDefaultAsync(a => a.ApprovalID == id);

            if (approvalLog == null)
            {
                return NotFound();
            }

            return approvalLog;
        }

        // GET: api/ApprovalLog/Order/PO-2024-0001
        [HttpGet("Order/{orderId}")]
        public async Task<ActionResult<IEnumerable<ApprovalLog>>> GetApprovalLogsByOrder(string orderId)
        {
            return await _context.ApprovalLogs
                .Include(a => a.PurchaseOrder)
                .Where(a => a.PurchaseOrderID == orderId)
                .OrderByDescending(a => a.ApprovalDate)
                .ToListAsync();
        }

        // POST: api/ApprovalLog
        [HttpPost]
        public async Task<ActionResult<ApprovalLog>> CreateApprovalLog(ApprovalLog approvalLog)
        {
            _context.ApprovalLogs.Add(approvalLog);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApprovalLog), new { id = approvalLog.ApprovalID }, approvalLog);
        }

        // PUT: api/ApprovalLog/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateApprovalLog(int id, ApprovalLog approvalLog)
        {
            if (id != approvalLog.ApprovalID)
            {
                return BadRequest();
            }

            _context.Entry(approvalLog).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ApprovalLogExists(id))
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

        // DELETE: api/ApprovalLog/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApprovalLog(int id)
        {
            var approvalLog = await _context.ApprovalLogs.FindAsync(id);
            if (approvalLog == null)
            {
                return NotFound();
            }

            _context.ApprovalLogs.Remove(approvalLog);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ApprovalLogExists(int id)
        {
            return _context.ApprovalLogs.Any(e => e.ApprovalID == id);
        }
    }
} 