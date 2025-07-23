var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var corsPolicyName = "AllowQuizHubClient";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName,
                      policy =>
                      {
                          // React app runs on http://localhost:5173
                          policy.WithOrigins("http://localhost:5173")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors(corsPolicyName); 

app.UseAuthorization();
app.MapControllers();
app.Run();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
