using MediatR;
using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using System.Threading;
using System;
using AutoMapper;

namespace Flowly.Application.Commands.Auth.ForgetPassword;
    public class ForgetPasswordCommandHandler : IRequestHandler<ForgetPasswordCommand, bool>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordResetTokenRepository _tokenRepository;
        private readonly IPasswordHasher _passwordHasher;

        public ForgetPasswordCommandHandler(
            IUserRepository userRepository,
            IPasswordResetTokenRepository tokenRepository,
            IPasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _tokenRepository = tokenRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<bool> Handle(ForgetPasswordCommand request, CancellationToken cancellationToken)
        {
            // Find user by email
            var user = await _userRepository.GetUserByEmailAsync(request.Email);
            if (user == null) return false;

            // Generate a secure token
            var token = Guid.NewGuid().ToString("N");
            var expiresAt = DateTime.UtcNow.AddMinutes(15);

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Token = token,
                ExpiresAt = expiresAt,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };
        

            await _tokenRepository.AddAsync(resetToken);


            return true;
        }
    }
