"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayPickerProps,
} from "react-day-picker";

import { cn } from "@/lib/utils";

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 text-[#171310]", className)}
      classNames={{
        root: cn(defaultClassNames.root, "w-full"),
        months: cn(defaultClassNames.months, "grid gap-4"),
        month: cn(defaultClassNames.month, "space-y-4"),
        month_caption: cn(
          defaultClassNames.month_caption,
          "relative flex h-9 items-center justify-center",
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          "text-sm font-semibold",
        ),
        nav: cn(
          defaultClassNames.nav,
          "absolute inset-x-0 top-0 flex items-center justify-between",
        ),
        button_previous: cn(
          defaultClassNames.button_previous,
          "flex size-9 items-center justify-center rounded-[8px] border border-[#171310]/10 bg-white text-[#171310] transition hover:bg-[#f5eee5] disabled:opacity-35",
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "flex size-9 items-center justify-center rounded-[8px] border border-[#171310]/10 bg-white text-[#171310] transition hover:bg-[#f5eee5] disabled:opacity-35",
        ),
        chevron: cn(defaultClassNames.chevron, "size-4"),
        month_grid: cn(defaultClassNames.month_grid, "w-full border-collapse"),
        weekdays: cn(defaultClassNames.weekdays, "grid grid-cols-7"),
        weekday: cn(
          defaultClassNames.weekday,
          "py-2 text-center text-xs font-semibold uppercase tracking-normal text-[#7a7067]",
        ),
        weeks: cn(defaultClassNames.weeks, "grid gap-1"),
        week: cn(defaultClassNames.week, "grid grid-cols-7 gap-1"),
        day: cn(defaultClassNames.day, "relative aspect-square text-center"),
        day_button: cn(
          defaultClassNames.day_button,
          "flex size-full items-center justify-center rounded-[8px] text-sm font-medium transition hover:bg-[#f5eee5] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#ffcf6b]/50",
        ),
        today: cn(defaultClassNames.today, "text-[#d94b2b]"),
        outside: cn(defaultClassNames.outside, "text-[#b9afa5]"),
        disabled: cn(defaultClassNames.disabled, "opacity-35"),
        selected: cn(
          defaultClassNames.selected,
          "[&_button]:bg-[#171310] [&_button]:text-white [&_button]:hover:bg-[#2c241d]",
        ),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName }) =>
          orientation === "left" ? (
            <ChevronLeft className={iconClassName} aria-hidden="true" />
          ) : (
            <ChevronRight className={iconClassName} aria-hidden="true" />
          ),
      }}
      {...props}
    />
  );
}
