using Flowly.Application.Interfaces;
using MediatR;

namespace Flowly.Application.Commands.Users.RemoveUser;

public class RemoveUserCommandHandler : IRequestHandler<RemoveUserCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public RemoveUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(RemoveUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetUserByIdAsync(request.UserId);
        if (user == null) return false;

        await _userRepository.RemoveUserAsync(request.UserId);

        return true;
    }
}