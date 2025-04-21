using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebAPI.Models
{
    public class Payment
    {
        [Key]
        public int PaymentID { get; set; }

        [Required]
        public int InvoiceID { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountPaid { get; set; }

        [Required]
        [StringLength(50)]
        public string? PaymentMethod { get; set; }

        [Required]
        [StringLength(100)]
        public string? ProcessedBy { get; set; }

        // Navigation property without Required attribute
        [ForeignKey("InvoiceID")]
        public virtual Invoice? Invoice { get; set; }    
    }
}