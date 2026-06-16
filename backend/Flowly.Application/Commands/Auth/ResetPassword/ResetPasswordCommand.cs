using MediatR;
using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
namespace Flowly.Application.Commands.Auth.ResetPassword;

// Reset password command
public class ResetPasswordCommand : IRequest<bool>
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}