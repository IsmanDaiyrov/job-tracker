import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

// Parse a "yyyy-MM-dd" string into a local Date at midnight. Deliberately not
// `new Date(str)` — the Date constructor treats a bare "yyyy-MM-dd" string as
// UTC midnight, which can silently roll back to the previous day once
// rendered in a negative-UTC-offset timezone (e.g. anywhere in the Americas).
function parseIsoDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Mirror of the above in reverse: format using local getters, not
// `toISOString()`, which converts to UTC first and has the same off-by-one-day
// risk near midnight.
function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format a Date for display in the trigger button. Uses the user's locale, so
// the month name and order of day/month/year will match their expectations.
function formatDisplay(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Used both for the prev/next nav buttons (orientation "left"/"right") and,
// separately, for the small indicator drawn next to each month/year dropdown's
// visible label (orientation "down") — these are two different shapes, not a
// left/right toggle, so each orientation needs its own path. react-day-picker's
// `Chevron` prop type also allows "up" (its own default icon uses it for a
// vertical-calendar layout we don't use), so the type below has to keep
// accepting it even though nothing in this app ever passes it — falling back
// to the "left" arrow shape is a safe default for that unreachable case.
function ChevronIcon({
  orientation,
}: {
  orientation?: "left" | "right" | "up" | "down";
}) {
  const paths: Record<"left" | "right" | "down", string> = {
    left: "M15 18l-6-6 6-6",
    right: "M9 18l6-6-6-6",
    down: "M6 9l6 6 6-6",
  };
  const d = paths[orientation === "up" ? "left" : (orientation ?? "left")];
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d={d} />
    </svg>
  );
}

const today = new Date();
// "Date applied" can't be in the future, and a job search rarely reaches back
// further than a decade — bounds the year dropdown to something actually useful
// instead of react-day-picker's default of 100 years back.
const startMonth = new Date(today.getFullYear() - 15, 0);
const endMonth = today;

export function DatePicker({
  value,
  onChange,
  id,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = parseIsoDate(value);

  // The popup used to always render below the trigger. Inside a tall form
  // (e.g. this field sitting low in the "Add application" modal), there isn't
  // always ~400px of room below before the viewport ends, so the Today/Clear
  // footer was getting clipped off-screen. Flip it above the trigger when
  // there's more room up there than down.
  function toggleOpen() {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedPopupHeight = 400;
      setPlacement(
        spaceBelow < estimatedPopupHeight && rect.top > spaceBelow
          ? "top"
          : "bottom",
      );
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        id={id}
        type="button"
        onClick={toggleOpen}
        className="flex w-full items-center justify-between gap-2 rounded-[10px] border border-ink/15 bg-paper px-3 py-2 text-left text-sm text-ink focus:outline-none focus:border-ink/40"
      >
        <span className={selected ? "" : "text-ink/40"}>
          {selected ? formatDisplay(selected) : "Select a date…"}
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="shrink-0 opacity-55"
        >
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-20 rounded-xl border border-ink/10 bg-paper p-4 ${
            placement === "top" ? "bottom-full mb-2" : "mt-2"
          }`}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(date ? formatIsoDate(date) : undefined);
              setOpen(false);
            }}
            showOutsideDays
            captionLayout="dropdown"
            navLayout="after"
            startMonth={startMonth}
            endMonth={endMonth}
            components={{ Chevron: ChevronIcon }}
            classNames={{
              months: "flex",
              // The prev-button, month_caption (dropdowns), and next-button are
              // rendered as three siblings, with the month_grid table as a
              // fourth sibling after them — there's no wrapping element around
              // just the first three. `flex-wrap` + forcing month_grid onto its
              // own line (via basis-full below) is what puts nav+dropdowns on
              // one row and the calendar grid on the next.
              month: "flex flex-wrap items-center gap-1",
              month_caption: "flex flex-1 items-center justify-center gap-1",
              dropdowns: "flex items-center gap-1",
              // The actual <select> is invisible and stacked over its own visible
              // label (below) — same "real control captures clicks, fake label
              // shows the styled text" trick react-day-picker's own CSS uses,
              // replicated by hand since we're not importing that stylesheet.
              dropdown_root: "relative inline-flex items-center",
              dropdown: "absolute inset-0 opacity-0 cursor-pointer",
              caption_label:
                "flex items-center gap-1 rounded-[7px] px-1.5 py-1 font-display text-[15px] hover:bg-ink/5",
              nav: "flex items-center",
              button_previous:
                "w-6 h-6 grid place-items-center rounded-[7px] hover:bg-ink/5 text-ink disabled:opacity-30",
              button_next:
                "w-6 h-6 grid place-items-center rounded-[7px] hover:bg-ink/5 text-ink disabled:opacity-30",
              month_grid: "border-collapse basis-full w-full mt-2",
              weekdays: "flex",
              weekday:
                "w-9 text-center text-[10.5px] font-semibold tracking-wide text-ink/40",
              week: "flex mt-0.5",
              day: "w-9 h-9 text-center text-[13px] p-0 relative",
              day_button:
                "w-9 h-9 rounded-lg hover:bg-ink/5 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink",
              selected:
                "[&>button]:bg-accent [&>button]:font-semibold [&>button]:hover:bg-accent",
              today:
                "[&>button]:after:content-[''] [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:left-1/2 [&>button]:after:-translate-x-1/2 [&>button]:after:w-[3px] [&>button]:after:h-[3px] [&>button]:after:rounded-full [&>button]:after:bg-sage",
              outside: "text-ink/25",
              disabled: "opacity-30",
            }}
          />

          <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-3">
            <button
              type="button"
              onClick={() => {
                onChange(formatIsoDate(today));
                setOpen(false);
              }}
              className="rounded-[6px] px-1.5 py-1 text-xs font-medium text-ink hover:bg-ink/5"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              className="rounded-[6px] px-1.5 py-1 text-xs text-ink/45 hover:text-coral"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
