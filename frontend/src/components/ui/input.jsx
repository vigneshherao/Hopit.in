import * as React from 'react';
import { cn } from '@/utils/cn.js';

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-11 w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-emerald-400 focus-visible:ring-4 focus-visible:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    ref={ref}
    {...props}
  />
));

Input.displayName = 'Input';

export { Input };
