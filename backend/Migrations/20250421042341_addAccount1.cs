using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class addAccount1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Accounts",
                newName: "UpdatedDate");

            migrationBuilder.RenameColumn(
                name: "FullName",
                table: "Accounts",
                newName: "Username");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Accounts",
                newName: "LastLoginDate");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Accounts",
                newName: "AccountID");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreateDate",
                table: "Accounts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreateDate",
                table: "Accounts");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "Accounts",
                newName: "FullName");

            migrationBuilder.RenameColumn(
                name: "UpdatedDate",
                table: "Accounts",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LastLoginDate",
                table: "Accounts",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "AccountID",
                table: "Accounts",
                newName: "Id");
        }
    }
}
