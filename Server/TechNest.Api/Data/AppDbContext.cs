using System;
using Microsoft.EntityFrameworkCore;
using TechNest.Api.Models;
using TechNest.Api.Models.PcBuilder;
using TechNest.Api.Models.PcBuildRequest;

namespace TechNest.Api.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<PcBuild> PcBuilds => Set<PcBuild>();
        public DbSet<BuildItem> BuildItems => Set<BuildItem>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Repair> Repairs => Set<Repair>();
        public DbSet<RepairService> RepairServices => Set<RepairService>();
        public DbSet<Technician> Technicians => Set<Technician>();
        public DbSet<PcBuildRequest> PcBuildRequests { get; set; }
        public DbSet<PcBuildRequestItem> PcBuildRequestItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==========================================
            // PC BUILD ↔ ORDER RELATIONSHIP
            // ==========================================

            modelBuilder.Entity<Order>()
                .HasOne(o => o.PcBuild)
                .WithOne(b => b.Order)
                .HasForeignKey<Order>(o => o.PcBuildId)
                .OnDelete(DeleteBehavior.Restrict);

            // ==========================================
            // PC BUILD REQUEST
            // ==========================================

            modelBuilder.Entity<PcBuildRequest>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.WorkflowId)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(x => x.Status)
                    .HasConversion<string>()
                    .HasMaxLength(30);

                entity.Property(x => x.Budget)
                    .HasPrecision(18, 2);

                entity.Property(x => x.TotalAmount)
                    .HasPrecision(18, 2);

                entity.Property(x => x.CustomerNote)
                    .HasMaxLength(1000);

                entity.Property(x => x.AdminComment)
                    .HasMaxLength(1000);

                entity.HasOne(x => x.User)
                    .WithMany()
                    .HasForeignKey(x => x.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(x => x.Items)
                    .WithOne(x => x.PcBuildRequest)
                    .HasForeignKey(x => x.PcBuildRequestId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ==========================================
            // PC BUILD REQUEST ITEM
            // ==========================================

            modelBuilder.Entity<PcBuildRequestItem>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.Property(x => x.UnitPrice)
                    .HasPrecision(18, 2);

                entity.Property(x => x.Reason)
                    .HasMaxLength(500);

                entity.HasOne(x => x.Product)
                    .WithMany()
                    .HasForeignKey(x => x.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // SEED REPAIR SERVICES
            // ==========================================

            modelBuilder.Entity<RepairService>().HasData(
            // your existing seed...
            );

            // ...
        }
    }
}