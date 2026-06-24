using MediatR;
using Flowly.Domain.Entities;

namespace Flowly.Application.Commands.Teams.CreateTeam;

public class CreateTeamCommand : IRequest<int>
{
    public string Name { get; set; } = string.Empty;
}
