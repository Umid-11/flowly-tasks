using Flowly.Application.DTOs;
using MediatR;

namespace Flowly.Application.Commands.Auth.RefreshToken;

public class RefreshTokenCommand : IRequest<AuthResponseDto>
{
    public string RefreshToken { get; set; } = string.Empty;
}
