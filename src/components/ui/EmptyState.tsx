import type { ReactNode } from 'react';

export const EmptyState = ({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) => (
  <div className="rounded-xl border border-dashed border-earth-300 bg-white p-8 text-center">
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <p className="mx-auto mt-1 max-w-sm text-slate-600">{message}</p>
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);
