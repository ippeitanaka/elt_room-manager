"use client"

import { ClassroomSchedule } from "@/components/ClassroomSchedule"
import type { DailyClassroomData } from "@/lib/classrooms"
import { useState } from "react"

interface ClassroomScheduleWrapperProps {
  initialData: DailyClassroomData
  initialDate: string
}

export function ClassroomScheduleWrapper({ initialData, initialDate }: ClassroomScheduleWrapperProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(initialDate))
  const [dailyData, setDailyData] = useState<DailyClassroomData>(initialData)

  return (
    <ClassroomSchedule
      initialData={dailyData}
      initialDate={new Date(initialDate)}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      setDailyData={setDailyData}
    />
  )
}
