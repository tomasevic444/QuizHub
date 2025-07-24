using System.ComponentModel.DataAnnotations;

namespace QuizHub.Application.DTOs;

public record UserRegisterDto(
    [Required] string Username,
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password
);