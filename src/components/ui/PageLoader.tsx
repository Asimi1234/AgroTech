import { Spinner } from './Spinner';

export const PageLoader = () => (
  <div className="flex min-h-[70vh] items-center justify-center text-brand-700">
    <Spinner className="h-8 w-8" />
  </div>
);
