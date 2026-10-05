using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TechNest.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPcBuildApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.CreateTable(
                name: "PcBuildRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    WorkflowId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Budget = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CustomerNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    AdminComment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PcBuildRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PcBuildRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PcBuildRequestItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PcBuildRequestId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PcBuildRequestItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PcBuildRequestItems_PcBuildRequests_PcBuildRequestId",
                        column: x => x.PcBuildRequestId,
                        principalTable: "PcBuildRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PcBuildRequestItems_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PcBuildRequestItems_PcBuildRequestId",
                table: "PcBuildRequestItems",
                column: "PcBuildRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_PcBuildRequestItems_ProductId",
                table: "PcBuildRequestItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_PcBuildRequests_UserId",
                table: "PcBuildRequests",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PcBuildRequestItems");

            migrationBuilder.DropTable(
                name: "PcBuildRequests");

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
                columns: new[] { "Id", "AiDiagnosticReport", "AppointmentDate", "CreatedAt", "CustomerId", "DeviceModel", "EstimatedCost", "ImageUrl", "IssueDescription", "RepairServiceId", "Status", "TechnicianId", "UpdatedAt" },
                values: new object[] { 1, null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 8, 20, 10, 0, 0, 0, DateTimeKind.Utc), "CUST-001", "iPhone 13 Pro", 0m, null, "Screen is completely shattered and touch is not responding.", null, 0, null, new DateTime(2026, 8, 20, 10, 0, 0, 0, DateTimeKind.Utc) });

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
                columns: new[] { "Id", "AiDiagnosticReport", "AppointmentDate", "CreatedAt", "CustomerId", "DeviceModel", "EstimatedCost", "ImageUrl", "IssueDescription", "RepairServiceId", "Status", "TechnicianId", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, "Based on the description, the battery has degraded beyond its usable cycle count. Recommend 'Battery Replacement' service.", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 8, 19, 10, 0, 0, 0, DateTimeKind.Utc), "CUST-002", "MacBook Pro M1", 80.00m, null, "Battery drains from 100% to 0% in about 30 minutes.", 2, 2, null, new DateTime(2026, 8, 20, 10, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 8, 18, 10, 0, 0, 0, DateTimeKind.Utc), "CUST-003", "Samsung Galaxy S22", 50.00m, null, "Dropped in the pool, will not turn on.", 3, 3, 1, new DateTime(2026, 8, 20, 10, 0, 0, 0, DateTimeKind.Utc) }
                });
        }
    }
}
