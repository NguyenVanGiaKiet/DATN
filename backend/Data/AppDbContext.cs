using Microsoft.EntityFrameworkCore;
using MyWebAPI.Models;

namespace MyWebAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderDetail> PurchaseOrderDetails { get; set; }
        public DbSet<GoodsReceived> GoodsReceived { get; set; }
        public DbSet<ReturnToSupplier> ReturnToSupplier { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<ApprovalLog> ApprovalLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình kiểu dữ liệu decimal
            modelBuilder.Entity<Product>()
                .Property(p => p.StockQuantity)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Product>()
                .Property(p => p.ReorderLevel)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrder>()
                .Property(p => p.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderDetail>()
                .Property(p => p.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderDetail>()
                .Property(p => p.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderDetail>()
                .Property(p => p.ReceivedQuantity)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderDetail>()
                .Property(p => p.ReturnQuantity)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ReturnToSupplier>()
                .Property(r => r.ReturnQuantity)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>()
                .Property(p => p.AmountPaid)
                .HasPrecision(18, 2);

            // Cấu hình DeleteBehavior để tránh multiple cascade paths
            modelBuilder.Entity<PurchaseOrderDetail>()
                .HasOne(p => p.Product)
                .WithMany(p => p.PurchaseOrderDetails)
                .HasForeignKey(p => p.ProductID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<PurchaseOrderDetail>()
                .HasOne(p => p.PurchaseOrder)
                .WithMany(p => p.PurchaseOrderDetails)
                .HasForeignKey(p => p.PurchaseOrderID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ReturnToSupplier>()
                .HasOne(r => r.Product)
                .WithMany(p => p.ReturnsToSupplier)
                .HasForeignKey(r => r.ProductID)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ReturnToSupplier>()
                .HasOne(r => r.PurchaseOrder)
                .WithMany(p => p.ReturnsToSupplier)
                .HasForeignKey(r => r.PurchaseOrderID)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
} 