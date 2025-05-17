using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebAPI.Data;
using MyWebAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Identity.Client;

namespace MyWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AccountController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Đăng ký tài khoản
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Kiểm tra xem email đã tồn tại chưa
            var existingAccount = await _context.Accounts
                .FirstOrDefaultAsync(x => x.Email == request.Email);
            if (existingAccount != null)
            {
                return BadRequest("Email already exists.");
            }

            // Kiểm tra mật khẩu và xác nhận mật khẩu có khớp không
            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest("Password and Confirm Password do not match.");
            }

            // Mã hóa mật khẩu
            var passwordHasher = new PasswordHasher<Account>();
            var hashedPassword = passwordHasher.HashPassword(null, request.Password);

            // Tạo tài khoản mới
            var newAccount = new Account
            {
                Username = request.Username,
                Email = request.Email,
                Password = hashedPassword,
                Role = "User"  // Giả sử role mặc định là "User"
            };

            // Lưu tài khoản vào cơ sở dữ liệu
            _context.Accounts.Add(newAccount);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account created successfully" });
        }

        // Đăng nhập
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Kiểm tra email tồn tại không
            var account = await _context.Accounts
                .FirstOrDefaultAsync(x => x.Email == request.Email);

            if (account == null)
            {
                return Unauthorized(new { message = "Sai email hoặc mật khẩu." });

            }

            // Kiểm tra mật khẩu
            var passwordHasher = new PasswordHasher<Account>();
            var result = passwordHasher.VerifyHashedPassword(account, account.Password, request.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Sai email hoặc mật khẩu." });

            }

            // Tạo JWT Token
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, account.AccountID.ToString()),
                new Claim(ClaimTypes.Name, account.Email),
                new Claim(ClaimTypes.Role, account.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "your-app",
                audience: "your-app",
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo
            });

        }

        // Xem thông tin tài khoản hiện tại (sau khi đã đăng nhập)
        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var username = User.Identity?.Name;
            var account = _context.Accounts.FirstOrDefault(a => a.Email == username);

            if (account == null) return NotFound();

            return Ok(new
            {
                account.Username,
                account.Email,
                account.Role,
                account.Avatar
            });
        }
        [Authorize]
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized("Invalid user ID: Missing user ID in token.");
            }

            if (!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized("Invalid user ID");
            }

            var user = _context.Accounts.FirstOrDefault(u => u.AccountID == userId);

            if (user == null)
                return NotFound();

            return Ok(new
            {
                user.Username,
                user.Email,
                user.PhoneNumber,
                user.Role,
                user.Bio,
                user.Avatar
            });
        }
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
            return Ok(new { url = fileUrl });
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO dto)
        {
            try
            {
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString))
                {
                    return Unauthorized("Invalid user ID: Missing user ID in token.");
                }

                if (!int.TryParse(userIdString, out int userId))
                {
                    return Unauthorized("Invalid user ID: Unable to parse user ID.");
                }

                var user = await _context.Accounts.FindAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                // Cập nhật thông tin người dùng
                user.Username = dto.Username;
                user.Email = dto.Email;
                user.PhoneNumber = dto.PhoneNumber;
                user.Role = dto.Role;
                user.Bio = dto.Bio;
                user.Avatar = dto.Avatar;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật hồ sơ thành công !" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Accounts.FindAsync(int.Parse(userId));
            if (user == null) return NotFound();

            var passwordHasher = new PasswordHasher<Account>();
            var result = passwordHasher.VerifyHashedPassword(user, user.Password, dto.CurrentPassword);

            if (result == PasswordVerificationResult.Failed)
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });

            user.Password = passwordHasher.HashPassword(user, dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mật khẩu đã được thay đổi thành công." });
        }






    }

}
