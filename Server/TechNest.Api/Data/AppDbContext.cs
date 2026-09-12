using System;
using Microsoft.EntityFrameworkCore;
using TechNest.Api.Models;
using TechNest.Api.Models.PcBuilder;

namespace TechNest.Api.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<PcBuild> PcBuilds => Set<PcBuild>();
        public DbSet<BuildItem> BuildItems => Set<BuildItem>();
        public DbSet<Product> Products => Set<Product>();


    }
}