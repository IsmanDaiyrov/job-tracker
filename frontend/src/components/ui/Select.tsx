import { type SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={clsx(
        "w-full appearance-none rounded-[10px] border border-ink/15 bg-paper px-3 py-2 pr-9 text-sm text-ink focus:outline-none focus:border-ink/40",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    {/* Native <select> arrows sit too close to the edge and ignore padding
          (they're drawn by the browser's own UA widget layer, not by us) —
          `appearance-none` above removes it so this hand-drawn one, spaced
          the same way the DatePicker's icon is, can take its place. */}
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/55"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  </div>
));
Select.displayName = "Select";
