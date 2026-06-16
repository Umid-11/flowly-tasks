using Flowly.Application.Commands.Auth.Register;
using Flowly.Application.Commands.Auth.Login;
using Flowly.Application.Commands.Auth.RefreshToken;
using Flowly.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Flowly.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // Refresh token-i HttpOnly cookie olaraq response-a yazır
    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,       // JavaScript tərəfindən oxuna bilmir (XSS qorunması)
            Secure = false,        // Yerli inkişaf üçün false, istehsalatda true olmalıdır
            SameSite = SameSiteMode.Lax, // CSRF-dən qorunmaq üçün
            Expires = DateTime.UtcNow.AddDays(7)
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var command = new RegisterCommand
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            UserName = dto.Username,
            Email = dto.Email,
            Password = dto.Password
        };

        var result = await _mediator.Send(command);

        if (result)
            return Ok(new { message = "İstifadəçi uğurla yaradıldı" });

        return BadRequest(new { message = "Qeydiyyat zamanı xəta baş verdi (Email artıq mövcud ola bilər)" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var command = new LoginCommand
        {
            Username = dto.Username,
            Password = dto.Password
        };

        var result = await _mediator.Send(command);

        // Refresh token-i HttpOnly cookie-yə yazırıq
        SetRefreshTokenCookie(result.RefreshToken);

        // Refresh token-i artıq body-dən çıxarırıq
        return Ok(new
        {
            token = result.Token,
            user = result.User
        });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        // Refresh token-i body-dən yox, cookie-dən oxuyuruq
        var refreshToken = Request.Cookies["refreshToken"];

        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token tapılmadı" });
        }

        var command = new RefreshTokenCommand
        {
            RefreshToken = refreshToken
        };

        var result = await _mediator.Send(command);

        // Yeni refresh token-i yenidən cookie-yə yazırıq (token rotation)
        SetRefreshTokenCookie(result.RefreshToken);

        return Ok(new
        {
            token = result.Token,
            user = result.User
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Cookie-ni silmək üçün onu keçmiş tarixlə yenidən yazırıq
        Response.Cookies.Append("refreshToken", "", new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(-1) // Keçmiş tarix — brauzerdə cookie silinir
        });

        return Ok(new { message = "Çıxış uğurla tamamlandı" });
    }
}
