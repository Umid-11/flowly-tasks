using MediatR;
using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Flowly.Application.Commands.Auth.ForgetPassword;

public class ForgetPasswordCommand : IRequest<bool>
{
    public string Email { get; set; } = string.Empty;
}








