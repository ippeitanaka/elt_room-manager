"use client"

import React from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DailyClassroomData, ClassroomType, TimeSlot } from "@/lib/classrooms"
import { regularClassGroups, nursingClassGroups, regularTimeSlots, nursingTimeSlots } from "@/lib/classrooms"

interface ClassroomTableProps {
  data: DailyClassroomData
  onCellChange: (timeSlot: TimeSlot, group: string, classroom: ClassroomType | null) => void
  isAdminView: boolean
}

const getClassroomColor = (classroom: string) => {
  const colors: { [key: string]: string } = {
    "1F実習室": "bg-red-100",
    "2F実習室": "bg-blue-100",
    "3F実習室": "bg-green-100",
    "3F小教室": "bg-yellow-100",
    "4F小教室": "bg-purple-100",
    "4F大教室": "bg-pink-100",
    "5F大教室": "bg-indigo-100",
    "7F大教室": "bg-orange-100",
    パソコン室: "bg-teal-100",
  }
  return colors[classroom] || "bg-white"
}

const classroomOptions: ClassroomType[] = [
  "1F実習室",
  "2F実習室",
  "3F実習室",
  "3F小教室",
  "4F小教室",
  "4F大教室",
  "5F大教室",
  "7F大教室",
  "パソコン室",
]

const renderColumnDropdown = (
  group: string,
  onCellChange: (timeSlot: TimeSlot, group: string, classroom: ClassroomType | null) => void,
  timeSlots: TimeSlot[],
) => (
  <Select
    value={undefined}
    onValueChange={(value: ClassroomType | undefined) => {
      if (value) {
        timeSlots
          .filter((slot) => !["自　習", "補　習", "再試験"].includes(slot)) // 昼食を除外対象から削除
          .forEach((timeSlot) => onCellChange(timeSlot, group, value))
      }
    }}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="一括設定" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="---">---</SelectItem>
      {classroomOptions.map((option) => (
        <SelectItem key={option} value={option}>
          {option}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export const ClassroomTable: React.FC<ClassroomTableProps> = React.memo(({ data, onCellChange, isAdminView }) => {
  if (!data) {
    return <div>データが利用できません。</div>
  }

  const renderCell = (timeSlot: TimeSlot, group: string) => {
    const classroom = data[timeSlot]?.[group] || null
    const isSpecialTimeSlot = ["自　習", "補　習", "再試験"].includes(timeSlot) // 昼食を特別な時間枠から除外
    return (
      <TableCell
        key={`${timeSlot}-${group}`}
        className={`border border-pink-300 p-1 text-center ${getClassroomColor(classroom || "")}`}
      >
        {isAdminView ? (
          <Select
            value={classroom || undefined}
            onValueChange={(value: ClassroomType | undefined) => onCellChange(timeSlot, group, value || null)}
            disabled={!isSpecialTimeSlot && !isAdminView}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="---">---</SelectItem>
              {classroomOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="whitespace-nowrap">{classroom || "---"}</span>
        )}
      </TableCell>
    )
  }

  return (
    <div className="w-full space-y-8">
      {/* 通常クラス用テーブル */}
      <div className="w-full overflow-x-auto mb-8">
        <div className="border-4 border-pink-300 rounded-lg overflow-hidden">
          <Table className="w-full border-collapse text-[0.6rem] sm:text-xs md:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="border border-pink-300 bg-pink-100 p-1 text-center font-bold whitespace-nowrap">
                  時限
                </TableHead>
                {regularClassGroups.map((group) => (
                  <TableHead
                    key={group}
                    className="border border-pink-300 bg-pink-100 p-1 text-center font-bold whitespace-nowrap"
                  >
                    <div>{group}</div>
                    {isAdminView && renderColumnDropdown(group, onCellChange, regularTimeSlots)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {regularTimeSlots.map((timeSlot) => (
                <TableRow key={timeSlot}>
                  <TableCell className="border border-pink-300 bg-pink-50 p-1 text-center font-medium whitespace-nowrap">
                    {timeSlot}
                  </TableCell>
                  {regularClassGroups.map((group) => renderCell(timeSlot, group))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 看護クラス用テーブル */}
      <div className="w-full overflow-x-auto">
        <div className="border-4 border-pink-300 rounded-lg overflow-hidden">
          <Table className="w-full border-collapse text-[0.6rem] sm:text-xs md:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="border border-pink-300 bg-pink-100 p-1 text-center font-bold whitespace-nowrap">
                  時限
                </TableHead>
                {nursingClassGroups.map((group) => (
                  <TableHead
                    key={group}
                    className="border border-pink-300 bg-pink-100 p-1 text-center font-bold whitespace-nowrap"
                  >
                    <div>{group}</div>
                    {isAdminView && renderColumnDropdown(group, onCellChange, nursingTimeSlots)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {nursingTimeSlots.map((timeSlot) => (
                <TableRow key={timeSlot}>
                  <TableCell className="border border-pink-300 bg-pink-50 p-1 text-center font-medium whitespace-nowrap">
                    {timeSlot}
                  </TableCell>
                  {nursingClassGroups.map((group) => renderCell(timeSlot, group))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
})

ClassroomTable.displayName = "ClassroomTable"
