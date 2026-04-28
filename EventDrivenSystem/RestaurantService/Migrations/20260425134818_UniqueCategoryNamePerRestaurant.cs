using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantService.Migrations
{
    /// <inheritdoc />
    public partial class UniqueCategoryNamePerRestaurant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FoodCategories_RestaurantId",
                table: "FoodCategories");

            migrationBuilder.CreateIndex(
                name: "IX_FoodCategories_RestaurantId_Name",
                table: "FoodCategories",
                columns: new[] { "RestaurantId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FoodCategories_RestaurantId_Name",
                table: "FoodCategories");

            migrationBuilder.CreateIndex(
                name: "IX_FoodCategories_RestaurantId",
                table: "FoodCategories",
                column: "RestaurantId");
        }
    }
}
