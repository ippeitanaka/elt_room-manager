"use client"

import { ClassroomSchedule } from "@/components/ClassroomSchedule"
import type { DailyClassroomData } from "@/lib/classrooms"
import { useState } from "react"

interface ClassroomScheduleWrapperProps {
  initialData: DailyClassroomData
  initialDate: string
}

import { useEffect } from "react"
import { fetchScheduleLectures, ScheduleLectureInfo } from "@/lib/schedule-lectures"
import type { ClassroomComment } from "@/lib/comments"
import { format } from "date-fns"

export function ClassroomScheduleWrapper({ initialData, initialDate }: ClassroomScheduleWrapperProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(initialDate))
  const [dailyData, setDailyData] = useState<DailyClassroomData>(initialData)
  const [comments, setComments] = useState<ClassroomComment[]>([])
  const [lectureInfos, setLectureInfos] = useState<ScheduleLectureInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 日付変更時にAPIからデータ取得
  const fetchData = async (date: Date) => {
    setIsLoading(true)
    setError(null)
    const dateString = format(date, "yyyy-MM-dd")
    try {
      const response = await fetch(`/api/classroom-data?date=${dateString}&timestamp=${Date.now()}`, { cache: "no-store" })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setDailyData(data)
      // コメント
      const commentsResponse = await fetch(`/api/classroom-comments?date=${dateString}&timestamp=${Date.now()}`, { cache: "no-store" })
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData)
      }
      // 講義情報
      const lectures = await fetchScheduleLectures(dateString)
      setLectureInfos(lectures)
    } catch (err) {
      setError("データの取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedDate)
  }, [selectedDate])

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleCellChange = (timeSlot: string, group: string, classroom: ClassroomType | null) => {
    setDailyData((prevData) => {
      return {
        ...prevData,
        [timeSlot]: {
          ...prevData[timeSlot as keyof DailyClassroomData],
          [group]: classroom,
        },
      }
    })
  }

  return (
    <ClassroomSchedule
      dailyData={dailyData}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      comments={comments}
      lectureInfos={lectureInfos}
      isLoading={isLoading}
      error={error}
      onCellChange={handleCellChange}
    />
  )
}
