import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const AppLayout = () => (
  <div className="flex min-h-screen flex-col bg-earth-50">
    <Header />
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-10">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </main>
    <BottomNav />
  </div>
);
