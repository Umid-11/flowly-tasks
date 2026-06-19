using Flowly.Application.Interfaces;
using MediatR;

namespace Flowly.Application.Commands.Users.UpdateUserActiveStatus;

public class UpdateUserActiveStatusCommandHandler : IRequestHandler<UpdateUserActiveStatusCommand, bool>
{
    private readonly IUserRepository _userRepository;

    public UpdateUserActiveStatusCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<bool> Handle(UpdateUserActiveStatusCommand request, CancellationToken cancellationToken)
    {
        return await _userRepository.UpdateUserActiveStatusAsync(request.UserId, request.IsActive);
    }
}
