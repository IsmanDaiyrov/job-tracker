import { type SelectHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={clsx(
        'w-full rounded-[10px] border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = 'Select'
