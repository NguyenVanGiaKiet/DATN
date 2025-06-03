using System.ComponentModel.DataAnnotations;

namespace MyWebAPI.Models
{
    public class SupplierCreateDTO
    {
        [Required(ErrorMessage = "Tên nhà cung cấp là bắt buộc")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Tên nhà cung cấp phải từ 2-100 ký tự")]
        public string? SupplierName { get; set; }

        [Required(ErrorMessage = "Người liên hệ là bắt buộc")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Tên người liên hệ phải từ 2-50 ký tự")]
        public string? ContactPerson { get; set; }

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
        public string? Phone { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Địa chỉ là bắt buộc")]
        [StringLength(200, ErrorMessage = "Địa chỉ không được vượt quá 200 ký tự")]
        public string? Address { get; set; }

        [Range(1, 5, ErrorMessage = "Đánh giá phải từ 1-5")]
        public int? Rating { get; set; }

        [Required(ErrorMessage = "Điều khoản thanh toán là bắt buộc")]
        [StringLength(50, ErrorMessage = "Điều khoản thanh toán không được vượt quá 50 ký tự")]
        public string? PaymentTerms { get; set; }

        [Range(1, 30, ErrorMessage = "Thời gian giao hàng phải từ 1-30 ngày")]
        public int? DeliveryTime { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        [StringLength(20, ErrorMessage = "Trạng thái không được vượt quá 20 ký tự")]
        public string? Status { get; set; }

        public string? ImageUrl { get; set; }
    }
}
