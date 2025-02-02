import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, hasPermission } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
