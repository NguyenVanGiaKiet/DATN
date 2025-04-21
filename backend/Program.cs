using MyWebAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.Json;
using MyWebAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// 🔹 1. Cấu hình kết nối database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 🔹 2. Cấu hình CORS (Cho phép React kết nối API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// 🔹 3. Cấu hình services (BỎ ReferenceHandler.Preserve, DÙNG IgnoreCycles)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// 🔹 4. Đăng ký EmailService
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cấu hình JWT Bearer Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "your-app",
            ValidAudience = "your-app",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]))
        };
    });
// Cấu hình Authorization
builder.Services.AddAuthorization();

var app = builder.Build();

// 🔹 5. Middleware xử lý lỗi
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
}

// 🔹 6. Bật HTTPS Redirect (nếu dùng HTTPS)
app.UseHttpsRedirection();

app.UseStaticFiles();
// 🔹 7. Bật CORS
app.UseCors("AllowAll");

// 🔹 8. Kích hoạt Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// 🔹 9. Kích hoạt Swagger UI
app.UseSwagger();
app.UseSwaggerUI();

// 🔹 10. Map Controllers
app.MapControllers();

app.Run();
