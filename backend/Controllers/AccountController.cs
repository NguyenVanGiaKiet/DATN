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

namespace YourApp.Controllers
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
                return Unauthorized("Invalid email or password.");
            }

            // Kiểm tra mật khẩu
            var passwordHasher = new PasswordHasher<Account>();
            var result = passwordHasher.VerifyHashedPassword(account, account.Password, request.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                return Unauthorized("Invalid email or password.");
            }

            // Tạo JWT Token
            var claims = new[]
            {
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
                account.Role
            });
        }
    }
    
}
