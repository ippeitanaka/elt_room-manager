"use client"

import React, { useState } from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { DailyClassroomData, ClassroomType, TimeSlot } from "@/lib/classrooms"
import { regularClassGroups, nursingClassGroups, regularTimeSlots, nursingTimeSlots } from "@/lib/classrooms"
import type { ClassroomComment } from "@/lib/comments"
import { CommentModal } from "@/components/CommentModal"

interface ClassroomTableProps {
  data: DailyClassroomData
  onCellChange: (timeSlot: TimeSlot, group: string, classroom: ClassroomType | null) => void
  isAdminView: boolean
  comments?: ClassroomComment[]
  onCommentChange?: (timeSlot: TimeSlot, group: string, classroom: string, comment: string) => void
  onCommentDelete?: (timeSlot: TimeSlot, group: string) => void
  date?: string
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
    DT3階小教室: "bg-amber-100",
    DT4階小教室: "bg-lime-100",
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
  "DT3階小教室",
  "DT4階小教室",
  "図書室",
]

const renderColumnDropdown = (
  group: string,
  onCellChange: (timeSlot: TimeSlot, group: string, classroom: ClassroomType | null) => void,
  timeSlots: TimeSlot[],
) => (
  <Select
    value={undefined}
    onValueChange={(value: string) => {
      if (value) {
        timeSlots
          .filter((slot) => !["マイスタディ", "補　習", "再試験"].includes(slot))
          .forEach((timeSlot) => onCellChange(timeSlot, group, value as ClassroomType))
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

export const ClassroomTable: React.FC<ClassroomTableProps> = React.memo(
  ({ data, onCellChange, isAdminView, comments = [], onCommentChange, onCommentDelete, date }) => {
    const [modalOpen, setModalOpen] = useState(false)
    const [activeComment, setActiveComment] = useState<{
      classroom: string
      comment: string
      timeSlot: string
      classGroup: string
    } | null>(null)
    const [editingComment, setEditingComment] = useState<{
      timeSlot: TimeSlot
      group: string
      comment: string
    } | null>(null)

    if (!data) {
      return <div>データが利用できません。</div>
    }

    // コメントを検索する関数
    const findComment = (timeSlot: string, group: string) => {
      return comments.find((comment) => comment.time_slot === timeSlot && comment.class_group === group)
    }

    const handleCellClick = (timeSlot: TimeSlot, group: string, classroom: string | null) => {
      if (!isAdminView && classroom) {
        const comment = findComment(timeSlot, group)
        if (comment) {
          setActiveComment({
            classroom: comment.classroom,
            comment: comment.comment,
            timeSlot,
            classGroup: group,
          })
          setModalOpen(true)
        }
      }
    }

    const handleCommentEdit = (timeSlot: TimeSlot, group: string) => {
      const comment = findComment(timeSlot, group)
      setEditingComment({
        timeSlot,
        group,
        comment: comment ? comment.comment : "",
      })
    }

    const handleCommentSave = () => {
      if (editingComment && onCommentChange && data[editingComment.timeSlot][editingComment.group]) {
        onCommentChange(
          editingComment.timeSlot,
          editingComment.group,
          data[editingComment.timeSlot][editingComment.group]?.classroom || "",
          editingComment.comment,
        )
        setEditingComment(null)
      }
    }

    const handleCommentCancel = () => {
      setEditingComment(null)
    }

    const handleCommentDelete = () => {
      if (editingComment && onCommentDelete) {
        onCommentDelete(editingComment.timeSlot, editingComment.group)
        setEditingComment(null)
      }
    }

    const renderCell = (timeSlot: TimeSlot, group: string) => {
  const cell = data[timeSlot]?.[group] || { classroom: null }
  const classroom = cell.classroom || null
  const subject = cell.subject || ""
  const instructor = cell.instructor || ""
  const isSpecialTimeSlot = ["自　習", "補　習", "再試験"].includes(timeSlot)
  const comment = findComment(timeSlot, group)
  const hasComment = !!comment

      if (isAdminView && editingComment && editingComment.timeSlot === timeSlot && editingComment.group === group) {
        return (
          <TableCell
            key={`${timeSlot}-${group}`}
            className={`border border-pink-300 p-1 text-center ${getClassroomColor(classroom || "")}`}
          >
            <div className="space-y-2">
              <div className="font-medium">{classroom || "---"}</div>
              <Textarea
                value={editingComment.comment}
                onChange={(e) => setEditingComment({ ...editingComment, comment: e.target.value })}
                placeholder="コメントを入力"
                className="min-h-[80px] text-sm"
              />
              <div className="flex justify-between gap-1">
                <Button size="sm" onClick={handleCommentSave} className="flex-1">
                  保存
                </Button>
                <Button size="sm" variant="outline" onClick={handleCommentCancel} className="flex-1">
                  キャンセル
                </Button>
                {hasComment && (
                  <Button size="sm" variant="destructive" onClick={handleCommentDelete} className="flex-1">
                    削除
                  </Button>
                )}
              </div>
            </div>
          </TableCell>
        )
      }

      return (
        <TableCell
          key={`${timeSlot}-${group}`}
          className={`border border-pink-300 p-1 text-center min-w-[7rem] max-w-[7rem] ${getClassroomColor(classroom || "")} ${
            !isAdminView && hasComment ? "cursor-pointer" : ""
          }`}
          onClick={() => !isAdminView && handleCellClick(timeSlot, group, classroom)}
        >
          {/* subject/instructor 表示（空欄・null時は非表示） */}
          {(subject || instructor) && (
            <div className="flex flex-col items-center mb-1 w-full">
              {subject && (
                <span className="font-bold text-xs md:text-sm text-gray-900 truncate w-full" title={subject}>{subject}</span>
              )}
              {instructor && (
                <span className="text-[0.7em] text-gray-500 font-normal truncate w-full" title={instructor}>{instructor}</span>
              )}
            </div>
          )}
          {isAdminView ? (
            <div className="space-y-1">
              <Select
                value={classroom || undefined}
                onValueChange={(value: string) => onCellChange(timeSlot, group, value as ClassroomType || null)}
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
              {classroom && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => handleCommentEdit(timeSlot, group)}
                >
                  {hasComment ? "コメント編集" : "コメント追加"}
                </Button>
              )}
            </div>
          ) : (
            <span className={`whitespace-nowrap ${hasComment ? "text-red-600 font-bold" : ""}`}>
              {classroom || "---"}
              {hasComment && <span className="ml-1">※</span>}
            </span>
          )}
        </TableCell>
      )
    }

    return (
      <div className="w-full space-y-8">
        {/* コメントモーダル */}
        {activeComment && (
          <CommentModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            classroom={activeComment.classroom}
            comment={activeComment.comment}
            timeSlot={activeComment.timeSlot}
            classGroup={activeComment.classGroup}
          />
        )}

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
                      className="border border-pink-300 bg-pink-100 p-1 text-center font-bold whitespace-nowrap min-w-[7rem] max-w-[7rem]"
                    >
                      <div className="truncate text-xs md:text-sm">{group}</div>
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
                      className="border border-pink-300 bg-pink-100 p-1 text-center font-bold whitespace-nowrap min-w-[7rem] max-w-[7rem]"
                    >
                      <div className="truncate text-xs md:text-sm">{group}</div>
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
  },
)

ClassroomTable.displayName = "ClassroomTable"
