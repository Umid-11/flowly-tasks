using Flowly.Application.DTOs;
using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;
using MediatR;

namespace Flowly.Application.Commands.Auth.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IRefreshTokenRepository refreshTokenRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // İstifadəçini username ilə tapırıq
        var user = await _userRepository.GetUserByUsernameAsync(request.Username);
        if (user == null)
        {
            throw new Exception("Username və ya şifrə yanlışdır");
        }

        if (!user.IsActive)
        {
            throw new Exception("Hesabınız deaktiv edilib. Zəhmət olmasa administratorla əlaqə saxlayın.");
        }
        if(user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
        {
            throw new Exception("Hesabınız bloklanıb. Zəhmət olmasa administratorla əlaqə saxlayın.");
        }
        // Şifrəni yoxlayırıq
        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;

            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutEnd = DateTime.UtcNow.AddMinutes(1);
                user.FailedLoginAttempts = 0;
            }
            await _userRepository.UpdateAsync(user);
            throw new Exception("Username və ya şifrə yanlışdır");
        }

       

        // Access token və refresh token yaradırıq
        var accessToken = _tokenService.GenerateToken(user);
        var refreshTokenValue = _tokenService.GenerateRefreshToken(user);

        // Refresh token-i DB-yə yazırıq
        var refreshTokenEntity = new Domain.Entities.RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            Expires = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            IsRevoked = false
        };
        await _refreshTokenRepository.AddRefreshTokenAsync(refreshTokenEntity);

        var response = new AuthResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshTokenValue,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.UserName,
                Role = user.Role
            }
        };

        return response;
    }
}
