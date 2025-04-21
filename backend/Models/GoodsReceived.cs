using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebAPI.Models
{
    public class GoodsReceived
    {
        [Key]
        public int GoodsReceivedID { get; set; }

        [Required]
        public string? PurchaseOrderID { get; set; }

        [Required]
        public DateTime ReceivedDate { get; set; }

        [Required]
        [StringLength(100)]
        public string? Receiver { get; set; }

        [Required]
        [StringLength(20)]
        public string? Status { get; set; }

        [StringLength(500)]
        public string? Remarks { get; set; }

        // Navigation properties
        [ForeignKey("PurchaseOrderID")]
        public virtual PurchaseOrder? PurchaseOrder { get; set; }
    }
} 