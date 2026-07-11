import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700',
  secondary: 'bg-earth-200 text-earth-900 hover:bg-earth-300 active:bg-earth-400',
  outline:
    'border-2 border-brand-700 text-brand-800 bg-white hover:bg-brand-50 active:bg-brand-100',
  ghost: 'text-brand-800 hover:bg-brand-50 active:bg-brand-100',
  danger: 'bg-red-700 text-white hover:bg-red-800 active:bg-red-900',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 min-h-tap',
  md: 'text-base px-4 min-h-tap',
  lg: 'text-lg px-6 min-h-[52px]',
};

/** Shared button styling so links can be rendered as buttons without nesting. */
export const buttonClass = (
  variant: Variant = 'primary',
  size: Size = 'md',
  fullWidth = false,
): string =>
  cn(
    'focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', fullWidth, className, disabled, ...rest },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(buttonClass(variant, size, fullWidth), className)}
      {...rest}
    />
  ),
);

Button.displayName = 'Button';
