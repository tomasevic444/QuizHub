// src/App.tsx
import { Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/layout/Layout'; 
import { useAuth } from './context/AuthContext';
import { Button } from './components/ui/button';

// A simple component for the home page.
function HomePage() {
  const { user } = useAuth(); 

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      {user ? (
        <p className="text-muted-foreground">
          Welcome back, {user.username}! Select a quiz to get started.
        </p>
      ) : (
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            Please login or register to start your quiz journey.
          </p>
          <Button asChild>
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      )}
      {/* Quiz list will go here later */}
    </div>
  );
}


function App() {

  return (

    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<h2>404: Page Not Found</h2>} />
      </Routes>
    </Layout>
  );
}

export default App;