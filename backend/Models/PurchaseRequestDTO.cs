using System;
using System.Collections.Generic;
using MyWebAPI.Models;

namespace MyWebAPI.Models
{
    public class PurchaseRequestDTO
    {
        public int PurchaseRequestID { get; set; }
        public DateTime CreatedDate { get; set; }
        public string Requester { get; set; }
        public string Department { get; set; }
        public string Priority { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string? ReviewedBy { get; set; }
        public List<PurchaseRequestItem> Items { get; set; }
        public string? PurchaseOrderID { get; set; }
    }
}
