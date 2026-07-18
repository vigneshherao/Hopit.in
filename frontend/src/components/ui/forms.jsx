import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn.js';

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn('h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500', className)}
    {...props}
  />
));
Checkbox.displayName = 'Checkbox';

export const Radio = React.forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} type="radio" className={cn('h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500', className)} {...props} />
));
Radio.displayName = 'Radio';

export function Switch({ checked = false, className, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
        checked ? 'bg-emerald-600' : 'bg-slate-200',
        className,
      )}
      {...props}
    >
      <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition', checked ? 'translate-x-5' : 'translate-x-0')} />
    </button>
  );
}

export const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} type="range" className={cn('h-2 w-full accent-emerald-600', className)} {...props} />
));
Slider.displayName = 'Slider';

export function Combobox({ options = [], value, onChange, placeholder = 'Select option', className }) {
  return (
    <label className={cn('relative block', className)}>
      <input
        list="hopit-combobox-options"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
      <datalist id="hopit-combobox-options">
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </datalist>
    </label>
  );
}

export function FieldChoice({ checked, icon: Icon = Check, label, description, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md',
        checked ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-slate-200',
        className,
      )}
      {...props}
    >
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', checked ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500')}>
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-bold text-slate-950">{label}</span>
        {description ? <span className="mt-1 block text-sm leading-6 text-slate-500">{description}</span> : null}
      </span>
    </button>
  );
}
