import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils/utils';

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', loading = false, onClick, disabled, children, ...props }, ref) => {
    const [internalLoading, setInternalLoading] = React.useState(false);

    const isLoading = loading || internalLoading;

    const variants = {
      default: 'bg-[#981B1F] text-white hover:bg-[#C3662D] rounded-lg shadow-sm',
      secondary: 'border border-[#C3662D] text-[#C3662D] hover:bg-[#C3662D] hover:text-white bg-transparent font-semibold rounded-lg shadow-sm',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 rounded-lg',
      ghost: 'hover:bg-gray-100 hover:text-gray-900 rounded-lg',
      destructive: 'bg-red-500 text-white hover:bg-red-500/80 rounded-lg',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      lg: 'h-11 px-8',
    };

    const handleClick = async (event) => {
      if (!onClick || isLoading) {
        return;
      }

      const result = onClick(event);
      if (result && typeof result.then === 'function') {
        try {
          setInternalLoading(true);
          await result;
        } finally {
          setInternalLoading(false);
        }
      }
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        ref={ref}
        onClick={handleClick}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
