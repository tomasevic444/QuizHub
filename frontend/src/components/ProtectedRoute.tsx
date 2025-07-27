import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const { user } = useAuth();
  
  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Render the child route component (e.g., MyResultsPage)
};