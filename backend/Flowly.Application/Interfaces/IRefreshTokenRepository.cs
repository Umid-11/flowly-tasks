using Flowly.Domain.Entities;

namespace Flowly.Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task<bool> AddRefreshTokenAsync(RefreshToken refreshToken);
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<bool> RevokeTokenAsync(string token);
}
