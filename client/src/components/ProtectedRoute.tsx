import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'provider' | 'customer';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If admin required but user isn't admin, redirect
    if (requiredRole === 'admin' && user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    if (requiredRole === 'provider' && user.role !== 'provider' && user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
