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
  onDateChange: (date: Date) => void;
  comments: ClassroomComment[];
  lectureInfos: ScheduleLectureInfo[];
  isLoading: boolean;
  error: string | null;
  onCellChange: (timeSlot: TimeSlot, group: string, classroom: ClassroomType | null) => void;
}

export function ClassroomSchedule({ dailyData, selectedDate, setSelectedDate, onDateChange, comments, lectureInfos, isLoading, error, onCellChange }: ClassroomScheduleProps) {
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
    onDateChange(date)
  }

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today)
    onDateChange(today)
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
          onCellChange={onCellChange}
          comments={comments}
          lectureInfos={lectureInfos}
          classroomOptions={["---", "1F実習室", "2F実習室", "3F実習室", "3F小教室", "4F小教室", "4F大教室", "5F大教室", "7F大教室", "パソコン室", "DT3階小教室", "DT4階小教室"]}
        />
      )}
      <div className="mt-8 flex justify-between items-center">
        <Link href="/admin">
          <Button variant="outline" className="bg-pink-50 hover:bg-pink-100 border-pink-300">
            教室管理
          </Button>
        </Link>
        {/* 更新ボタンは親でfetchDataを呼ぶため、ここでは何もしない */}
        <Button onClick={() => {}} variant="outline" className="bg-pink-50 hover:bg-pink-100 border-pink-300">
          更新
        </Button>
      </div>
    </div>
  )
}
