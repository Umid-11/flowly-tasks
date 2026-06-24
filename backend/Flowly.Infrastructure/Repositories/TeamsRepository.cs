using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using Microsoft.Extensions.Configuration;
using System.Data;
using Npgsql;
using Dapper;

namespace Flowly.Infrastructure.Repositories;

public class TeamsRepository : ITeamsRepository
{
    private readonly string _connectionString;

    public TeamsRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }
    
    private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    public async Task<int> CreateTeamAsync(Team team)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync("INSERT INTO Teams (Name, CreatedAt) VALUES (@Name, @CreatedAt)", team);
    }

    public async Task<bool> AddMemberAsync(int teamId, int userId)
    {
        using var db = CreateConnection();

         var existingMember = await db.QueryFirstOrDefaultAsync<TeamMember>(
            "SELECT * FROM TeamMembers WHERE TeamId = @TeamId AND UserId = @UserId",
            new { teamId, userId });

        if (existingMember != null)
        {
            System.Console.WriteLine("User is already a member of the team");
            return false;   
        }

        var rowsAffected = await db.ExecuteAsync(
            "INSERT INTO TeamMembers (TeamId, UserId) VALUES (@TeamId, @UserId)",
            new { teamId, userId });

        return rowsAffected > 0;

    }

    public async Task<IEnumerable<Team>> GetAllTeamsAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<Team>("SELECT * FROM Teams");
    }

    public async Task<IEnumerable<User>> GetTeamMembersAsync(int teamId)
    {
        using var db = CreateConnection();

        var sql = @"
            SELECT u.*
            FROM Users u
            INNER JOIN TeamMembers tm
                ON tm.UserId = u.Id
            WHERE tm.TeamId = @TeamId AND u.RoleId != 1";

        return await db.QueryAsync<User>(sql, new { teamId });
    }

    public async Task<bool> RemoveMemberAsync(int teamId, int userId)
    {
        using var db = CreateConnection();

        var rowsAffected = await db.ExecuteAsync(
            "DELETE FROM TeamMembers WHERE TeamId = @TeamId AND UserId = @UserId",
            new { teamId, userId });    

        return rowsAffected > 0;
    }
}