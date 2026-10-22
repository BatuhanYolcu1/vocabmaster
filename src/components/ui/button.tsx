import Link from 'next/link';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[background-color,color,box-shadow,transform,opacity] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring [&_svg]:shrink-0';

const variants = {
  primary: 'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover',
  secondary: 'border border-border bg-surface text-fg shadow-sm hover:bg-surface-2',
  soft: 'bg-primary-soft text-primary-soft-fg hover:brightness-95 dark:hover:brightness-125',
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
  danger: 'bg-danger text-white shadow-sm hover:brightness-110',
  'danger-soft': 'bg-danger-soft text-danger hover:brightness-95 dark:hover:brightness-125',
  success: 'bg-success text-white shadow-sm hover:brightness-110',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
  md: 'h-10 px-4 text-sm [&_svg]:size-4',
  lg: 'h-12 px-6 text-base [&_svg]:size-5',
  icon: 'size-9 [&_svg]:size-[18px]',
  'icon-sm': 'size-8 rounded-lg [&_svg]:size-4',
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, disabled, className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
});

export interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({ variant = 'primary', size = 'md', className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
