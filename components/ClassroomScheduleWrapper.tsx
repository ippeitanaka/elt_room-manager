"use client"

import { ClassroomSchedule } from "@/components/ClassroomSchedule"
import type { DailyClassroomData } from "@/lib/classrooms"
import { useState } from "react"

interface ClassroomScheduleWrapperProps {
  initialData: DailyClassroomData
  initialDate: string
}

export function ClassroomScheduleWrapper({ initialData, initialDate }: ClassroomScheduleWrapperProps) {
  const [date] = useState<Date>(() => new Date(initialDate))

  return (
    <>
      <ClassroomSchedule initialData={initialData} initialDate={date} />
    </>
  )
}
