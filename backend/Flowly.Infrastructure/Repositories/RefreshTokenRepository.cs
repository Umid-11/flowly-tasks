using Dapper;
using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System.Data;

namespace Flowly.Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly string _connectionString;

    public RefreshTokenRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    public async Task<bool> AddRefreshTokenAsync(RefreshToken refreshToken)
    {
        using var db = CreateConnection();
        var sql = @"INSERT INTO RefreshTokens (UserId, Token, Expires, CreatedAt, IsRevoked) 
                    VALUES (@UserId, @Token, @Expires, @CreatedAt, @IsRevoked)";
        var rowsAffected = await db.ExecuteAsync(sql, refreshToken);
        return rowsAffected > 0;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        using var db = CreateConnection();
        return await db.QueryFirstOrDefaultAsync<RefreshToken>(
            "SELECT * FROM RefreshTokens WHERE Token = @Token", new { Token = token });
    }

    public async Task<bool> RevokeTokenAsync(string token)
    {
        using var db = CreateConnection();
        var rowsAffected = await db.ExecuteAsync(
            "UPDATE RefreshTokens SET IsRevoked = TRUE WHERE Token = @Token",
            new { Token = token });
        return rowsAffected > 0;
    }
}
