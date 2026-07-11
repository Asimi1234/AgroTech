import type { ReactNode } from 'react';

export const PageHeading = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
    </div>
    {action}
  </div>
);
