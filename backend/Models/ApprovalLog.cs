using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebAPI.Models
{
    public class ApprovalLog
    {
        [Key]
        public int ApprovalID { get; set; }

        [Required]
        public string? PurchaseOrderID { get; set; }

        [Required]
        [StringLength(100)]
        public string? ApprovedBy { get; set; }

        [Required]
        public DateTime ApprovalDate { get; set; }

        [Required]
        [StringLength(20)]
        public string? ApprovalStatus { get; set; }

        [Required]
        [StringLength(500)]
        public string? Comments { get; set; }

        // Navigation properties
        [ForeignKey("PurchaseOrderID")]
        public virtual PurchaseOrder? PurchaseOrder { get; set; }
    }
} 