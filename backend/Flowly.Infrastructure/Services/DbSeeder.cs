using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Flowly.Infrastructure.Services;

public static class DbSeeder
{
    public static async Task SeedSuperAdminAsync(IServiceProvider serviceProvider)
    {
        // Scoped servislərə çatmaq üçün müvəqqəti bir scope yaradılır
        using var scope = serviceProvider.CreateScope();

        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var passwordHasher  = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var config          = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger          = scope.ServiceProvider.GetRequiredService<ILogger<object>>();

        // RefreshTokens cədvəlini yaradırıq (əgər yoxdursa)
        await EnsureRefreshTokensTableAsync(config, logger);

        // appsettings.json-dan SuperAdmin məlumatlarını oxuyuruq
        var email     = config["SuperAdminSettings:Email"]!;
        var userName  = config["SuperAdminSettings:UserName"]!;
        var firstName = config["SuperAdminSettings:FirstName"]!;
        var lastName  = config["SuperAdminSettings:LastName"]!;
        var password  = config["SuperAdminSettings:Password"]!;

        // Həmin e-mail ilə istifadəçi artıq bazada varmı?
        var existingUser = await userRepository.GetUserByEmailAsync(email);

        if (existingUser is not null)
        {
            logger.LogInformation("SuperAdmin artıq mövcuddur: {Email}", email);
            return; // Varsa, heç nə etmirik
        }

        // Yoxdursa, yaradırıq
        var superAdmin = new User
        {
            FirstName    = firstName,
            LastName     = lastName,
            UserName     = userName,
            Email        = email,
            PasswordHash = passwordHasher.Hash(password),
            RoleId       = 1, // 1 = SuperAdmin (database_schema.txt-dəki INSERT-ə uyğun)
            IsActive     = true,
            CreatedAt    = DateTime.UtcNow,
            UpdatedAt    = DateTime.UtcNow
        };

        var created = await userRepository.AddUserAsync(superAdmin);

        if (created)
            logger.LogInformation("SuperAdmin uğurla yaradıldı: {Email}", email);
        else
            logger.LogError("SuperAdmin yaradılarkən xəta baş verdi!");
    }

    private static async Task EnsureRefreshTokensTableAsync(IConfiguration config, ILogger logger)
    {
        var connectionString = config.GetConnectionString("DefaultConnection")!;
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        var sql = @"
            CREATE TABLE IF NOT EXISTS RefreshTokens (
                Id SERIAL PRIMARY KEY,
                UserId INT NOT NULL,
                Token TEXT NOT NULL,
                Expires TIMESTAMP WITH TIME ZONE NOT NULL,
                CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                IsRevoked BOOLEAN DEFAULT FALSE,
                CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
            );";

        await using var cmd = new NpgsqlCommand(sql, connection);
        await cmd.ExecuteNonQueryAsync();

        logger.LogInformation("RefreshTokens cədvəli yoxlanıldı/yaradıldı.");
    }
}

