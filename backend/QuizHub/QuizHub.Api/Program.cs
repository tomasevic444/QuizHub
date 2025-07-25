using Microsoft.EntityFrameworkCore;
using QuizHub.Application.Services;
using QuizHub.Infrastructure.Data;
using QuizHub.Infrastructure.Services;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// 1. Configure DbContext with SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Register application services for Dependency Injection
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Add CORS policy (we configured this in the setup)
var corsPolicyName = "AllowQuizHubClient";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:5173")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// --- Build the app ---
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    await DataSeeder.SeedAsync(context);
}

// --- Configure the HTTP request pipeline. ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 4. Use CORS
app.UseCors(corsPolicyName);

app.UseAuthorization();
app.MapControllers();

app.Run();