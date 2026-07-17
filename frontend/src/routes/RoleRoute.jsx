import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.jsx';

export function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user && allowedRoles.includes(user.role) ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}
