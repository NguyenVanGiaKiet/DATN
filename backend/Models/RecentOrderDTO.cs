public class RecentOrderDTO
{
    public string PurchaseOrderID { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime ExpectedDeliveryDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; }
    public string ApprovedBy { get; set; }
    public string SupplierName { get; set; }
    public string ImageUrl { get; set; }
}
