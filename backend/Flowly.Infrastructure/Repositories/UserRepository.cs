using Dapper;
using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System.Data;

namespace Flowly.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    public UserRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        using var db = CreateConnection();
        // Dapper matching names with underscores was set in Program.cs earlier, 
        // but here our entity names and column names match (PascalCase in Entity, PascalCase in SQL if quoted, 
        // but PostgreSQL usually uses snake_case or case-insensitive if not quoted).
        // Since we created the table with PascalCase names in the script, they should be fine or quoted.
        return await db.QueryFirstOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Email = @Email", new { Email = email });
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        using var db = CreateConnection();
        var sql = @"SELECT u.*, r.Id, r.Name, r.Description 
                    FROM Users u 
                    LEFT JOIN Roles r ON u.RoleId = r.Id 
                    WHERE u.UserName = @Username";
        var result = await db.QueryAsync<User, Role, User>(
            sql,
            (user, role) =>
            {
                user.Role = role;
                return user;
            },
            new { Username = username },
            splitOn: "Id"
        );
        return result.FirstOrDefault();
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        using var db = CreateConnection();
        var sql = @"SELECT u.*, r.Id, r.Name, r.Description 
                    FROM Users u 
                    LEFT JOIN Roles r ON u.RoleId = r.Id 
                    WHERE u.Id = @Id";
        var result = await db.QueryAsync<User, Role, User>(
            sql,
            (user, role) =>
            {
                user.Role = role;
                return user;
            },
            new { Id = id },
            splitOn: "Id"
        );
        return result.FirstOrDefault();
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        using var db = CreateConnection();
        var result = await db.QueryAsync<User>("SELECT * FROM Users");
        return result.ToList();
    }

    public async Task<bool> AddUserAsync(User user)
    {
        using var db = CreateConnection();
        var sql = @"INSERT INTO Users (FirstName, LastName, UserName, Email, PasswordHash, RoleId) 
                    VALUES (@FirstName, @LastName, @UserName, @Email, @PasswordHash, @RoleId)";
        
        var rowsAffected = await db.ExecuteAsync(sql, user);
        return rowsAffected > 0;
    }

    public async Task<bool> UpdateUserRoleAsync(int userId, int roleId)
    {
        using var db = CreateConnection();
        var rowsAffected = await db.ExecuteAsync(
            "UPDATE Users SET RoleId = @RoleId WHERE Id = @Id", 
            new { Id = userId, RoleId = roleId });
        return rowsAffected > 0;
    }
    public async Task<bool> UpdateUserAsync(User user)
    {
        using var db = CreateConnection();
        var sql = @"UPDATE Users SET 
                        FirstName = @FirstName,
                        LastName = @LastName,
                        UserName = @UserName,
                        Email = @Email,
                        PasswordHash = @PasswordHash,
                        RoleId = @RoleId,
                        IsActive = @IsActive,
                        UpdatedAt = @UpdatedAt
                    WHERE Id = @Id";
        
        var rowsAffected = await db.ExecuteAsync(sql, user);
        return rowsAffected > 0;
    }

    public async Task<bool> RemoveUserAsync(int id)
    {
        using var db = CreateConnection();
        var rowsAffected = await db.ExecuteAsync(
            "UPDATE Users SET IsActive = false, UpdatedAt = @UpdatedAt WHERE Id = @Id", 
            new { Id = id , UpdatedAt = DateTime.UtcNow});
        return rowsAffected > 0;
    }
}
