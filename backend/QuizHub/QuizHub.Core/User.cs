// QuizHub.Core/Entities/User.cs
namespace QuizHub.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // Default role
    public string? ProfileImageUrl { get; set; } // Nullable, as it's optional
}