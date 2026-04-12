"use client"

import ClassroomTable from "@/components/ClassroomTable"
import { DatePicker } from "@/components/DatePicker"
import type { DailyClassroomData, ClassroomType, TimeSlot } from "@/lib/classrooms"
import type { ClassroomComment } from "@/lib/comments"
import type { ScheduleLectureInfo } from "@/lib/schedule-lectures"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ClassroomScheduleProps {
  dailyData: DailyClassroomData;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  comments: ClassroomComment[];
  lectureInfos: ScheduleLectureInfo[];
  isLoading: boolean;
  error: string | null;
  onCellChange: (timeSlot: TimeSlot, group: string, classroom: ClassroomType | null) => void;
}

export function ClassroomSchedule({ dailyData, selectedDate, setSelectedDate, comments, lectureInfos, isLoading, error, onCellChange }: ClassroomScheduleProps) {
  // 前日・翌日へ移動する関数
  const handlePrevDayClick = () => {
    const prevDate = new Date(selectedDate)
    prevDate.setDate(selectedDate.getDate() - 1)
    setSelectedDate(prevDate)
  }
  const handleNextDayClick = () => {
    const nextDate = new Date(selectedDate)
    nextDate.setDate(selectedDate.getDate() + 1)
    setSelectedDate(nextDate)
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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTodayClick = () => {
    const today = new Date()
    setSelectedDate(today)
  }

  return (
    <div className="page-shell min-h-screen">
      <div className="sticky top-0 z-40 mb-4 pt-2 sm:mb-6 sm:pt-3">
        <div className="hero-panel border border-slate-700/60 bg-slate-800/95 backdrop-blur supports-[backdrop-filter]:bg-slate-800/88">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/elt-firefighter.png" alt="ELTキャラクター" className="h-12 w-auto sm:h-14" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-200/90">ELT ROOM MANAGER</p>
              <h1 className="text-2xl font-bold text-white sm:text-4xl">本日の教室案内</h1>
            </div>
          </div>

          <div className="surface-subtle flex flex-wrap items-center gap-2 p-2 sm:gap-3 sm:p-3">
            <Button
              onClick={handlePrevDayClick}
              variant="outline"
              size="sm"
              className="min-w-[4.75rem] bg-white/90"
            >
              前の日
            </Button>
            <DatePicker date={selectedDate} onSelect={handleDateChange} />
            <Button
              onClick={handleTodayClick}
              variant="default"
              size="sm"
              className="bg-amber-500 text-white hover:bg-amber-600"
              disabled={isToday(selectedDate)}
            >
              今日
            </Button>
            <Button
              onClick={handleNextDayClick}
              variant="outline"
              size="sm"
              className="min-w-[4.75rem] bg-white/90"
            >
              次の日
            </Button>
          </div>
        </div>
      </div>
      </div>

      {isLoading ? (
        <div className="surface-card px-4 py-8 text-center text-sm font-semibold text-slate-500 sm:text-lg">データを読み込んでいます...</div>
      ) : error ? (
        <div className="surface-card px-4 py-8 text-center text-sm font-semibold text-red-500 sm:text-lg">{error}</div>
      ) : (
        <div className="surface-card p-3 sm:p-6">
          <ClassroomTable
            data={dailyData}
            isAdminView={false}
            onCellChange={onCellChange}
            comments={comments}
            lectureInfos={lectureInfos}
            classroomOptions={["---", "1F実習室", "2F実習室", "3F実習室", "3F小教室", "4F小教室", "4F大教室", "5F大教室", "7F大教室", "パソコン室", "DT3階小教室", "DT4階小教室"]}
          />
        </div>
      )}
      <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/admin" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full bg-white sm:w-auto">
            教室管理
          </Button>
        </Link>
        <Button onClick={() => {}} variant="outline" className="w-full bg-white sm:w-auto">
          更新
        </Button>
      </div>
    </div>
  )
}
