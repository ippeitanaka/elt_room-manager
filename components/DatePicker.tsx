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
          className="w-auto justify-end text-right font-bold px-4 py-2 text-gray-700 border border-gray-300 bg-white rounded-none"
          aria-label="日付を選択"
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
          <span className="text-gray-700 font-bold">
            {date ? format(date, "yyyy年M月d日（E）", { locale: jaMonday }) : "日付を選択"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
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
