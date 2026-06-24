using Flowly.Domain.Entities;

namespace Flowly.Application.Interfaces;

public interface ITeamsRepository
{
    Task<int> CreateTeamAsync(Team team);
    Task<bool> AddMemberAsync(int teamId, int userId);
    Task<IEnumerable<Team>> GetAllTeamsAsync();
    Task<IEnumerable<User>> GetTeamMembersAsync(int teamId);
    Task<bool> RemoveMemberAsync(int teamId, int userId);
}
