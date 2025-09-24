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
    const today = new Date();
    setSelectedDate(today)
  }

  return (
  <div className="container mx-auto py-6 px-2 sm:py-12 sm:px-6 bg-gray-50 min-h-[80vh] font-sans">
      {/* ヘッダー部分 - タイトルを左に、日付選択を右に配置 */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <div className="flex items-center mb-4 sm:mb-0">
          <img src="/images/elt-firefighter.png" alt="ELTキャラクター" className="h-12 w-auto mr-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-wide">
            <span className="text-gray-700">ELT</span> <span className="text-gray-500">本日の教室</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrevDayClick}
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold px-4 py-2 shadow-none rounded-none"
          >
            前の日
          </Button>
          <DatePicker date={selectedDate} onSelect={handleDateChange} />
          <Button
            onClick={handleTodayClick}
            variant="outline"
            className="bg-gray-700 hover:bg-gray-800 border border-gray-700 text-white font-bold px-4 py-2 shadow-none rounded-none"
            disabled={isToday(selectedDate)}
          >
            今日
          </Button>
          <Button
            onClick={handleNextDayClick}
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold px-4 py-2 shadow-none rounded-none"
          >
            次の日
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-6 text-lg text-gray-500 font-semibold animate-pulse">データを読み込んでいます...</div>
      ) : error ? (
        <div className="text-center py-6 text-lg text-red-500 font-semibold">{error}</div>
      ) : (
        <div className="bg-white border border-gray-200 p-4 sm:p-8">
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
      <div className="mt-10 flex justify-between items-center">
        <Link href="/admin">
          <Button variant="outline" className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold px-4 py-2 shadow-none rounded-none">
            教室管理
          </Button>
        </Link>
        {/* 更新ボタンは親でfetchDataを呼ぶため、ここでは何もしない */}
        <Button onClick={() => {}} variant="outline" className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold px-4 py-2 shadow-none rounded-none">
          更新
        </Button>
      </div>
    </div>
  )
}
