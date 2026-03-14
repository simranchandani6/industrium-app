"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type SelectOption = {
  value: string;
  label: string;
};

type UiSelectProps = {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

export function UiSelect({
  name,
  options,
  defaultValue = "",
  placeholder = "Select an option",
  required = false,
  className,
}: UiSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

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
      setValue(defaultValue);
      setIsOpen(false);
    };

    form.addEventListener("reset", handleReset);

    return () => {
      form.removeEventListener("reset", handleReset);
    };
  }, [defaultValue]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-left outline-none transition focus:border-teal",
          isOpen ? "border-teal ring-1 ring-teal/20" : "",
        )}
      >
        <span className={selectedOption ? "text-ink" : "text-steel"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn("size-4 text-steel transition", isOpen ? "rotate-180" : "")}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-2xl shadow-ink/10">
          <ul role="listbox" className="max-h-72 overflow-y-auto py-2">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={`${name}-${option.value}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setValue(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition",
                      isSelected
                        ? "bg-teal/8 text-ink"
                        : "text-steel hover:bg-surface hover:text-ink",
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected ? <Check className="size-4 text-teal" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
