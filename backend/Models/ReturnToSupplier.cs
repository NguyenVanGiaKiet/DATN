using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebAPI.Models
{
    public class ReturnToSupplier
    {
        [Key]
        public int ReturnID { get; set; }

        [Required]
        public string PurchaseOrderID { get; set; }

        [Required]
        public int ProductID { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ReturnQuantity { get; set; }

        [Required]
        public DateTime ReturnDate { get; set; }

        [Required]
        [StringLength(500)]
        public string ReturnReason { get; set; }

        [Required]
        [StringLength(100)]
        public string ProcessedBy { get; set; }

        // Navigation properties
        [ForeignKey("PurchaseOrderID")]
        public virtual PurchaseOrder PurchaseOrder { get; set; }

        [ForeignKey("ProductID")]
        public virtual Product Product { get; set; }
    }
} 