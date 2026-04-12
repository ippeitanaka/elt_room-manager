"use client"

import type * as React from "react"
import { DayPicker } from "react-day-picker"
import { isJpHoliday } from "@/lib/jp-holidays"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rounded-[1.5rem] border border-amber-100 bg-white p-3 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.32)]", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4",
        caption: "flex justify-center pt-2 relative items-center",
        caption_label: "text-sm font-semibold text-slate-800",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white p-0 opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 gap-1",
        head_cell: "text-center text-[0.68rem] font-semibold text-slate-500 sm:text-xs",
        row: "mt-1 grid grid-cols-7 gap-1",
        cell: "relative h-10 p-0 text-center text-sm [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-10 w-full rounded-2xl p-0 font-medium text-slate-700 aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-slate-800 text-slate-50 hover:bg-slate-800 hover:text-slate-50 focus:bg-slate-800 focus:text-slate-50",
        day_today: "bg-amber-100 text-slate-900",
        day_outside:
          "day-outside text-slate-300 opacity-70 aria-selected:bg-slate-200 aria-selected:text-slate-500 aria-selected:opacity-100",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-amber-100 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        DayContent: ({ date, children }: { date: any; children: any }) => {
          const w = date.getDay()
          const isHoliday = isJpHoliday(date)
          let color = ""
          if (w === 0 || isHoliday) color = "text-red-500"
          else if (w === 6) color = "text-blue-500"
          return <span className={color}>{children}</span>;
        },
      } as any}
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
