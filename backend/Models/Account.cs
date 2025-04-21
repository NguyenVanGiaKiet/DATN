using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyWebAPI.Models
{
    public class Account
    {
        [Key]
        public int AccountID { get; set; }
        public string? Username { get; set; }  // Lưu tên đầy đủ của người dùng
        public string? Email { get; set; }     // Lưu địa chỉ email của người dùng
        public string? Password { get; set; }  // Lưu mật khẩu đã mã hóa
        public string? Role { get; set; }  // Ví dụ: "User", "Admin"
        public string? PhoneNumber { get; set; }  // Lưu số điện thoại của người dùng
        public string? Address { get; set; }  // Lưu địa chỉ của người dùng
        public string? Avatar { get; set; }  // Lưu đường dẫn đến ảnh đại diện của người dùng
        public DateTime CreateDate { get; set; } = DateTime.UtcNow;  // Thời gian tạo tài khoản
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;  // Thời gian cập nhật tài khoản
        public DateTime LastLoginDate { get; set; } = DateTime.UtcNow;  // Thời gian đăng nhập cuối cùng
        public bool IsActive { get; set; } = true;  // Trạng thái tài khoản (kích hoạt hay không)
    }
}