// src/components/AdminRoute.tsx
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminRoute = () => {
  const { user } = useAuth();
  
  // The proper, secure check
  if (user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};