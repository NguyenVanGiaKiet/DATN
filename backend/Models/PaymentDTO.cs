public class PaymentDTO
{
    public int InvoiceID { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal AmountPaid { get; set; }
    public string PaymentMethod { get; set; }
    public string ProcessedBy { get; set; }
}
