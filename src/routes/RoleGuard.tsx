import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../stores/authStore';

interface RoleGuardProps {
  allowedRoles: UserRole[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
