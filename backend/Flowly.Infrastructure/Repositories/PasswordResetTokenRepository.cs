using Dapper;
using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System.Data;
using System.Threading.Tasks;

namespace Flowly.Infrastructure.Repositories;

public class PasswordResetTokenRepository : IPasswordResetTokenRepository
{
    private readonly string _connectionString;

    public PasswordResetTokenRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    public async Task<PasswordResetToken?> GetByTokenAsync(string token)
    {
        using var db = CreateConnection();
        var sql = "SELECT * FROM PasswordResetTokens WHERE Token = @Token";
        return await db.QueryFirstOrDefaultAsync<PasswordResetToken>(sql, new { Token = token });
    }

    public async Task AddAsync(PasswordResetToken token)
    {
        using var db = CreateConnection();
        var sql = @"INSERT INTO PasswordResetTokens (UserId, Token, ExpiresAt, IsUsed, CreatedAt) 
                    VALUES (@UserId, @Token, @ExpiresAt, @IsUsed, @CreatedAt)";
        await db.ExecuteAsync(sql, token);
    }

    public async Task MarkAsUsedAsync(string token)
    {
        using var db = CreateConnection();
        var sql = "UPDATE PasswordResetTokens SET IsUsed = TRUE WHERE Token = @Token";
        await db.ExecuteAsync(sql, new { Token = token });
    }
}
