import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = ({ className, children, ...rest }: CardProps) => (
  <div
    className={cn(
      'rounded-xl border border-earth-200 bg-white shadow-sm',
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...rest }: CardProps) => (
  <div className={cn('border-b border-earth-100 p-4', className)} {...rest}>
    {children}
  </div>
);

export const CardBody = ({ className, children, ...rest }: CardProps) => (
  <div className={cn('p-4', className)} {...rest}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...rest }: CardProps) => (
  <h2
    className={cn('text-lg font-bold text-slate-900', className)}
    {...rest}
  >
    {children}
  </h2>
);
