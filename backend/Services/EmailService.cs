using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using MyWebAPI.Models;

namespace MyWebAPI.Services
{
    public interface IEmailService
    {
        Task SendPurchaseOrderEmail(PurchaseOrder order);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendPurchaseOrderEmail(PurchaseOrder order)
        {
            try
            {
                var emailSettings = _configuration.GetSection("EmailSettings");
                if (emailSettings == null)
                {
                    throw new InvalidOperationException("Không tìm thấy cấu hình EmailSettings");
                }

                var host = emailSettings["Host"];
                var port = emailSettings["Port"];
                var username = emailSettings["Username"];
                var password = emailSettings["Password"];
                var fromEmail = emailSettings["FromEmail"];

                if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(port) || 
                    string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password) || 
                    string.IsNullOrEmpty(fromEmail))
                {
                    throw new InvalidOperationException("Thiếu thông tin cấu hình email");
                }

                if (order.Supplier == null)
                {
                    throw new InvalidOperationException("Không tìm thấy thông tin nhà cung cấp");
                }

                if (string.IsNullOrEmpty(order.Supplier.Email))
                {
                    throw new InvalidOperationException("Email nhà cung cấp không được để trống");
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Phòng Mua Hàng", fromEmail));
                message.To.Add(new MailboxAddress(order.Supplier.ContactPerson, order.Supplier.Email));
                message.Subject = $"Đơn đặt hàng: {order.PurchaseOrderID}";

                var builder = new BodyBuilder();
                builder.HtmlBody = GenerateEmailBody(order);
                message.Body = builder.ToMessageBody();

                using var client = new SmtpClient();
                _logger.LogInformation($"Đang kết nối đến SMTP server: {host}:{port}");
                
                await client.ConnectAsync(host, int.Parse(port), SecureSocketOptions.StartTls);
                _logger.LogInformation("Đã kết nối thành công đến SMTP server");

                await client.AuthenticateAsync(username, password);
                _logger.LogInformation("Xác thực SMTP thành công");

                await client.SendAsync(message);
                _logger.LogInformation($"Đã gửi email thành công đến {order.Supplier.Email}");

                await client.DisconnectAsync(true);
                _logger.LogInformation("Đã ngắt kết nối SMTP");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email");
                throw new Exception($"Lỗi khi gửi email: {ex.Message}", ex);
            }
        }

        private string GenerateEmailBody(PurchaseOrder order)
        {
            var body = $@"
                <h2>Chi tiết đơn đặt hàng {order.PurchaseOrderID}</h2>
                <p>Kính gửi {order.Supplier.ContactPerson},</p>
                <p>Chúng tôi gửi thông tin chi tiết đơn đặt hàng như sau:</p>
                <table border='1' style='border-collapse: collapse; width: 100%;'>
                    <tr>
                        <td><strong>Mã đơn hàng:</strong></td>
                        <td>{order.PurchaseOrderID}</td>
                    </tr>
                    <tr>
                        <td><strong>Ngày đặt hàng:</strong></td>
                        <td>{order.OrderDate:dd/MM/yyyy}</td>
                    </tr>
                    <tr>
                        <td><strong>Ngày giao hàng dự kiến:</strong></td>
                        <td>{order.ExpectedDeliveryDate:dd/MM/yyyy}</td>
                    </tr>
                    <tr>
                        <td><strong>Tổng giá trị:</strong></td>
                        <td>{order.TotalAmount:N0} VNĐ</td>
                    </tr>
                </table>

                <h3>Chi tiết sản phẩm:</h3>
                <table border='1' style='border-collapse: collapse; width: 100%;'>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>";

            foreach (var detail in order.PurchaseOrderDetails)
            {
                body += $@"
                    <tr>
                        <td>{detail.Product?.ProductName}</td>
                        <td>{detail.Quantity}</td>
                        <td>{detail.UnitPrice:N0} VNĐ</td>
                        <td>{detail.TotalPrice:N0} VNĐ</td>
                    </tr>";
            }

            body += @"
                </table>
                <p>Vui lòng xác nhận lại đơn hàng cho chúng tôi.</p>
                <p>Trân trọng,<br>Phòng mua hàng</p>";

            return body;
        }
    }
} 