// QuizHub.Api/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using QuizHub.Application.DTOs;
using QuizHub.Application.Services;

namespace QuizHub.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(UserRegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);
        if (!result)
        {
            return BadRequest("User with this email or username already exists.");
        }
        return Ok(new { Message = "User registered successfully." });
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(UserLoginDto loginDto)
    {
        var authResponse = await _authService.LoginAsync(loginDto);
        if (authResponse == null)
        {
            return Unauthorized("Invalid credentials.");
        }
        return Ok(authResponse);
    }
}