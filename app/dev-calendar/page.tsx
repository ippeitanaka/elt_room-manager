"use client"

import React from "react"
import { Calendar } from "@/components/ui/calendar"
import { ja as jaLocale } from "date-fns/locale"

export default function DevCalendarPage() {
  // Monday-start Japanese locale
  const jaMonday = { ...jaLocale, options: { ...jaLocale.options, weekStartsOn: 1 as 1 } }

  return (
    <div className="min-h-screen p-8 bg-background">
      <h2 className="text-xl font-bold mb-4">Dev Calendar - always visible</h2>
      <div className="max-w-md">
        <Calendar
          mode="single"
          locale={jaMonday}
          showOutsideDays={true}
        />
      </div>
    </div>
  )
}
