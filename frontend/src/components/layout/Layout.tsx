// src/components/layout/Layout.tsx
import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 px-8 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">
            QuizHub
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
  <>
    <Link to="/my-results" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
      My Results
    </Link>
    <span className="text-sm font-medium">
      Welcome, {user.username}!
    </span>
    <Button variant="ghost" onClick={handleLogout}>Logout</Button>
  </>
) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full py-8 px-4 md:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;