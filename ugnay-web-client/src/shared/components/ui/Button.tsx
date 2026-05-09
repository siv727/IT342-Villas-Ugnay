import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const variants: Record<string, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark active:scale-[0.97]',
  secondary: 'border-[1.5px] border-primary text-primary bg-transparent hover:bg-primary-light',
  accent: 'bg-accent text-white hover:bg-accent/90 active:scale-[0.97]',
  warning: 'bg-highlight text-neutral-900 hover:bg-highlight/90',
  danger: 'bg-error text-white hover:bg-error/90 active:scale-[0.97]',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg
        font-semibold tracking-wide transition-all duration-150 ease-in-out
        disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:border-0
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${variants[variant] || variants.primary}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
