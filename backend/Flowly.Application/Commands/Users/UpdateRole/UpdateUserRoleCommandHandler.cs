using Flowly.Application.Interfaces;
using MediatR;

namespace Flowly.Application.Commands.Users.UpdateRole;

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public UpdateUserRoleCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        return await _userRepository.UpdateUserRoleAsync(request.UserId, request.RoleId);
    }
}
