using System;
using Microsoft.EntityFrameworkCore;
using TechNest.Api.Models;

namespace TechNest.Api.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Product> Products => Set<Product>();

        // Repairs Module Tables
        public DbSet<Technician> Technicians => Set<Technician>();
        public DbSet<RepairService> RepairServices => Set<RepairService>();
        public DbSet<Repair> Repairs => Set<Repair>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Seed Repair Services 
            modelBuilder.Entity<RepairService>().HasData(
                new RepairService { Id = 1, ServiceName = "Screen Replacement", BasePrice = 150.00m, EstimatedHours = 2, Description = "Full display assembly replacement" },
                new RepairService { Id = 2, ServiceName = "Battery Replacement", BasePrice = 80.00m, EstimatedHours = 1, Description = "New OEM battery installation" },
                new RepairService { Id = 3, ServiceName = "Water Damage Diagnostics", BasePrice = 50.00m, EstimatedHours = 3, Description = "Motherboard cleaning and testing" }
            );

            // 2. Seed Technicians
            modelBuilder.Entity<Technician>().HasData(
                new Technician { Id = 1, FullName = "Alex Fixer", Email = "alex@technest.com", Specialization = "Hardware", IsAvailable = true },
                new Technician { Id = 2, FullName = "Sam Coder", Email = "sam@technest.com", Specialization = "Software", IsAvailable = false }
            );

            // 3. Seed Repair Tickets (Using hardcoded DateTimes to satisfy EF Core)
            modelBuilder.Entity<Repair>().HasData(
                new Repair
                {
                    Id = 1,
                    CustomerId = "CUST-001",
                    DeviceModel = "iPhone 13 Pro",
                    IssueDescription = "Screen is completely shattered and touch is not responding.",
                    Status = RepairStatus.Pending,
                    EstimatedCost = 0,
                    CreatedAt = new DateTime(2026, 8, 20, 10, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 8, 20, 10, 0, 0, DateTimeKind.Utc)
                },
                new Repair
                {
                    Id = 2,
                    CustomerId = "CUST-002",
                    DeviceModel = "MacBook Pro M1",
                    IssueDescription = "Battery drains from 100% to 0% in about 30 minutes.",
                    Status = RepairStatus.AwaitingApproval,
                    AiDiagnosticReport = "Based on the description, the battery has degraded beyond its usable cycle count. Recommend 'Battery Replacement' service.",
                    EstimatedCost = 80.00m,
                    RepairServiceId = 2,
                    CreatedAt = new DateTime(2026, 8, 19, 10, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 8, 20, 10, 0, 0, DateTimeKind.Utc)
                },
                new Repair
                {
                    Id = 3,
                    CustomerId = "CUST-003",
                    DeviceModel = "Samsung Galaxy S22",
                    IssueDescription = "Dropped in the pool, will not turn on.",
                    Status = RepairStatus.InProgress,
                    TechnicianId = 1,
                    RepairServiceId = 3,
                    EstimatedCost = 50.00m,
                    CreatedAt = new DateTime(2026, 8, 18, 10, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 8, 20, 10, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}