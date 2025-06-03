using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebAPI.Models
{
    public class PurchaseRequest
    {    
        [Key]
        public int PurchaseRequestID { get; set; }

        [Required]
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        [Required]
        public string Requester { get; set; } = string.Empty;

        [Required]
        public string Department { get; set; } = string.Empty;

        [Required]
        public string Priority { get; set; } = string.Empty;

        [Required]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = "Chờ duyệt";
        // Username người duyệt hoặc không duyệt
        public string? ReviewedBy { get; set; }

        public virtual ICollection<PurchaseRequestItem> Items { get; set; } = new List<PurchaseRequestItem>();

        public virtual ICollection<PurchaseOrder>? PurchaseOrders { get; set; } 


    }

    public class PurchaseRequestItem
    {
        [Key]
        public int PurchaseRequestItemID { get; set; }

        [Required]
        public int PurchaseRequestID { get; set; }

        [Required]
        public int ProductID { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public string Unit { get; set; } = string.Empty;

        public string? Description { get; set; }

        [ForeignKey("ProductID")]
        public virtual Product? Product { get; set; }

        [ForeignKey("PurchaseRequestID")]
        public virtual PurchaseRequest? PurchaseRequest { get; set; }
    }
}
