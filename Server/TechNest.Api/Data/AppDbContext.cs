using Microsoft.EntityFrameworkCore;
using TechNest.Api.Models;

namespace TechNest.Api.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext>options) : DbContext(options)
    {
        public DbSet<Product> Products => Set<Product>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Technician> Technicians => Set<Technician>();
        public DbSet<RepairService> RepairServices => Set<RepairService>();
        public DbSet<Repair> Repairs => Set<Repair>();
    }
}
    