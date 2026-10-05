using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

using TechNest.Api.Data;
using TechNest.Api.Services;
using TechNest.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

var jwtToken = builder.Configuration["AppSettings:Token"];

Console.WriteLine(
    $"JWT configured: {!string.IsNullOrWhiteSpace(jwtToken)}, Length: {jwtToken?.Length ?? 0}"
);

Console.WriteLine(
    $"ENV JWT Length: {Environment.GetEnvironmentVariable("AppSettings__Token")?.Length ?? 0}"
);

Console.WriteLine(
    $"CONFIG JWT Length: {builder.Configuration["AppSettings:Token"]?.Length ?? 0}"
);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter()
        );
    });

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference(
                "Bearer",
                document
            )] = []
        });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// Services
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IPcBuildService, PcBuildService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IRepairService, RepairService>();

builder.Services.AddScoped<
    IPcBuildRequestService,
    PcBuildRequestService
>();

// Python Agent
builder.Services.AddHttpClient<IAgentAIService, AgentAIClient>(
    client =>
    {
        client.BaseAddress = new Uri(
            builder.Configuration["AgentAI:BaseUrl"]!
        );

        client.Timeout = TimeSpan.FromMinutes(4);
    }
);

builder.Services.AddScoped<IAgentWorkflowService, AgentWorkflowService>();

// JWT Authentication
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer =
                    builder.Configuration[
                        "AppSettings:Issuer"
                    ],

                ValidateAudience = true,
                ValidAudience =
                    builder.Configuration[
                        "AppSettings:Audience"
                    ],

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,
                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            builder.Configuration[
                                "AppSettings:Token"
                            ]!
                        )
                    ),

                RoleClaimType = ClaimTypes.Role,
                NameClaimType = ClaimTypes.Name
            };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "DevelopmentCors",
        policy =>
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("DevelopmentCors");

// Temporarily disabled for Flutter Web local development
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();