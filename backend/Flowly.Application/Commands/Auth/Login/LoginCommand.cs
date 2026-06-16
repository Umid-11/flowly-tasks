using Flowly.Application.DTOs;
using MediatR;

namespace Flowly.Application.Commands.Auth.Login;

public class LoginCommand : IRequest<AuthResponseDto>
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
