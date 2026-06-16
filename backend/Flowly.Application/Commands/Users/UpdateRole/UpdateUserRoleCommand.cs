using MediatR;

namespace Flowly.Application.Commands.Users.UpdateRole;

public class UpdateUserRoleCommand : IRequest<bool>
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
}
