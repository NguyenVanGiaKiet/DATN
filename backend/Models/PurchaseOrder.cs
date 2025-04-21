using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebAPI.Models
{
    public class PurchaseOrder
    {
        [Key]
        public string? PurchaseOrderID { get; set; }

        [Required]
        public int SupplierID { get; set; }

        [Required]
        public DateTime OrderDate { get; set; }

        [Required]
        public DateTime ExpectedDeliveryDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [StringLength(20)]
        public string? Status { get; set; }

        [Required]
        [StringLength(100)]
        public string? ApprovedBy { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        // Navigation properties
        [ForeignKey("SupplierID")]
        public virtual Supplier? Supplier { get; set; }

        public virtual ICollection<PurchaseOrderDetail>? PurchaseOrderDetails { get; set; }
        public virtual ICollection<GoodsReceived>? GoodsReceived { get; set; }
        public virtual ICollection<ReturnToSupplier>? ReturnsToSupplier { get; set; }
        public virtual ICollection<Invoice>? Invoices { get; set; }
        public virtual ICollection<ApprovalLog>? ApprovalLogs { get; set; }
    }
} 