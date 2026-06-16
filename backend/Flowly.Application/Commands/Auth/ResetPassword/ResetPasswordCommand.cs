using MediatR;
namespace Flowly.Application.Commands.Auth.ResetPassword;

// Reset password command
public class ResetPasswordCommand : IRequest<bool>
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}