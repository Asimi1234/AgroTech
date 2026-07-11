import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

export const ProtectedRoute = ({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
