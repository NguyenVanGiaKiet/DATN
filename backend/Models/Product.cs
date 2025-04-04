using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebAPI.Models
{
    public class Product
    {
        [Key]
        public int ProductID { get; set; }

        [Required]
        [StringLength(100)]
        public string ProductName { get; set; }

        [Required]
        public int CategoryID { get; set; }

        [Required]
        public int SupplierID { get; set; }

        [Required]
        [StringLength(20)]
        public string Unit { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal StockQuantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ReorderLevel { get; set; }

        // Navigation properties
        [ForeignKey("CategoryID")]
        public virtual Category Category { get; set; }

        [ForeignKey("SupplierID")]
        public virtual Supplier Supplier { get; set; }

        public virtual ICollection<PurchaseOrderDetail> PurchaseOrderDetails { get; set; }
        public virtual ICollection<ReturnToSupplier> ReturnsToSupplier { get; set; }
    }
} 