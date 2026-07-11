import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/ui/PageLoader';
import { useAuthStore } from '@/store/authStore';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const FarmerDashboard = lazy(() => import('@/pages/FarmerDashboard'));
const SupplierDashboard = lazy(() => import('@/pages/SupplierDashboard'));
const MarketplacePage = lazy(() => import('@/pages/MarketplacePage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const GroupsPage = lazy(() => import('@/pages/GroupsPage'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/** Suppliers get their own dashboard; farmers and admins get the farmer view. */
const DashboardRoute = () => {
  const role = useAuthStore((s) => s.user?.role);
  return role === 'supplier' ? <SupplierDashboard /> : <FarmerDashboard />;
};

export const App = () => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default App;
