# QuizHub 

## About the Project

QuizHub is a full-stack web application that allows users to take quizzes in different fields, track their results, and compete with other users through a real-time quiz arena and a global leaderboard. The application also includes a comprehensive admin panel for content management.

The project was developed as part of a university course and demonstrates the application of modern technologies and good practices in web development.

## Video Demo

A short demo video showcasing the main features of **QuizHub**, including  taking quizzes, the real-time quiz arena, leaderboard, and the admin panel.
 

https://github.com/user-attachments/assets/3891fe1a-4586-4ede-911e-5d5484d4ca03




---
---

## Technologies

- **Backend:**
  - .NET 8 (C#)
  - ASP.NET Core Web API
  - Entity Framework Core 8
  - SignalR (for real-time functionalities)
  - Microsoft SQL Server
- **Frontend:**
  - React 18 (with TypeScript)
  - Vite (as build tool)
  - Tailwind CSS & ShadCN/UI (for styling and components)
  - TanStack Query (React Query) (for server state management)
  - Axios (for HTTP requests)
- **Authentication:**
  - JWT (JSON Web Tokens)

---

## System Architecture

The application consists of four main components:

1. **Frontend Application (React):** A Single-Page Application (SPA) that runs in the user’s browser. Responsible for the user interface and interaction.  
2. **Backend API (.NET):** Serves as the central point for all business logic, data management, and authentication. Communicates with the frontend through a REST API.  
3. **Database (SQL Server):** Persistent storage for all application data, including users, quizzes, questions, and results.  
4. **SignalR Hub:** A part of the backend that enables continuous two-way communication for real-time functionalities (Live Quiz Arena).  


## Setup Instructions

To run the project locally, you need the following tools installed:
*   .NET 8 SDK
*   Node.js (verzija 18+)
*   Microsoft SQL Server (npr. Express Edition)

### 1.  Backend Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/tomasevic444/QuizHub.git
    cd QuizHub
    ```

2.  **Configure Environment File:**
    *   Open the backend solution in Visual Studio (`backend/QuizHub.sln`).
    *   Open the file `backend/QuizHub.Api/appsettings.Development.json` (or create it if it doesn’t exist).
    *   Replace the content of that file (or update it) with the following configuration:

        ```json
        {
          "ConnectionStrings": {
            "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=QuizHubDb;Trusted_Connection=True;TrustServerCertificate=True;"
          },
          "JwtSettings": {
            "Key": "THIS_IS_A_SUPER_SECRET_AND_LONG_KEY_FOR_JWT_SIGNING",
            "Issuer": "QuizHubApi",
            "Audience": "QuizHubClient",
            "DurationInMinutes": 60
          }
        }

3.  **Apply Migrations:**
    *   In Visual Studio, open the **Package Manager Console** (`Tools -> NuGet Package Manager -> Package Manager Console`).
    *   Make sure `Default project` is set to `QuizHub.Infrastructure`.
    *   Run the following command to create the database and all tables:
        ```powershell
        Update-Database
        ```

4.  **Run the Backenda:**
    *   Press `F5` or click the "Play" button in Visual Studio to run the `QuizHub.Api` project.
    *   The backend will start (most likely at `https://localhost:7035`).

### 2. Frontend Setup

1.  **Install Dependencies:**
    *   Open a new terminal and navigate to the  `frontend` Open a new terminal and navigate to the .
    *   Run the command:
        ```bash
        npm install
        ```

2.  **Configure Environment File:**
    *   In the `frontend` directory, create a new file named  `.env.local`.
    *   Add the following line to the `.env.local` ile, making sure the port matches the port your backend is running on:
        ```
        VITE_API_BASE_URL=https://localhost:7035
        ```

3.  **Run the Frontend:**
    *   In the same terminal (inside the frontend directory), run the command:
        ```bash
        npm run dev
        ```
    *   The application will start (typically on http://localhost:5173). Open this address in your browser.

### Login Credentials

After the first run, the database seeder will automatically create the following user accounts:
*   **Admin:**
    *   Username: `admin`
    *   Lozinka: `admin123`
*   **Regular User:**
    *   Username: `nikola`
    *   Password: `nikola123`
