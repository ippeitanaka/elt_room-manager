"use client"

import React, { useState } from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { DailyClassroomData, ClassroomType, TimeSlot } from "@/lib/classrooms"
import type { ScheduleLectureInfo } from "@/lib/schedule-lectures"
import { LectureInfoCell } from "@/components/LectureInfoCell"
import { regularClassGroups, nursingClassGroups } from "@/lib/classrooms"
// 教室名ごとに一意なHSLカラーを割り当てる関数
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
// HSLで色を生成（彩度・明度は固定、色相のみ分散）
function getClassroomColorStyle(classroom: string): React.CSSProperties {
  if (!classroom || classroom === "---") return {};
  const hash = hashString(classroom);
  const hue = hash % 360; // 0-359度で色相を分散
  const saturation = 70; // 彩度
  const lightness = 85; // 明度
  return { backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)` };
}
import type { ClassroomComment } from "@/lib/comments"
import { CommentModal } from "@/components/CommentModal"

interface ClassroomTableProps {
  data: DailyClassroomData;
  lectureInfos?: ScheduleLectureInfo[];
  comments: ClassroomComment[];
  isAdminView: boolean;
  onCellChange: (timeSlot: TimeSlot, group: string, value: ClassroomType | null) => void;
  onCommentChange?: (timeSlot: TimeSlot, group: string, classroom: string, comment: string) => void;
  onCommentDelete?: (timeSlot: TimeSlot, group: string) => void;
  classroomOptions: string[];
}

const ClassroomTable: React.FC<ClassroomTableProps> = ({
  data,
  lectureInfos,
  comments,
  isAdminView,
  onCellChange,
  onCommentChange,
  onCommentDelete,
  classroomOptions,
}) => {
  const [activeComment, setActiveComment] = useState<{
    classroom: string;
    comment: string;
    timeSlot: string;
    classGroup: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<{
    timeSlot: TimeSlot;
    group: string;
    comment: string;
  } | null>(null);

  if (!data) {
    return <div>データが利用できません。</div>;
  }

  // コメントを検索する関数
  const findComment = (timeSlot: string, group: string) => {
    return comments.find((comment) => comment.time_slot === timeSlot && comment.class_group === group);
  };

  const handleCellClick = (timeSlot: TimeSlot, group: string, classroom: string | null) => {
    if (!isAdminView && classroom) {
      const comment = findComment(timeSlot, group);
      if (comment) {
        setActiveComment({
          classroom: comment.classroom,
          comment: comment.comment,
          timeSlot,
          classGroup: group,
        });
        setModalOpen(true);
      }
    }
  };

  const handleCommentEdit = (timeSlot: TimeSlot, group: string) => {
    const comment = findComment(timeSlot, group);
    setEditingComment({
      timeSlot,
      group,
      comment: comment ? comment.comment : "",
    });
  };

  const handleCommentSave = () => {
    if (editingComment && onCommentChange && data[editingComment.timeSlot][editingComment.group]) {
      onCommentChange(
        editingComment.timeSlot,
        editingComment.group,
        data[editingComment.timeSlot][editingComment.group] || "",
        editingComment.comment,
      );
      setEditingComment(null);
    }
  };

  const handleCommentCancel = () => {
    setEditingComment(null);
  };

  const handleCommentDelete = () => {
    if (editingComment && onCommentDelete) {
      onCommentDelete(editingComment.timeSlot, editingComment.group);
      setEditingComment(null);
    }
  };

  // セル描画関数
  function renderCell(timeSlot: TimeSlot, group: string) {
    const classroom = data[timeSlot]?.[group] || null;
    const isSpecialTimeSlot = ["自　習", "補　習", "再試験"].includes(timeSlot);
    const comment = findComment(timeSlot, group);
    const hasComment = !!comment;
    let lectureName: string | null | undefined = null;
    let teacherName: string | null | undefined = null;
    if (Array.isArray(lectureInfos)) {
      const info = lectureInfos.find(
        (l) => l.time_slot === timeSlot && l.class_group === group
      );
      if (info) {
        lectureName = info.lecture_name;
        teacherName = info.teacher_name;
      }
    }

    // 編集中のコメント
    if (isAdminView && editingComment && editingComment.timeSlot === timeSlot && editingComment.group === group) {
      return (
        <TableCell
          key={`${timeSlot}-${group}`}
          className={`border border-pink-300 p-1 text-center`}
          style={getClassroomColorStyle(classroom || "")}
        >
          <div className="space-y-2">
            <LectureInfoCell lectureName={lectureName} teacherName={teacherName} />
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
      );
    }

    return (
      <TableCell
        key={`${timeSlot}-${group}`}
        className={`border border-pink-300 p-1 text-center${!isAdminView && hasComment ? " cursor-pointer" : ""}`}
        style={getClassroomColorStyle(classroom || "")}
        onClick={() => !isAdminView && handleCellClick(timeSlot, group, classroom)}
      >
        {isAdminView ? (
          <div className="space-y-1">
            <LectureInfoCell lectureName={lectureName} teacherName={teacherName} />
            <Select
              value={classroom || undefined}
              onValueChange={(value: string) => onCellChange(timeSlot, group, (value === "---" ? null : value as ClassroomType))}
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
          <>
            <LectureInfoCell lectureName={lectureName} teacherName={teacherName} />
            <span className={`whitespace-nowrap ${hasComment ? "text-red-600 font-bold" : ""}`}>
              {classroom || "---"}
              {hasComment && <span className="ml-1">※</span>}
            </span>
          </>
        )}
      </TableCell>
    );
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

      {/* 昼間部テーブル */}
      <div className="w-full mb-8">
        <div className="border-4 border-pink-300 rounded-lg overflow-hidden">
          <div className="bg-pink-100 text-pink-800 font-bold text-center py-2">昼間部</div>
          <div className="overflow-x-auto w-full min-w-0">
            <Table className="w-full min-w-0 border-collapse table-fixed text-[clamp(0.45rem,0.8vw,1rem)]">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-pink-300 bg-pink-100 p-1 text-center font-bold whitespace-nowrap w-[28px] min-w-[20px] max-w-[28px] truncate text-[7px] sm:w-[80px] sm:min-w-[60px] sm:max-w-[100px] sm:text-[clamp(0.6rem,1.2vw,1rem)]">
                    時限
                  </TableHead>
                  {regularClassGroups.map((group) => (
                    <TableHead
                      key={group}
                      className="border border-pink-300 bg-pink-100 p-0.5 text-center font-bold whitespace-nowrap w-[60px] min-w-[36px] max-w-[60px] truncate text-[8px] sm:w-[120px] sm:min-w-[80px] sm:max-w-[140px] sm:text-[clamp(0.6rem,1.2vw,1rem)]"
                    >
                      <div className="truncate">{group}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  "1限目","2限目","昼食","3限目","4限目","自　習","補　習","再試験"
                ].map((timeSlot) => (
                  <TableRow key={timeSlot}>
                    <TableCell className="border border-pink-300 bg-pink-50 p-0.5 text-center font-medium whitespace-nowrap w-[28px] min-w-[20px] max-w-[28px] truncate text-[7px] sm:w-[80px] sm:min-w-[60px] sm:max-w-[100px] sm:text-[clamp(0.6rem,1.2vw,1rem)]">
                      {timeSlot === "自　習" ? <span className="text-[6px] sm:text-base">マイスタディ</span> : timeSlot}
                    </TableCell>
                    {regularClassGroups.map((group) =>
                      React.cloneElement(renderCell(timeSlot as TimeSlot, group), {
                        className: `border border-pink-300 p-0.5 text-center align-middle w-[60px] min-w-[36px] max-w-[60px] truncate text-[8px] sm:w-[120px] sm:min-w-[80px] sm:max-w-[140px] sm:text-[clamp(0.6rem,1.2vw,1rem)]` +
                          (renderCell(timeSlot as TimeSlot, group).props.className ? ` ${renderCell(timeSlot as TimeSlot, group).props.className}` : "")
                      })
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* 夜間部テーブル */}
      <div className="w-full">
        <div className="border-4 border-pink-300 rounded-lg overflow-hidden">
          <div className="bg-pink-100 text-pink-800 font-bold text-center py-2">夜間部</div>
          <div className="overflow-x-auto w-full min-w-0">
            <Table className="w-full min-w-0 border-collapse table-fixed text-[clamp(0.45rem,0.8vw,1rem)]">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-pink-300 bg-pink-100 p-1 text-center font-bold whitespace-nowrap w-[60px] min-w-[36px] max-w-[60px] truncate text-[8px] sm:w-[80px] sm:min-w-[60px] sm:max-w-[100px] sm:text-[clamp(0.6rem,1.2vw,1rem)]">
                    時限
                  </TableHead>
                  {nursingClassGroups.map((group) => (
                    <TableHead
                      key={group}
                      className="border border-pink-300 bg-pink-100 p-0.5 text-center font-bold whitespace-nowrap w-[60px] min-w-[36px] max-w-[60px] truncate text-[8px] sm:w-[120px] sm:min-w-[80px] sm:max-w-[140px] sm:text-[clamp(0.6rem,1.2vw,1rem)]"
                    >
                      <div className="truncate">{group}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {["5限目","6限目","自　習","補　習","再試験"].map((timeSlot) => (
                  <TableRow key={timeSlot}>
                    <TableCell className="border border-pink-300 bg-pink-50 p-0.5 text-center font-medium whitespace-nowrap w-[60px] min-w-[36px] max-w-[60px] truncate text-[8px] sm:w-[80px] sm:min-w-[60px] sm:max-w-[100px] sm:text-[clamp(0.6rem,1.2vw,1rem)]">
                      {timeSlot === "自　習" ? "マイスタディ" : timeSlot}
                    </TableCell>
                    {nursingClassGroups.map((group) =>
                      React.cloneElement(renderCell(timeSlot as TimeSlot, group), {
                        className: `border border-pink-300 p-0.5 text-center align-middle w-[60px] min-w-[36px] max-w-[60px] truncate text-[8px] sm:w-[120px] sm:min-w-[80px] sm:max-w-[140px] sm:text-[clamp(0.6rem,1.2vw,1rem)]` +
                          (renderCell(timeSlot as TimeSlot, group).props.className ? ` ${renderCell(timeSlot as TimeSlot, group).props.className}` : "")
                      })
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomTable;
