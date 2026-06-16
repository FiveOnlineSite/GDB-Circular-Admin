import * as React from 'react';
import { cn } from '../../lib/utils/utils';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({ className, type, error, errorMessage, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            isPassword ? 'pr-10' : '',
            error ? 'border-red-500 focus-visible:ring-red-500' : 'border-input focus-visible:ring-ring',
            className,
          )}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && errorMessage && (
        <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
          {errorMessage}
        </span>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };
