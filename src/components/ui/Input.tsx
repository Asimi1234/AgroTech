import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-semibold text-slate-800"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'focus-ring min-h-tap w-full rounded-lg border-2 border-earth-200 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400',
            error && 'border-red-500',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...rest}
        />
        {hint && !error && (
          <p className="mt-1 text-sm text-slate-500">{hint}</p>
        )}
        {error && <p className="mt-1 text-sm font-medium text-red-700">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
