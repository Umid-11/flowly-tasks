using System.Data;
using Npgsql;
using Flowly.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Frontend üçün CORS siyasəti
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:8080")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Cookie göndərmək/almaq üçün mütləqdir
        });
});

// JWT Authentication qeydiyyatı
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

builder.Services.AddAuthorization();

// Controller-ləri əlavə edirik
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// MediatR qeydiyyatı
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Flowly.Application.Interfaces.IUserRepository).Assembly));

// AutoMapper qeydiyyatı
builder.Services.AddAutoMapper(cfg => cfg.AddMaps(typeof(Flowly.Application.Mappings.MappingProfile).Assembly));

// Dapper üçün PostgreSQL IDbConnection qeydiyyatı
builder.Services.AddScoped<IDbConnection>(sp => 
    new NpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository və Servislərin qeydiyyatı
builder.Services.AddScoped<Flowly.Application.Interfaces.IUserRepository, Flowly.Infrastructure.Repositories.UserRepository>();
builder.Services.AddScoped<Flowly.Application.Interfaces.IPasswordHasher, Flowly.Infrastructure.Services.PasswordHasher>();
builder.Services.AddScoped<Flowly.Application.Interfaces.IRefreshTokenRepository, Flowly.Infrastructure.Repositories.RefreshTokenRepository>();
builder.Services.AddScoped<Flowly.Application.Interfaces.ITokenService, Flowly.Infrastructure.Services.TokenService>();
builder.Services.AddScoped<Flowly.Application.Interfaces.IPasswordResetTokenRepository, Flowly.Infrastructure.Repositories.PasswordResetTokenRepository>();

// Logging əlavə edirik (DbSeeder üçün lazımdır)
builder.Services.AddLogging();

// Dapper-in snake_case sütunları PascalCase modellərə tanıması üçün
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

var app = builder.Build();

// ============================================================
// Tətbiq işə düşəndə SuperAdmin-in olub-olmadığını yoxlayır,
// yoxdursa avtomatik olaraq yaradır.
// ============================================================
await DbSeeder.SeedSuperAdminAsync(app.Services);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// CORS-u aktivləşdiririk
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Controller-ləri xəritələndiririk (Routing)
app.MapControllers();

app.Run();
