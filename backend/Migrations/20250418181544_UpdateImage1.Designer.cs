﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MyWebAPI.Data;

#nullable disable

namespace MyWebAPI.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20250418181544_UpdateImage1")]
    partial class UpdateImage1
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("MyWebAPI.Models.ApprovalLog", b =>
                {
                    b.Property<int>("ApprovalID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ApprovalID"));

                    b.Property<DateTime>("ApprovalDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("ApprovalStatus")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.Property<string>("ApprovedBy")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("Comments")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.Property<string>("PurchaseOrderID")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("ApprovalID");

                    b.HasIndex("PurchaseOrderID");

                    b.ToTable("ApprovalLogs");
                });

            modelBuilder.Entity("MyWebAPI.Models.Category", b =>
                {
                    b.Property<int>("CategoryID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CategoryID"));

                    b.Property<string>("CategoryName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.HasKey("CategoryID");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("MyWebAPI.Models.GoodsReceived", b =>
                {
                    b.Property<int>("GoodsReceivedID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("GoodsReceivedID"));

                    b.Property<string>("PurchaseOrderID")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTime>("ReceivedDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Receiver")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("Remarks")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.HasKey("GoodsReceivedID");

                    b.HasIndex("PurchaseOrderID");

                    b.ToTable("GoodsReceived");
                });

            modelBuilder.Entity("MyWebAPI.Models.Invoice", b =>
                {
                    b.Property<int>("InvoiceID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("InvoiceID"));

                    b.Property<DateTime>("DueDate")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("InvoiceDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("PaymentStatus")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.Property<string>("PurchaseOrderID")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<decimal>("TotalAmount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("InvoiceID");

                    b.HasIndex("PurchaseOrderID");

                    b.ToTable("Invoices");
                });

            modelBuilder.Entity("MyWebAPI.Models.Payment", b =>
                {
                    b.Property<int>("PaymentID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("PaymentID"));

                    b.Property<decimal>("AmountPaid")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("InvoiceID")
                        .HasColumnType("int");

                    b.Property<DateTime>("PaymentDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("PaymentMethod")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("ProcessedBy")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.HasKey("PaymentID");

                    b.HasIndex("InvoiceID");

                    b.ToTable("Payments");
                });

            modelBuilder.Entity("MyWebAPI.Models.Product", b =>
                {
                    b.Property<int>("ProductID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ProductID"));

                    b.Property<int>("CategoryID")
                        .HasColumnType("int");

                    b.Property<string>("ProductName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<int>("ReorderLevel")
                        .HasPrecision(18, 2)
                        .HasColumnType("int");

                    b.Property<int>("StockQuantity")
                        .HasPrecision(18, 2)
                        .HasColumnType("int");

                    b.Property<int>("SupplierID")
                        .HasColumnType("int");

                    b.Property<string>("Unit")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.HasKey("ProductID");

                    b.HasIndex("CategoryID");

                    b.HasIndex("SupplierID");

                    b.ToTable("Products");
                });

            modelBuilder.Entity("MyWebAPI.Models.PurchaseOrder", b =>
                {
                    b.Property<string>("PurchaseOrderID")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ApprovedBy")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<DateTime>("ExpectedDeliveryDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Notes")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.Property<DateTime>("OrderDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.Property<int>("SupplierID")
                        .HasColumnType("int");

                    b.Property<decimal>("TotalAmount")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("PurchaseOrderID");

                    b.HasIndex("SupplierID");

                    b.ToTable("PurchaseOrders");
                });

            modelBuilder.Entity("MyWebAPI.Models.PurchaseOrderDetail", b =>
                {
                    b.Property<int>("PODetailID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("PODetailID"));

                    b.Property<int>("ProductID")
                        .HasColumnType("int");

                    b.Property<string>("PurchaseOrderID")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<decimal>("ReceivedQuantity")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal>("ReturnQuantity")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal>("TotalPrice")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal>("UnitPrice")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("PODetailID");

                    b.HasIndex("ProductID");

                    b.HasIndex("PurchaseOrderID");

                    b.ToTable("PurchaseOrderDetails");
                });

            modelBuilder.Entity("MyWebAPI.Models.ReturnToSupplier", b =>
                {
                    b.Property<int>("ReturnID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ReturnID"));

                    b.Property<string>("ProcessedBy")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<int>("ProductID")
                        .HasColumnType("int");

                    b.Property<string>("PurchaseOrderID")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTime>("ReturnDate")
                        .HasColumnType("datetime2");

                    b.Property<decimal>("ReturnQuantity")
                        .HasPrecision(18, 2)
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("ReturnReason")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.HasKey("ReturnID");

                    b.HasIndex("ProductID");

                    b.HasIndex("PurchaseOrderID");

                    b.ToTable("ReturnsToSupplier");
                });

            modelBuilder.Entity("MyWebAPI.Models.Supplier", b =>
                {
                    b.Property<int>("SupplierID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("SupplierID"));

                    b.Property<string>("Address")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("nvarchar(200)");

                    b.Property<string>("ContactPerson")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<int?>("DeliveryTime")
                        .HasColumnType("int");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("ImageUrl")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PaymentTerms")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("nvarchar(200)");

                    b.Property<string>("Phone")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.Property<int?>("Rating")
                        .HasColumnType("int");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.Property<string>("SupplierName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.HasKey("SupplierID");

                    b.ToTable("Suppliers");
                });

            modelBuilder.Entity("MyWebAPI.Models.ApprovalLog", b =>
                {
                    b.HasOne("MyWebAPI.Models.PurchaseOrder", "PurchaseOrder")
                        .WithMany("ApprovalLogs")
                        .HasForeignKey("PurchaseOrderID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PurchaseOrder");
                });

            modelBuilder.Entity("MyWebAPI.Models.GoodsReceived", b =>
                {
                    b.HasOne("MyWebAPI.Models.PurchaseOrder", "PurchaseOrder")
                        .WithMany("GoodsReceived")
                        .HasForeignKey("PurchaseOrderID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PurchaseOrder");
                });

            modelBuilder.Entity("MyWebAPI.Models.Invoice", b =>
                {
                    b.HasOne("MyWebAPI.Models.PurchaseOrder", "PurchaseOrder")
                        .WithMany("Invoices")
                        .HasForeignKey("PurchaseOrderID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PurchaseOrder");
                });

            modelBuilder.Entity("MyWebAPI.Models.Payment", b =>
                {
                    b.HasOne("MyWebAPI.Models.Invoice", "Invoice")
                        .WithMany("Payments")
                        .HasForeignKey("InvoiceID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Invoice");
                });

            modelBuilder.Entity("MyWebAPI.Models.Product", b =>
                {
                    b.HasOne("MyWebAPI.Models.Category", "Category")
                        .WithMany("Products")
                        .HasForeignKey("CategoryID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MyWebAPI.Models.Supplier", "Supplier")
                        .WithMany("Products")
                        .HasForeignKey("SupplierID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Category");

                    b.Navigation("Supplier");
                });

            modelBuilder.Entity("MyWebAPI.Models.PurchaseOrder", b =>
                {
                    b.HasOne("MyWebAPI.Models.Supplier", "Supplier")
                        .WithMany("PurchaseOrders")
                        .HasForeignKey("SupplierID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Supplier");
                });

            modelBuilder.Entity("MyWebAPI.Models.PurchaseOrderDetail", b =>
                {
                    b.HasOne("MyWebAPI.Models.Product", "Product")
                        .WithMany("PurchaseOrderDetails")
                        .HasForeignKey("ProductID")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.HasOne("MyWebAPI.Models.PurchaseOrder", "PurchaseOrder")
                        .WithMany("PurchaseOrderDetails")
                        .HasForeignKey("PurchaseOrderID")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.Navigation("Product");

                    b.Navigation("PurchaseOrder");
                });

            modelBuilder.Entity("MyWebAPI.Models.ReturnToSupplier", b =>
                {
                    b.HasOne("MyWebAPI.Models.Product", "Product")
                        .WithMany("ReturnsToSupplier")
                        .HasForeignKey("ProductID")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.HasOne("MyWebAPI.Models.PurchaseOrder", "PurchaseOrder")
                        .WithMany("ReturnsToSupplier")
                        .HasForeignKey("PurchaseOrderID")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.Navigation("Product");

                    b.Navigation("PurchaseOrder");
                });

            modelBuilder.Entity("MyWebAPI.Models.Category", b =>
                {
                    b.Navigation("Products");
                });

            modelBuilder.Entity("MyWebAPI.Models.Invoice", b =>
                {
                    b.Navigation("Payments");
                });

            modelBuilder.Entity("MyWebAPI.Models.Product", b =>
                {
                    b.Navigation("PurchaseOrderDetails");

                    b.Navigation("ReturnsToSupplier");
                });

            modelBuilder.Entity("MyWebAPI.Models.PurchaseOrder", b =>
                {
                    b.Navigation("ApprovalLogs");

                    b.Navigation("GoodsReceived");

                    b.Navigation("Invoices");

                    b.Navigation("PurchaseOrderDetails");

                    b.Navigation("ReturnsToSupplier");
                });

            modelBuilder.Entity("MyWebAPI.Models.Supplier", b =>
                {
                    b.Navigation("Products");

                    b.Navigation("PurchaseOrders");
                });
#pragma warning restore 612, 618
        }
    }
}
