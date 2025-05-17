using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class addAccount5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReturnsToSupplier_Products_ProductID",
                table: "ReturnsToSupplier");

            migrationBuilder.DropForeignKey(
                name: "FK_ReturnsToSupplier_PurchaseOrders_PurchaseOrderID",
                table: "ReturnsToSupplier");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ReturnsToSupplier",
                table: "ReturnsToSupplier");

            migrationBuilder.RenameTable(
                name: "ReturnsToSupplier",
                newName: "ReturnToSupplier");

            migrationBuilder.RenameIndex(
                name: "IX_ReturnsToSupplier_PurchaseOrderID",
                table: "ReturnToSupplier",
                newName: "IX_ReturnToSupplier_PurchaseOrderID");

            migrationBuilder.RenameIndex(
                name: "IX_ReturnsToSupplier_ProductID",
                table: "ReturnToSupplier",
                newName: "IX_ReturnToSupplier_ProductID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ReturnToSupplier",
                table: "ReturnToSupplier",
                column: "ReturnID");

            migrationBuilder.AddForeignKey(
                name: "FK_ReturnToSupplier_Products_ProductID",
                table: "ReturnToSupplier",
                column: "ProductID",
                principalTable: "Products",
                principalColumn: "ProductID");

            migrationBuilder.AddForeignKey(
                name: "FK_ReturnToSupplier_PurchaseOrders_PurchaseOrderID",
                table: "ReturnToSupplier",
                column: "PurchaseOrderID",
                principalTable: "PurchaseOrders",
                principalColumn: "PurchaseOrderID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReturnToSupplier_Products_ProductID",
                table: "ReturnToSupplier");

            migrationBuilder.DropForeignKey(
                name: "FK_ReturnToSupplier_PurchaseOrders_PurchaseOrderID",
                table: "ReturnToSupplier");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ReturnToSupplier",
                table: "ReturnToSupplier");

            migrationBuilder.RenameTable(
                name: "ReturnToSupplier",
                newName: "ReturnsToSupplier");

            migrationBuilder.RenameIndex(
                name: "IX_ReturnToSupplier_PurchaseOrderID",
                table: "ReturnsToSupplier",
                newName: "IX_ReturnsToSupplier_PurchaseOrderID");

            migrationBuilder.RenameIndex(
                name: "IX_ReturnToSupplier_ProductID",
                table: "ReturnsToSupplier",
                newName: "IX_ReturnsToSupplier_ProductID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ReturnsToSupplier",
                table: "ReturnsToSupplier",
                column: "ReturnID");

            migrationBuilder.AddForeignKey(
                name: "FK_ReturnsToSupplier_Products_ProductID",
                table: "ReturnsToSupplier",
                column: "ProductID",
                principalTable: "Products",
                principalColumn: "ProductID");

            migrationBuilder.AddForeignKey(
                name: "FK_ReturnsToSupplier_PurchaseOrders_PurchaseOrderID",
                table: "ReturnsToSupplier",
                column: "PurchaseOrderID",
                principalTable: "PurchaseOrders",
                principalColumn: "PurchaseOrderID");
        }
    }
}
