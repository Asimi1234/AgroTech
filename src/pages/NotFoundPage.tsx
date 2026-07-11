import { Link } from 'react-router-dom';
import { buttonClass } from '@/components/ui/Button';

export const NotFoundPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="text-5xl font-extrabold text-brand-700">404</p>
    <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
    <p className="mt-1 max-w-sm text-slate-600">
      The page you are looking for does not exist or has been moved.
    </p>
    <Link to="/dashboard" className={`${buttonClass('primary', 'md')} mt-6`}>
      Back to dashboard
    </Link>
  </div>
);

export default NotFoundPage;
