import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer';

    const variantStyles = {
      primary: 'bg-neutral-950 text-white hover:bg-neutral-800 shadow-xs dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-semibold',
      secondary: 'bg-neutral-100/80 text-neutral-800 hover:bg-neutral-200/80 border border-neutral-200/60 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:bg-neutral-700/80 dark:border-neutral-700/60',
      outline: 'border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 shadow-2xs',
      ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100/80 dark:text-neutral-400 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs dark:bg-rose-600 dark:hover:bg-rose-500 font-semibold',
    };

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-5 py-2.5 gap-2.5 h-12',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
