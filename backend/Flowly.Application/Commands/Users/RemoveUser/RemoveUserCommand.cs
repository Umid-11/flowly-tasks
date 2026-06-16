using MediatR;


namespace Flowly.Application.Commands.Users.RemoveUser;

public class RemoveUserCommand : IRequest<bool>
{
    public int UserId { get; set; }
}

