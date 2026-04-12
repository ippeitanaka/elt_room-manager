"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ja as jaLocale } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// 月曜始まりの日本語ロケール
const jaMonday = { ...jaLocale, options: { ...jaLocale.options, weekStartsOn: 1 as 1 } }

interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date) => void
}

export function DatePicker({ date, onSelect }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[10.5rem] justify-between gap-2 rounded-full border-amber-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 shadow-sm sm:min-w-[13rem] sm:px-4 sm:text-sm"
          aria-label="日付を選択"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-amber-600 sm:h-4 sm:w-4" />
          <span className="truncate">
            {date ? format(date, "yyyy年M月d日（E）", { locale: jaMonday }) : "日付を選択"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-none bg-transparent p-0 shadow-none" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              onSelect(d)
              setOpen(false)
            }
          }}
          locale={jaMonday}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
