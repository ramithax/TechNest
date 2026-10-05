using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechNest.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAdminNotesFromOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminNotes",
                table: "Orders");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminNotes",
                table: "Orders",
                type: "text",
                nullable: true);
        }
    }
}
