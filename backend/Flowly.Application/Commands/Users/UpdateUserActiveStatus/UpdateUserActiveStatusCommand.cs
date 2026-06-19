using MediatR;

namespace Flowly.Application.Commands.Users.UpdateUserActiveStatus;

public class UpdateUserActiveStatusCommand : IRequest<bool>
{
    public int UserId { get; set; }
    public bool IsActive { get; set; }
}
