using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebAPI.Models
{
    public class PurchaseOrderDetail
    {
        [Key]
        public int PODetailID { get; set; }

        [Required]
        public string? PurchaseOrderID { get; set; }

        [Required]
        public int ProductID { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ReceivedQuantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ReturnQuantity { get; set; }

        // Navigation properties
        [ForeignKey("PurchaseOrderID")]
        public virtual PurchaseOrder? PurchaseOrder { get; set; }

        [ForeignKey("ProductID")]
        public virtual Product? Product { get; set; }
    }
} 