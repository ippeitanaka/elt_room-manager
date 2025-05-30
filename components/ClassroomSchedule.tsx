"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { ClassroomTable } from "@/components/ClassroomTable"
import { DatePicker } from "@/components/DatePicker"
import type { DailyClassroomData, ClassroomType, TimeSlot } from "@/lib/classrooms"
import type { ClassroomComment } from "@/lib/comments"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ClassroomScheduleProps {
  initialData: DailyClassroomData
  initialDate: Date
}

export function ClassroomSchedule({ initialData, initialDate }: ClassroomScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate)
  const [dailyData, setDailyData] = useState<DailyClassroomData>(initialData)
  const [comments, setComments] = useState<ClassroomComment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (date: Date) => {
    setIsLoading(true)
    setError(null)
    const dateString = format(date, "yyyy-MM-dd")
    try {
      // 教室データを取得
      const response = await fetch(`/api/classroom-data?date=${dateString}&timestamp=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setDailyData(data)

      // コメントデータを取得
      const commentsResponse = await fetch(`/api/classroom-comments?date=${dateString}&timestamp=${Date.now()}`, {
        cache: "no-store",
      })
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData)
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err)
      setError("データの取得に失敗しました。再読み込みしてください。")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(selectedDate)
  }, [selectedDate, fetchData])

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleCellChange = (timeSlot: TimeSlot, group: string, classroom: ClassroomType | null) => {
    setDailyData((prevData) => {
      if (!prevData) return prevData
      return {
        ...prevData,
        [timeSlot]: {
          ...prevData[timeSlot],
          [group]: classroom,
        },
      }
    })
  }

  const handleRefresh = () => {
    fetchData(selectedDate)
  }

  // 今日の日付かどうかをチェック
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // 今日ボタンのハンドラー
  const handleTodayClick = () => {
    setSelectedDate(new Date())
  }

  return (
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4">
      {/* ヘッダー部分 - タイトルを左に、日付選択を右に配置 */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-600 tracking-wide mb-4 sm:mb-0">
          ELT <span className="text-pink-800">本日の教室</span>
        </h1>

        <div className="flex items-center gap-2">
          <DatePicker date={selectedDate} onSelect={handleDateChange} />
          <Button
            onClick={handleTodayClick}
            variant="outline"
            className="bg-pink-50 hover:bg-pink-100 border-pink-300"
            disabled={isToday(selectedDate)}
          >
            今日
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">データを読み込んでいます...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <ClassroomTable
          data={dailyData}
          isAdminView={false}
          onCellChange={handleCellChange}
          comments={comments}
          date={format(selectedDate, "yyyy-MM-dd")}
        />
      )}
      <div className="mt-8 flex justify-between items-center">
        <Link href="/admin">
          <Button variant="outline" className="bg-pink-50 hover:bg-pink-100 border-pink-300">
            教室管理
          </Button>
        </Link>
        <Button onClick={handleRefresh} variant="outline" className="bg-pink-50 hover:bg-pink-100 border-pink-300">
          更新
        </Button>
      </div>
    </div>
  )
}
