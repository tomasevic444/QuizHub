// QuizHub.Infrastructure/Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using QuizHub.Core.Entities;

namespace QuizHub.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Quiz> Quizzes { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Option> Options { get; set; }
    public DbSet<QuizAttempt> QuizAttempts { get; set; } 
    public DbSet<UserAnswer> UserAnswers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure unique constraints for the User table
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Configure unique constraint for the Category table
        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Name)
            .IsUnique();

        // --- THIS IS THE FIX for the cascade path error ---
        // Manually configure the relationship between Question and UserAnswer
        modelBuilder.Entity<UserAnswer>()
            .HasOne(ua => ua.Question) // A UserAnswer has one Question
            .WithMany() // A Question can be related to many UserAnswers
            .HasForeignKey(ua => ua.QuestionId) // The foreign key is QuestionId
            .OnDelete(DeleteBehavior.Restrict); // Tell SQL Server NOT to cascade delete.
    }
}