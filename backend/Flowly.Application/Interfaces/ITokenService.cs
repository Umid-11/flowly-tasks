using Flowly.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;

namespace Flowly.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
    string GenerateRefreshToken(User user);
    JwtSecurityToken VerifyToken(string token);
}