using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechNest.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPcBuildToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PcBuildId",
                table: "Orders",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_PcBuildId",
                table: "Orders",
                column: "PcBuildId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_PcBuilds_PcBuildId",
                table: "Orders",
                column: "PcBuildId",
                principalTable: "PcBuilds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_PcBuilds_PcBuildId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_PcBuildId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PcBuildId",
                table: "Orders");
        }
    }
}
