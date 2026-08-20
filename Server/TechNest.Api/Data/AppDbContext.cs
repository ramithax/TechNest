using Microsoft.EntityFrameworkCore;
using TechNest.Api.Models;

namespace TechNest.Api.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext>options) : DbContext(options)
    {
        public DbSet<Product> Products => Set<Product>();
    }
}
    