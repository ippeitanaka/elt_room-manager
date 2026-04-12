"use client"

import React, { useEffect, useState } from "react"
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
  if (classroom === "5F大教室") {
    return { backgroundColor: "hsl(35, 90%, 89%)" };
  }
  const hash = hashString(classroom);
  const hue = hash % 360;
  const saturation = 58;
  const lightness = 92;
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
  } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingComment, setEditingComment] = useState<{
    timeSlot: TimeSlot;
    group: string;
    comment: string;
  } | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const updateMatch = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches)
    }

    updateMatch(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatch);
      return () => mediaQuery.removeEventListener("change", updateMatch);
    }

    // Safari fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mqAny = mediaQuery as any;
    mqAny.addListener?.(updateMatch);
    return () => mqAny.removeListener?.(updateMatch);
  }, []);

  const getCellContext = (timeSlot: TimeSlot, group: string) => {
    const classroom = data[timeSlot]?.[group] || null;
    const isSpecialTimeSlot = ["マイスタ（午前）", "マイスタ（午後）", "補習（午前）", "補習（午後）", "再試験"].includes(timeSlot);
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

    return {
      classroom,
      isSpecialTimeSlot,
      comment,
      hasComment,
      lectureName,
      teacherName,
    }
  }

  const regularTimeSlotsOrder: TimeSlot[] = [
    "1限目",
    "2限目",
    "昼食",
    "3限目",
    "4限目",
    "自　習",
    "補　習",
    "再試験",
  ];

  const nursingTimeSlotsOrder: TimeSlot[] = [
    "5限目",
    "6限目",
    "マイスタ（午前）",
    "マイスタ（午後）",
    "補習（午前）",
    "補習（午後）",
    "再試験",
  ];

  if (!data) {
    return <div>データが利用できません。</div>;
  }

  const findComment = (timeSlot: string, group: string) =>
    comments.find((commentItem) => commentItem.time_slot === timeSlot && commentItem.class_group === group);

  const getDynamicFontStyle = (text: string | null | undefined): React.CSSProperties => {
    if (isMobile) {
      return { fontSize: "0.7rem" };
    }

    const cleaned = (text ?? "").replace(/\s+/g, "");
    const length = cleaned.length;

    if (length === 0) {
      return { fontSize: "clamp(0.72rem, 2.6vw, 0.98rem)" };
    }

    if (length <= 6) {
      return { fontSize: "clamp(0.95rem, 3.6vw, 1.28rem)" };
    }
    if (length <= 10) {
      return { fontSize: "clamp(0.9rem, 3.2vw, 1.15rem)" };
    }
    if (length <= 14) {
      return { fontSize: "clamp(0.85rem, 3vw, 1.08rem)" };
    }
    if (length <= 20) {
      return { fontSize: "clamp(0.8rem, 2.7vw, 1.02rem)" };
    }
    if (length <= 26) {
      return { fontSize: "clamp(0.75rem, 2.4vw, 0.96rem)" };
    }
    if (length <= 32) {
      return { fontSize: "clamp(0.7rem, 2.2vw, 0.9rem)" };
    }

    return { fontSize: "clamp(0.66rem, 2vw, 0.86rem)" };
  }

  const handleCellClick = (timeSlot: TimeSlot, group: string, classroom: string | null) => {
    if (!isAdminView && classroom) {
      const commentItem = findComment(timeSlot, group);
      if (commentItem) {
        setActiveComment({
          classroom: commentItem.classroom,
          comment: commentItem.comment,
          timeSlot,
          classGroup: group,
        });
        setModalOpen(true);
      }
    }
  };

  const handleCommentEdit = (timeSlot: TimeSlot, group: string) => {
    const commentItem = findComment(timeSlot, group);
    setEditingComment({
      timeSlot,
      group,
      comment: commentItem ? commentItem.comment : "",
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

  const renderCell = (timeSlot: TimeSlot, group: string) => {
    const { classroom, isSpecialTimeSlot, comment, hasComment, lectureName, teacherName } = getCellContext(timeSlot, group);

    if (isAdminView && editingComment && editingComment.timeSlot === timeSlot && editingComment.group === group) {
      return (
        <TableCell
          key={`${timeSlot}-${group}`}
          className="border border-amber-100 align-top bg-white px-1.5 py-2 text-center text-[10px] sm:px-3 sm:py-4 sm:text-sm"
          style={getClassroomColorStyle(classroom || "")}
        >
          <div className="space-y-2 text-center">
            <LectureInfoCell lectureName={lectureName} teacherName={teacherName} isMobile={isMobile} />
            <div
              className="mobile-ellipsis font-semibold leading-tight tracking-tight text-center text-slate-800"
              style={getDynamicFontStyle(classroom)}
              title={classroom || "---"}
            >
              {classroom || "---"}
            </div>
            <Textarea
              value={editingComment.comment}
              onChange={(e) => setEditingComment({ ...editingComment, comment: e.target.value })}
              placeholder="コメントを入力"
              className="min-h-[60px] border-amber-200 bg-amber-50/70 text-xs sm:min-h-[80px] sm:text-sm"
            />
            <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-2">
              <Button size="sm" onClick={handleCommentSave} className="flex-1 bg-amber-500 text-white hover:bg-amber-600">
                保存
              </Button>
              <Button size="sm" variant="outline" onClick={handleCommentCancel} className="flex-1 bg-white">
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

    const hasLectureInfo = !!(lectureName || teacherName);
    const alignClass = hasLectureInfo || isAdminView ? "align-top" : "align-middle";
    
    const className = [
      `border border-amber-100 ${alignClass} bg-white px-1 py-1.5 text-center text-[10px] transition-colors duration-150 sm:px-3 sm:py-4 sm:text-sm`,
      !isAdminView && hasComment ? "cursor-pointer" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <TableCell
        key={`${timeSlot}-${group}`}
        className={className}
        style={getClassroomColorStyle(classroom || "")}
        onClick={() => !isAdminView && handleCellClick(timeSlot, group, classroom)}
      >
        {isAdminView ? (
          <div className="space-y-2 text-center">
            <LectureInfoCell lectureName={lectureName} teacherName={teacherName} isMobile={isMobile} />
            <Select
              value={classroom || undefined}
              onValueChange={(value: string) =>
                onCellChange(timeSlot, group, value === "---" ? null : (value as ClassroomType))
              }
              disabled={!isSpecialTimeSlot && !isAdminView}
            >
              <SelectTrigger className="w-full text-[10px] sm:text-sm">
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
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-[10px] sm:text-sm"
                  onClick={() => handleCommentEdit(timeSlot, group)}
                >
                  {hasComment ? "コメント編集" : "コメント追加"}
                </Button>
              </div>
            )}
            {hasComment && comment && (
              <p className="mobile-ellipsis text-center text-[9px] text-amber-700 sm:text-xs" title={comment.comment}>{comment.comment}</p>
            )}
          </div>
        ) : (
          <div className={`text-center ${lectureName || teacherName ? "space-y-1" : "flex items-center justify-center h-full"}`}>
            <LectureInfoCell lectureName={lectureName} teacherName={teacherName} isMobile={isMobile} />
            <div className={`font-medium ${classroom ? "text-slate-800" : "text-slate-400"} text-center`}>
              <span
                className="mobile-ellipsis block whitespace-nowrap leading-tight tracking-tight"
                title={classroom || "---"}
                style={getDynamicFontStyle(classroom)}
              >
                {classroom || "---"}
              </span>
            </div>
            {hasComment && (
              <div className="text-[9px] text-amber-700 sm:text-xs text-center">コメントあり</div>
            )}
          </div>
        )}
      </TableCell>
    );
  };

  return (
    <div className="w-full space-y-5 sm:space-y-7">
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

      <div className="space-y-5 sm:space-y-6">
        <div className="surface-card overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 text-center text-sm font-bold tracking-wide text-white sm:px-6 sm:py-4 sm:text-xl">昼間部</div>
          <div className="data-table-shell rounded-none border-x-0 border-b-0 border-t border-amber-100 shadow-none">
            <Table className="min-w-[860px] border-collapse table-fixed text-[10px] sm:text-sm">
              <TableHeader>
                <TableRow className="bg-amber-50/80 hover:bg-amber-50/80">
                  <TableHead className="border border-amber-100 bg-amber-50/80 px-1 py-2 text-center text-[10px] font-bold text-slate-600 sm:px-3 sm:py-3 sm:text-sm min-w-[60px] sm:min-w-[80px]">
                    時限
                  </TableHead>
                  {regularClassGroups.map((group) => (
                    <TableHead
                      key={group}
                      className="border border-amber-100 bg-amber-50/80 px-1 py-2 text-center text-[10px] font-bold text-slate-600 sm:px-3 sm:py-3 sm:text-sm min-w-[80px] sm:min-w-[120px]"
                    >
                      <div className="mobile-ellipsis" title={group}>
                        {group}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {regularTimeSlotsOrder.map((timeSlot) => (
                  <TableRow key={timeSlot} className="hover:bg-amber-50/40">
                    <TableCell className="border border-amber-100 bg-white px-1 py-2 text-center text-[10px] font-semibold text-slate-700 sm:px-3 sm:py-3 sm:text-sm min-w-[60px] sm:min-w-[80px]">
                      {timeSlot === "自　習" ? "マイスタ" : timeSlot}
                    </TableCell>
                    {regularClassGroups.map((group) => renderCell(timeSlot as TimeSlot, group))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="surface-card overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 text-center text-sm font-bold tracking-wide text-white sm:px-6 sm:py-4 sm:text-xl">夜間部</div>
          <div className="data-table-shell rounded-none border-x-0 border-b-0 border-t border-amber-100 shadow-none">
            <Table className="min-w-[980px] border-collapse table-fixed text-[10px] sm:text-sm">
              <TableHeader>
                <TableRow className="bg-amber-50/80 hover:bg-amber-50/80">
                  <TableHead className="border border-amber-100 bg-amber-50/80 px-1 py-2 text-center text-[10px] font-bold text-slate-600 sm:px-3 sm:py-3 sm:text-sm min-w-[80px] sm:min-w-[120px]">
                    時限
                  </TableHead>
                  {nursingClassGroups.map((group) => (
                    <TableHead
                      key={group}
                      className="border border-amber-100 bg-amber-50/80 px-1 py-2 text-center text-[10px] font-bold text-slate-600 sm:px-3 sm:py-3 sm:text-sm min-w-[100px] sm:min-w-[140px]"
                    >
                      <div className="mobile-ellipsis" title={group}>
                        {group}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {nursingTimeSlotsOrder.map((timeSlot) => (
                  <TableRow key={timeSlot} className="hover:bg-amber-50/40">
                    <TableCell className="border border-amber-100 bg-white px-1 py-2 text-center text-[10px] font-semibold text-slate-700 sm:px-3 sm:py-3 sm:text-sm min-w-[80px] sm:min-w-[120px]">
                      {timeSlot}
                    </TableCell>
                    {nursingClassGroups.map((group) => renderCell(timeSlot as TimeSlot, group))}
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
