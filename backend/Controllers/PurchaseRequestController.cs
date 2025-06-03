using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebAPI.Models;
using MyWebAPI.Data;
using System.Collections.Generic;
using System.Linq;
using System;

namespace MyWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseRequestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchaseRequestController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<PurchaseRequestDTO>> GetAll()
        {
            var prs = _context.PurchaseRequests
                              .Include(x => x.Items)
                              .Select(pr => new PurchaseRequestDTO
                              {
                                  PurchaseRequestID = pr.PurchaseRequestID,
                                  CreatedDate = pr.CreatedDate,
                                  Requester = pr.Requester,
                                  Department = pr.Department,
                                  Priority = pr.Priority,
                                  Reason = pr.Reason,
                                  Status = pr.Status,
                                  ReviewedBy = pr.ReviewedBy,
                                  Items = pr.Items.ToList(),
                                  PurchaseOrderID = _context.PurchaseOrders
                                      .Where(po => po.PurchaseRequestID == pr.PurchaseRequestID)
                                      .Select(po => po.PurchaseOrderID)
                                      .FirstOrDefault()
                              })
                              .ToList();
            return Ok(prs);
        }

        [HttpGet("{id}")]
        public ActionResult<PurchaseRequestDTO> Get(int id)
        {
            var pr = _context.PurchaseRequests
                             .Include(x => x.Items)
                             .Where(x => x.PurchaseRequestID == id)
                             .Select(pr => new PurchaseRequestDTO
                             {
                                 PurchaseRequestID = pr.PurchaseRequestID,
                                 CreatedDate = pr.CreatedDate,
                                 Requester = pr.Requester,
                                 Department = pr.Department,
                                 Priority = pr.Priority,
                                 Reason = pr.Reason,
                                 Status = pr.Status,
                                 ReviewedBy = pr.ReviewedBy,
                                 Items = pr.Items.ToList(),
                                 PurchaseOrderID = _context.PurchaseOrders
                                     .Where(po => po.PurchaseRequestID == pr.PurchaseRequestID)
                                     .Select(po => po.PurchaseOrderID)
                                     .FirstOrDefault()
                             })
                             .FirstOrDefault();
            if (pr == null)
                return NotFound(new { message = "Không tìm thấy yêu cầu mua hàng." });

            return Ok(pr);
        }

        [HttpGet("next-id")]
        public IActionResult GetNextPurchaseRequestId()
        {
            int year = DateTime.Now.Year;
            var maxId = _context.PurchaseRequests
                .Where(x => x.CreatedDate.Year == year)
                .OrderByDescending(x => x.PurchaseRequestID)
                .Select(x => x.PurchaseRequestID)
                .FirstOrDefault();
            int nextId = maxId + 1;
            return Ok(new { nextId });
        }

        [HttpPost]
        public ActionResult<PurchaseRequest> Create([FromBody] PurchaseRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                                       .SelectMany(v => v.Errors)
                                       .Select(e => e.ErrorMessage)
                                       .ToList();
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors });
            }

            if (request.Items == null || !request.Items.Any())
                return BadRequest(new { message = "Danh sách vật tư (Items) không được để trống." });

            foreach (var item in request.Items)
            {
                if (item.ProductID <= 0)
                    return BadRequest(new { message = "Mỗi vật tư phải có ProductID hợp lệ (> 0)." });

                if (item.Quantity <= 0)
                    return BadRequest(new { message = "Số lượng vật tư phải > 0." });
            }

            request.CreatedDate = DateTime.Now;
            request.Status = "Chờ duyệt";

            _context.PurchaseRequests.Add(request);
            _context.SaveChanges();

            var prWithItems = _context.PurchaseRequests
                                      .Include(x => x.Items)
                                      .FirstOrDefault(x => x.PurchaseRequestID == request.PurchaseRequestID);

            return CreatedAtAction(nameof(Get), new { id = request.PurchaseRequestID }, prWithItems);
        }

        [HttpPut("{id}")]
        public ActionResult Update(int id, [FromBody] PurchaseRequest request)
        {
            var existing = _context.PurchaseRequests
                .Include(x => x.Items)
                .FirstOrDefault(x => x.PurchaseRequestID == id);
            if (existing == null)
                return NotFound(new { message = "Không tìm thấy yêu cầu mua hàng." });

            // Cập nhật các trường cơ bản
            existing.Requester = request.Requester;
            existing.Department = request.Department;
            existing.Priority = request.Priority;
            existing.Reason = request.Reason;
            existing.Status = request.Status;
            existing.CreatedDate = request.CreatedDate;

            // Cập nhật danh sách Items (xóa cũ, thêm mới)
            existing.Items.Clear();
            foreach (var item in request.Items)
            {
                existing.Items.Add(new PurchaseRequestItem
                {
                    ProductID = item.ProductID,
                    Quantity = item.Quantity,
                    Unit = item.Unit,
                    Description = item.Description
                });
            }

            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            var pr = _context.PurchaseRequests
                             .Include(x => x.Items)
                             .FirstOrDefault(x => x.PurchaseRequestID == id);
            if (pr == null)
                return NotFound(new { message = "Không tìm thấy yêu cầu mua hàng." });

            _context.PurchaseRequests.Remove(pr);
            _context.SaveChanges();
            return NoContent();
        }

        // Action duyệt yêu cầu mua hàng
        [HttpPost("{id}/approve")]
        public IActionResult Approve(int id)
        {
            var pr = _context.PurchaseRequests.FirstOrDefault(x => x.PurchaseRequestID == id);
            if (pr == null)
                return NotFound(new { message = "Không tìm thấy yêu cầu mua hàng." });


            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"CLAIM TYPE: {claim.Type} - VALUE: {claim.Value}");
            }
            // Lấy username từ token (ưu tiên các claim phổ biến)
            // Lấy username từ token (ưu tiên email trong claim 'name')
            var username = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")?.Value
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
                ?? User.Identity?.Name;
            pr.Status = "Đã duyệt";
            pr.ReviewedBy = username ?? "unknown";
            _context.SaveChanges();
            return Ok(new { message = "Yêu cầu đã được duyệt!", reviewedBy = pr.ReviewedBy });
        }

        // Action không duyệt yêu cầu mua hàng
        [HttpPost("{id}/reject")]
        public IActionResult Reject(int id)
        {
            var pr = _context.PurchaseRequests.FirstOrDefault(x => x.PurchaseRequestID == id);
            if (pr == null)
                return NotFound(new { message = "Không tìm thấy yêu cầu mua hàng." });

            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"CLAIM TYPE: {claim.Type} - VALUE: {claim.Value}");
            }

            // Lấy username từ token (ưu tiên các claim phổ biến)
            // Lấy username từ token (ưu tiên email trong claim 'name')
            var username = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name")?.Value
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
                ?? User.Identity?.Name;
            pr.Status = "Không duyệt";
            pr.ReviewedBy = username ?? "unknown";
            _context.SaveChanges();
            return Ok(new { message = "Yêu cầu đã bị từ chối!", reviewedBy = pr.ReviewedBy });
        }
    }
}
