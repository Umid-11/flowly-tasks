using System.Data;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Flowly.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Flowly.Application.DTOs;
using Flowly.Application.Commands.Users.UpdateRole;
using Flowly.Application.Commands.Users.RemoveUser;

namespace Flowly.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IDbConnection _dbConnection;
    private readonly IMediator _mediator;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IDbConnection dbConnection, IMediator mediator, ILogger<UsersController> logger)
    {
        _dbConnection = dbConnection;
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        try 
        {
            // Bağlantının vəziyyətini yoxlayırıq
            if (_dbConnection.State == ConnectionState.Closed)
            {
                _dbConnection.Open();
            }

            var sql = "SELECT * FROM users WHERE IsActive = true";
            var users = await _dbConnection.QueryAsync<Flowly.Domain.Entities.User>(sql);

            _logger.LogInformation("Users count: {Count}", users.Count());
            
            return Ok(users);
        }
        catch (Exception ex)
        {
            // Xəta olarsa, xətanın mesajını qaytarırıq ki, problemi görə biləsiniz
            return StatusCode(500, $"Database Error: {ex.Message}");
        }
    }

    [HttpGet("check-connection")]
    public IActionResult CheckConnection()
    {
        try
        {
            if (_dbConnection.State == ConnectionState.Closed)
                _dbConnection.Open();
                
            return Ok(new { status = "Success", message = "Database connection is working!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { status = "Error", message = ex.Message });
        }
     }

    [Authorize(Roles = "SuperAdmin")]
    [HttpPut("update-role")]
    public async Task<IActionResult> UpdateRole([FromBody] UpdateUserRoleDto dto)
    {
        var command = new UpdateUserRoleCommand
        {
            UserId = dto.UserId,
            RoleId = dto.RoleId
        };

        var result = await _mediator.Send(command);

        if (result)
            return Ok(new { message = "İstifadəçinin rolu uğurla yeniləndi." });

        return BadRequest(new { message = "Rol yenilənərkən xəta baş verdi (İstifadəçi tapılmaya bilər)." });
    }

    [Authorize(Roles="SuperAdmin,Admin")]
    [HttpDelete("remove-user/{userId}")]
    public async Task<IActionResult> RemoveUser(int userId)
    {
        _logger.LogInformation("Received RemoveUser request for user:");
        var command = new RemoveUserCommand
        {
            UserId = userId
        };

        var result = await _mediator.Send(command);

        if (result){
            _logger.LogInformation("İstifadəçi uğurla silindi.");
            return Ok(new { message = "İstifadəçi uğurla silindi." });
        }

        _logger.LogWarning("İstifadəçi silinərkən xəta baş verdi (İstifadəçi tapılmaya bilər).");
        return BadRequest(new { message = "İstifadəçi silinərkən xəta baş verdi (İstifadəçi tapılmaya bilər)." });
    }
}


