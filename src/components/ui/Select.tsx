import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, id, ...rest }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-semibold text-slate-800"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'focus-ring min-h-tap w-full appearance-none rounded-lg border-2 border-earth-200 bg-white px-3 pr-9 text-base text-slate-900',
            "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%23475569%22><path d=%22M5.5 7.5l4.5 4.5 4.5-4.5%22 stroke=%22%23475569%22 stroke-width=%221.5%22 fill=%22none%22/></svg>')] bg-[length:20px] bg-[right_0.5rem_center] bg-no-repeat",
            error && 'border-red-500',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm font-medium text-red-700">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
