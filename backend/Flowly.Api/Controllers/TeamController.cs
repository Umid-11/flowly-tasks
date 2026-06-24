using MediatR;
using Microsoft.AspNetCore.Mvc;
using Flowly.Application.Commands.Teams.CreateTeam;
using Microsoft.AspNetCore.Authorization;
using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;

namespace Flowly.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITeamsRepository _teamsRepository;
    private readonly ILogger<TeamController> _logger;

    public TeamController(IMediator mediator, ITeamsRepository teamsRepository, ILogger<TeamController> logger)
    {
        _mediator = mediator;
        _teamsRepository = teamsRepository;
        _logger = logger;
    }

    [Authorize(Roles = "SuperAdmin,Admin,Manager")]
    [HttpPost("create-team")]
    public async Task<ActionResult<int>> CreateTeam(CreateTeamCommand command)
    {
        var teamId = await _mediator.Send(command);
        _logger.LogInformation("{TeamId}-li komanda yaradıldı", teamId);
        return Ok(teamId);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Team>>> GetAllTeams()
    {
        var teams = await _teamsRepository.GetAllTeamsAsync();
        return Ok(teams);
    }

    [HttpGet("{teamId}/members")]
    public async Task<ActionResult<IEnumerable<User>>> GetTeamMembers(int teamId)
    {
        var members = await _teamsRepository.GetTeamMembersAsync(teamId);
        return Ok(members);
    }

    [Authorize(Roles = "SuperAdmin,Admin,Manager")]
    [HttpPost("add-member")]
    public async Task<IActionResult> AddMember([FromBody] AddMemberDto dto)
    {
        var success = await _teamsRepository.AddMemberAsync(dto.TeamId, dto.UserId);
        if (success)
        {
            return Ok(new { message = "İstifadəçi komandaya əlavə edildi." });
        }
        return BadRequest(new { message = "İstifadəçi əlavə edilərkən xəta baş verdi (istifadəçi artıq komandada ola bilər)." });
    }

    [Authorize(Roles = "SuperAdmin,Admin,Manager")]
    [HttpPost("remove-member")]
    public async Task<IActionResult> RemoveMember([FromBody] RemoveMemberDto dto)
    {
        var success = await _teamsRepository.RemoveMemberAsync(dto.TeamId, dto.UserId);
        if (success)
        {
            return Ok(new { message = "İstifadəçi komandadan silindi." });
        }
        return BadRequest(new { message = "İstifadəçi silinərkən xəta baş verdi." });
    }
}

public class AddMemberDto
{
    public int TeamId { get; set; }
    public int UserId { get; set; }
}

public class RemoveMemberDto
{
    public int TeamId { get; set; }
    public int UserId { get; set; }
}