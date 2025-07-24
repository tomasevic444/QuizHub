// QuizHub.Application/Services/IAuthService.cs
using QuizHub.Application.DTOs;
using System.Threading.Tasks;

namespace QuizHub.Application.Services;

public interface IAuthService
{
    Task<bool> RegisterAsync(UserRegisterDto registerDto);
    Task<AuthResponseDto?> LoginAsync(UserLoginDto loginDto);
}