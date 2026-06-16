using Flowly.Application.DTOs;
using Flowly.Application.Interfaces;
using MediatR;

namespace Flowly.Application.Commands.Auth.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(
        IRefreshTokenRepository refreshTokenRepository,
        IUserRepository userRepository,
        ITokenService tokenService)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        // 1. Verilən refresh token-i DB-dən tapırıq
        var storedToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);
        if (storedToken == null)
        {
            throw new Exception("Refresh token tapılmadı");
        }

        // 2. Token revoke olunub yoxsa expires olub yoxlayırıq
        if (storedToken.IsRevoked)
        {
            throw new Exception("Refresh token artıq ləğv edilib");
        }

        if (storedToken.Expires < DateTime.UtcNow)
        {
            throw new Exception("Refresh token-in müddəti bitib");
        }

        // 3. İstifadəçini tapırıq
        var user = await _userRepository.GetUserByIdAsync(storedToken.UserId);
        if (user == null)
        {
            throw new Exception("İstifadəçi tapılmadı");
        }

        // 4. Köhnə token-i revoke edirik
        await _refreshTokenRepository.RevokeTokenAsync(request.RefreshToken);

        // 5. Yeni access token və refresh token yaradırıq
        var newAccessToken = _tokenService.GenerateToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken(user);

        // 6. Yeni refresh token-i DB-yə yazırıq
        var refreshTokenEntity = new Domain.Entities.RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshToken,
            Expires = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            IsRevoked = false
        };
        await _refreshTokenRepository.AddRefreshTokenAsync(refreshTokenEntity);

        // 7. Cavabı qaytarırıq
        return new AuthResponseDto
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken,
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
    }
}
