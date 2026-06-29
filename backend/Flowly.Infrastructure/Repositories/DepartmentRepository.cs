using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using Npgsql;
using Dapper;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Threading.Tasks;



namespace Flowly.Infrastructure.Repositories;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly string _connectionString;

    public DepartmentRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")!;
    }

    private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    public async Task<int> CreateDepartmentAsync(Department department)
    {
        using var db = CreateConnection();
        var existing = await db.QueryFirstOrDefaultAsync<Department>("SELECT * FROM Departments WHERE Name = @Name", new {department.Name });
        if (existing != null) throw new Exception("Department artıq mövcuddur");

        var sql = "INSERT INTO Departments (Name) VALUES (@Name) RETURNING Id";
        return await db.ExecuteScalarAsync<int>(sql, department);
    }

    public async Task<bool> DeleteDepartmentAsync(int id)
    {
        using var db = CreateConnection();
        var sql = "DELETE FROM Departments WHERE Id = @Id";
        return await db.ExecuteAsync(sql, new { Id = id }) > 0;
    }

    public async Task<IEnumerable<Department>> GetAllDepartmentsAsync()
    {
        using var db = CreateConnection();
        var sql = "SELECT * FROM Departments";
        return await db.QueryAsync<Department>(sql);
    }

    public async Task<Department?> GetDepartmentByIdAsync(int id)
    {
        using var db = CreateConnection();
        var sql = "SELECT * FROM Departments WHERE Id = @Id";
        return await db.QueryFirstOrDefaultAsync<Department>(sql, new { Id = id });
    }

    public async Task<bool> UpdateDepartmentAsync(Department department)
    {
        using var db = CreateConnection();
        var sql = "UPDATE Departments SET Name = @Name WHERE Id = @Id";
        return await db.ExecuteAsync(sql, department) > 0;
    }
}