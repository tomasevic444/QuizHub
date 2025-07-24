using System.ComponentModel.DataAnnotations;

namespace QuizHub.Application.DTOs;

public record UserLoginDto(
    [Required] string LoginIdentifier,
    [Required] string Password
);