using MediatR;
using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Flowly.Application.Commands.Auth.ResetPassword;

    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, bool>
    {
        private readonly IPasswordResetTokenRepository _tokenRepository;
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;

        public ResetPasswordCommandHandler(
            IPasswordResetTokenRepository tokenRepository,
            IUserRepository userRepository,
            IPasswordHasher passwordHasher)
        {
            _tokenRepository = tokenRepository;
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            var resetToken = await _tokenRepository.GetByTokenAsync(request.Token);
            if (resetToken == null || resetToken.IsUsed || resetToken.ExpiresAt < DateTime.UtcNow)
                return false;

            var user = await _userRepository.GetByIdAsync(resetToken.UserId);
            if (user == null) return false;

            // Update user's password hash
            var hashed = _passwordHasher.Hash(request.NewPassword);
            user.PasswordHash = hashed;
            await _userRepository.UpdateAsync(user);

            // Mark token as used
            await _tokenRepository.MarkAsUsedAsync(request.Token);

            return true;
        }
    }
