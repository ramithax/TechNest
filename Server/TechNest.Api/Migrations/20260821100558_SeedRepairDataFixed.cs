using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TechNest.Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedRepairDataFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "RepairServices",
                columns: new[] { "Id", "BasePrice", "Description", "EstimatedHours", "ServiceName" },
                values: new object[,]
                {
                    { 1, 150.00m, "Full display assembly replacement", 2, "Screen Replacement" },
                    { 2, 80.00m, "New OEM battery installation", 1, "Battery Replacement" },
                    { 3, 50.00m, "Motherboard cleaning and testing", 3, "Water Damage Diagnostics" }
                });

            migrationBuilder.InsertData(
                table: "Repairs",
                columns: new[] { "Id", "AiDiagnosticReport", "CreatedAt", "CustomerId", "DeviceModel", "EstimatedCost", "IssueDescription", "RepairServiceId", "Status", "TechnicianId", "UpdatedAt" },
                values: new object[] { 1, null, new DateTime(2026, 8, 20, 10, 0, 0, 0, DateTimeKind.Utc), "CUST-001", "iPhone 13 Pro", 0m, "Screen is completely shattered and touch is not responding.", null, 0, null, new DateTime(2026, 8, 20, 10, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "Technicians",
                columns: new[] { "Id", "Email", "FullName", "IsAvailable", "Specialization" },
                values: new object[,]
                {
                    { 1, "alex@technest.com", "Alex Fixer", true, "Hardware" },
                    { 2, "sam@technest.com", "Sam Coder", false, "Software" }
                });

            migrationBuilder.InsertData(
                table: "Repairs",
                columns: new[] { "Id", "AiDiagnosticReport", "CreatedAt", "CustomerId", "DeviceModel", "EstimatedCost", "IssueDescription", "RepairServiceId", "Status", "TechnicianId", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, "Based on the description, the battery has degraded beyond its usable cycle count. Recommend 'Battery Replacement' service.", new DateTime(2026, 8, 19, 10, 0, 0, 0, DateTimeKind.Utc), "CUST-002", "MacBook Pro M1", 80.00m, "Battery drains from 100% to 0% in about 30 minutes.", 2, 2, null, new DateTime(2026, 8, 20, 10, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, null, new DateTime(2026, 8, 18, 10, 0, 0, 0, DateTimeKind.Utc), "CUST-003", "Samsung Galaxy S22", 50.00m, "Dropped in the pool, will not turn on.", 3, 3, 1, new DateTime(2026, 8, 20, 10, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "RepairServices",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Repairs",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Repairs",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Repairs",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Technicians",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "RepairServices",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "RepairServices",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Technicians",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
