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
  // 個別指定: 5F大教室のみ色を変更
  if (classroom === "5F大教室") {
    return { backgroundColor: "hsl(30, 70%, 85%)" };
  }
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
          className={`border-none bg-white p-3 text-center rounded-xl shadow-md transition-all duration-200`}
          style={getClassroomColorStyle(classroom || "")}
        >
          <div className="space-y-2">
            <LectureInfoCell lectureName={lectureName} teacherName={teacherName} />
            <div className="font-semibold text-green-700 text-base">{classroom || "---"}</div>
            <Textarea
              value={editingComment.comment}
              onChange={(e) => setEditingComment({ ...editingComment, comment: e.target.value })}
              placeholder="コメントを入力"
              className="min-h-[80px] text-base bg-green-50 border-green-200 rounded-xl focus:ring-2 focus:ring-green-200"
            />
            <div className="flex justify-between gap-2 mt-2">
              <Button size="sm" onClick={handleCommentSave} className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-xl">
                保存
              </Button>
              <Button size="sm" variant="outline" onClick={handleCommentCancel} className="flex-1 border-green-300 text-green-700 rounded-xl">
                キャンセル
              </Button>
              {hasComment && (
                <Button size="sm" variant="destructive" onClick={handleCommentDelete} className="flex-1 bg-red-100 text-red-700 rounded-xl">
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
        className={`border-none bg-white p-3 text-center rounded-xl shadow-md transition-all duration-200 hover:bg-green-50${!isAdminView && hasComment ? " cursor-pointer" : ""}`}
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
            <span className={`${hasComment ? "text-green-700 font-bold" : "text-gray-700 font-medium"} text-xs sm:text-base break-words whitespace-pre-line hyphens-auto`}>
              {classroom || "---"}
              {hasComment && <span className="ml-1 text-green-400">※</span>}
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
      <div className="w-full mb-8 font-sans">
        <div className="border border-gray-300 bg-gray-50 shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gray-100 text-gray-800 font-bold text-center py-4 text-xl tracking-wide border-b border-gray-300">昼間部</div>
          <div className="overflow-x-auto w-full min-w-0">
            <Table className="w-full min-w-0 border-collapse table-fixed text-xs sm:text-[clamp(0.7rem,1vw,1.1rem)]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="border border-gray-300 bg-gray-100 p-1 sm:p-3 text-center font-bold text-gray-700 w-full sm:whitespace-nowrap sm:w-[90px] sm:min-w-[70px] sm:max-w-[110px] text-[10px] sm:text-[clamp(1rem,1.5vw,1.3rem)] break-all whitespace-normal">
                    時限
                  </TableHead>
                  {regularClassGroups.map((group) => (
                    <TableHead
                      key={group}
                      className="border border-gray-300 bg-gray-100 p-1 sm:p-3 text-center font-bold text-gray-700 w-full sm:whitespace-nowrap sm:w-[140px] sm:min-w-[100px] sm:max-w-[160px] text-[10px] sm:text-[clamp(1rem,1.5vw,1.3rem)] break-all whitespace-normal"
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
                  <TableRow key={timeSlot} className="hover:bg-gray-200 transition-all duration-150">
                    <TableCell className="border border-gray-300 bg-white p-1 sm:p-3 text-center font-semibold text-gray-800 w-full sm:whitespace-nowrap sm:w-[24px] sm:min-w-[18px] sm:max-w-[24px] overflow-hidden text-[10px] break-all whitespace-normal">
                      {timeSlot === "自　習" ? (
                        <span className="text-[6px] sm:text-base font-semibold text-center block">
                          <span className="sm:hidden">マイスタ</span>
                          <span className="hidden sm:inline">マイスタディ</span>
                        </span>
                      ) : <span className="text-[9px] sm:text-base font-semibold">{timeSlot}</span>}
                    </TableCell>
                    {regularClassGroups.map((group) =>
                      React.cloneElement(renderCell(timeSlot as TimeSlot, group), {
                        className: `border border-gray-300 p-1 sm:p-3 text-center align-middle w-full sm:w-[140px] sm:min-w-[100px] sm:max-w-[160px] text-[10px] sm:text-[clamp(1rem,1.5vw,1.3rem)] font-medium bg-white transition-all duration-200 break-all whitespace-normal` +
                          (renderCell(timeSlot as TimeSlot, group).props.className ? ` ${renderCell(timeSlot as TimeSlot, group).props.className.replace(/rounded-[a-z0-9]+|rounded-xl|rounded-2xl|rounded|bg-pink-[0-9]+|bg-pink|text-pink-[0-9]+|text-pink|border-pink-[0-9]+|border-pink|bg-orange-[0-9]+|bg-orange|text-orange-[0-9]+|text-orange|border-orange-[0-9]+|border-orange|bg-purple-[0-9]+|bg-purple|text-purple-[0-9]+|text-purple|border-purple-[0-9]+|border-purple/g, "")}` : "")
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
      <div className="w-full font-sans">
        <div className="border border-gray-300 bg-gray-50 shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gray-100 text-gray-800 font-bold text-center py-4 text-xl tracking-wide border-b border-gray-300">夜間部</div>
          <div className="overflow-x-auto w-full min-w-0">
            <Table className="w-full min-w-0 border-collapse table-fixed text-[clamp(0.7rem,1vw,1.1rem)]">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="border border-gray-300 bg-gray-100 p-3 text-center font-bold text-gray-700 w-full sm:whitespace-nowrap sm:w-[140px] sm:min-w-[100px] sm:max-w-[160px] text-[12px] sm:text-[clamp(1rem,1.5vw,1.3rem)] break-all whitespace-normal">
                    時限
                  </TableHead>
                  {nursingClassGroups.map((group) => (
                    <TableHead
                      key={group}
                      className="border border-gray-300 bg-gray-100 p-3 text-center font-bold text-gray-700 w-full sm:whitespace-nowrap sm:w-[140px] sm:min-w-[100px] sm:max-w-[160px] text-[12px] sm:text-[clamp(1rem,1.5vw,1.3rem)] break-all whitespace-normal"
                    >
                      <div className="truncate">{group}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {["5限目","6限目","自　習","補　習","再試験"].map((timeSlot) => (
                  <TableRow key={timeSlot} className="hover:bg-gray-200 transition-all duration-150">
                    <TableCell className="border border-gray-300 bg-white p-3 text-center font-semibold text-gray-800 w-full sm:whitespace-nowrap sm:w-[140px] sm:min-w-[100px] sm:max-w-[160px] text-[12px] sm:text-[clamp(1rem,1.5vw,1.3rem)] break-all whitespace-normal">
                      {timeSlot === "自　習" ? "マイスタディ" : timeSlot}
                    </TableCell>
                    {nursingClassGroups.map((group) =>
                      React.cloneElement(renderCell(timeSlot as TimeSlot, group), {
                        className: `border border-gray-300 p-3 text-center align-middle w-full sm:w-[140px] sm:min-w-[100px] sm:max-w-[160px] text-[12px] sm:text-[clamp(1rem,1.5vw,1.3rem)] font-medium bg-white transition-all duration-200 break-all whitespace-normal` +
                          (renderCell(timeSlot as TimeSlot, group).props.className ? ` ${renderCell(timeSlot as TimeSlot, group).props.className.replace(/rounded-[a-z0-9]+|rounded-xl|rounded-2xl|rounded|bg-pink-[0-9]+|bg-pink|text-pink-[0-9]+|text-pink|border-pink-[0-9]+|border-pink|bg-orange-[0-9]+|bg-orange|text-orange-[0-9]+|text-orange|border-orange-[0-9]+|border-orange|bg-purple-[0-9]+|bg-purple|text-purple-[0-9]+|text-purple|border-purple-[0-9]+|border-purple/g, "")}` : "")
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
