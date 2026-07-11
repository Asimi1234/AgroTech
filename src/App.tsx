import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/ui/PageLoader';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const FarmerDashboard = lazy(() => import('@/pages/FarmerDashboard'));
const MarketplacePage = lazy(() => import('@/pages/MarketplacePage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const GroupsPage = lazy(() => import('@/pages/GroupsPage'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

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
          <Route path="/dashboard" element={<FarmerDashboard />} />
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
