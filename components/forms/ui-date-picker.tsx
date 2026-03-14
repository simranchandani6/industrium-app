"use client";

import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type UiDatePickerProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
};

function parseDate(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function UiDatePicker({
  name,
  defaultValue = "",
  placeholder = "Select a date",
  className,
}: UiDatePickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedDate = useMemo(() => parseDate(defaultValue), [defaultValue]);
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => selectedDate ?? new Date());

  useEffect(() => {
    const parsed = parseDate(defaultValue);
    setValue(defaultValue);
    setVisibleMonth(parsed ?? new Date());
  }, [defaultValue, selectedDate]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const form = rootRef.current?.closest("form");

    if (!form) {
      return;
    }

    const handleReset = () => {
      const parsed = parseDate(defaultValue);
      setValue(defaultValue);
      setVisibleMonth(parsed ?? new Date());
      setIsOpen(false);
    };

    form.addEventListener("reset", handleReset);

    return () => {
      form.removeEventListener("reset", handleReset);
    };
  }, [defaultValue]);

  const currentSelection = parseDate(value);
  const firstDayOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  const displayValue = currentSelection
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(currentSelection)
    : placeholder;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-left outline-none transition",
          isOpen ? "border-teal ring-1 ring-teal/20" : "",
        )}
      >
        <span className={currentSelection ? "text-ink" : "text-steel"}>{displayValue}</span>
        <CalendarDays className="size-4 text-steel" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-[70] mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-[24px] border border-ink/10 bg-white p-4 shadow-2xl shadow-ink/10">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                )
              }
              className="rounded-full border border-ink/10 p-2 text-steel transition hover:border-teal hover:text-teal"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-semibold text-ink">{monthLabel}</p>
            <div className="flex items-center gap-2">
              {value ? (
                <button
                  type="button"
                  onClick={() => setValue("")}
                  className="rounded-full border border-ink/10 p-2 text-steel transition hover:border-teal hover:text-teal"
                >
                  <X className="size-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  setVisibleMonth(
                    new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                  )
                }
                className="rounded-full border border-ink/10 p-2 text-steel transition hover:border-teal hover:text-teal"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs uppercase tracking-[0.16em] text-steel">
            {weekdayLabels.map((label) => (
              <div key={label} className="py-2">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth.getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="h-10" />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index + 1);
              const isSelected = currentSelection ? isSameDay(currentSelection, date) : false;
              const isToday = isSameDay(new Date(), date);

              return (
                <button
                  key={formatDateValue(date)}
                  type="button"
                  onClick={() => {
                    setValue(formatDateValue(date));
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex h-10 items-center justify-center rounded-xl text-sm transition",
                    isSelected
                      ? "bg-ink text-white"
                      : isToday
                        ? "border border-teal/30 bg-teal/5 text-ink"
                        : "text-steel hover:bg-surface hover:text-ink",
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
