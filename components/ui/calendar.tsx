"use client"

import type * as React from "react"
import { DayPicker, type ChevronProps } from "react-day-picker"
import { isJpHoliday } from "@/lib/jp-holidays"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-[1.5rem] border border-amber-100 bg-white p-3 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.32)]",
        className,
      )}
      modifiers={{
        holiday: (date) => isJpHoliday(date),
        saturday: { dayOfWeek: [6] },
        sunday: { dayOfWeek: [0] },
      }}
      modifiersClassNames={{
        holiday: "text-red-500",
        saturday: "text-blue-500",
        sunday: "text-red-500",
      }}
      classNames={{
        months: "flex flex-col",
        month: "flex flex-col gap-4",
        month_caption: "relative flex h-9 items-center justify-center px-9",
        caption_label: "text-sm font-semibold text-slate-800",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 rounded-full bg-white p-0 opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 rounded-full bg-white p-0 opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday: "w-10 pb-1 text-center text-[0.68rem] font-semibold text-slate-500 sm:text-xs",
        week: "mt-1 flex w-full",
        day: "h-10 w-10 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 rounded-2xl p-0 font-medium text-slate-700 aria-selected:opacity-100",
        ),
        selected:
          "[&>button]:bg-slate-800 [&>button]:text-slate-50 [&>button:hover]:bg-slate-800 [&>button:hover]:text-slate-50 [&>button:focus]:bg-slate-800 [&>button:focus]:text-slate-50",
        today: "[&>button]:bg-amber-100 [&>button]:text-slate-900",
        outside:
          "text-slate-300 opacity-70 [&>button]:text-slate-300 [&>button[aria-selected='true']]:bg-slate-200 [&>button[aria-selected='true']]:text-slate-500",
        disabled: "text-muted-foreground opacity-50 [&>button]:cursor-not-allowed",
        range_middle: "[&>button[aria-selected='true']]:bg-amber-100 [&>button[aria-selected='true']]:text-slate-900",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...props }: ChevronProps) => {
          if (orientation === "left") {
            return <ChevronLeft {...props} className={cn("h-4 w-4", className)} />
          }

          return <ChevronRight {...props} className={cn("h-4 w-4", className)} />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
