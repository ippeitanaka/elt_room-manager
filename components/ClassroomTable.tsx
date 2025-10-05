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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const updateMatch = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

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
    };
  };

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
      return { fontSize: "0.85rem" };
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
  };

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
          className="border border-gray-300 align-top bg-white px-2 py-3 sm:px-3 sm:py-4 text-center text-xs sm:text-sm"
          style={getClassroomColorStyle(classroom || "")}
        >
          <div className="space-y-2 text-center">
            <LectureInfoCell lectureName={lectureName} teacherName={teacherName} isMobile={isMobile} />
            <div
              className="font-semibold text-green-700 whitespace-normal sm:whitespace-nowrap leading-tight tracking-tight text-center"
              style={getDynamicFontStyle(classroom)}
            >
              {classroom || "---"}
            </div>
            <Textarea
              value={editingComment.comment}
              onChange={(e) => setEditingComment({ ...editingComment, comment: e.target.value })}
              placeholder="コメントを入力"
              className="min-h-[80px] text-sm sm:text-base bg-green-50 border-green-200 focus:ring-2 focus:ring-green-200"
            />
            <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-2">
              <Button size="sm" onClick={handleCommentSave} className="flex-1 bg-green-500 text-white hover:bg-green-600">
                保存
              </Button>
              <Button size="sm" variant="outline" onClick={handleCommentCancel} className="flex-1 border-green-300 text-green-700">
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

    const className = [
      "border border-gray-300 align-top bg-white px-2 py-3 sm:px-3 sm:py-4 text-center text-xs sm:text-sm transition-colors duration-150",
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
              <SelectTrigger className="w-full text-xs sm:text-sm">
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
                  className="flex-1 text-xs sm:text-sm"
                  onClick={() => handleCommentEdit(timeSlot, group)}
                >
                  {hasComment ? "コメント編集" : "コメント追加"}
                </Button>
              </div>
            )}
            {hasComment && comment && (
              <p className="text-center text-[11px] text-green-700 sm:text-xs">{comment.comment}</p>
            )}
          </div>
        ) : (
          <div className="space-y-1 text-center">
            <LectureInfoCell lectureName={lectureName} teacherName={teacherName} isMobile={isMobile} />
            <div className={`font-medium ${classroom ? "text-gray-800" : "text-gray-400"} text-center`}>
              <span
                className="block whitespace-normal sm:whitespace-nowrap leading-tight tracking-tight"
                title={classroom || "---"}
                style={getDynamicFontStyle(classroom)}
              >
                {classroom || "---"}
              </span>
            </div>
            {hasComment && (
              <div className="text-[11px] text-green-600 sm:text-xs text-center">コメントあり（タップで表示）</div>
            )}
          </div>
        )}
      </TableCell>
    );
  };

  return (
    <div className="w-full space-y-8 font-sans">
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

      <div className="space-y-8">
        <div className="border border-gray-300 bg-gray-50 shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gray-100 text-gray-800 font-bold text-center py-3 sm:py-4 text-lg sm:text-xl tracking-wide border-b border-gray-300">昼間部</div>
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse table-fixed text-xs sm:text-sm">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="border border-gray-300 bg-gray-100 px-2 py-3 sm:px-3 text-center font-bold text-gray-700 text-xs sm:text-sm min-w-[80px]">
                    時限
                  </TableHead>
                  {regularClassGroups.map((group) => (
                    <TableHead
                      key={group}
                      className="border border-gray-300 bg-gray-100 px-2 py-3 sm:px-3 text-center font-bold text-gray-700 text-xs sm:text-sm min-w-[120px]"
                    >
                      <div className="truncate" title={group}>
                        {group}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {regularTimeSlotsOrder.map((timeSlot) => (
                  <TableRow key={timeSlot} className="hover:bg-gray-100">
                    <TableCell className="border border-gray-300 bg-white px-2 py-3 sm:px-3 text-center font-semibold text-gray-800 text-xs sm:text-sm min-w-[80px]">
                      {timeSlot === "自　習" ? "マイスタディ" : timeSlot}
                    </TableCell>
                    {regularClassGroups.map((group) => renderCell(timeSlot as TimeSlot, group))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="border border-gray-300 bg-gray-50 shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gray-100 text-gray-800 font-bold text-center py-3 sm:py-4 text-lg sm:text-xl tracking-wide border-b border-gray-300">夜間部</div>
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse table-fixed text-xs sm:text-sm">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="border border-gray-300 bg-gray-100 px-2 py-3 sm:px-3 text-center font-bold text-gray-700 text-xs sm:text-sm min-w-[120px]">
                    時限
                  </TableHead>
                  {nursingClassGroups.map((group) => (
                    <TableHead
                      key={group}
                      className="border border-gray-300 bg-gray-100 px-2 py-3 sm:px-3 text-center font-bold text-gray-700 text-xs sm:text-sm min-w-[140px]"
                    >
                      <div className="truncate" title={group}>
                        {group}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {nursingTimeSlotsOrder.map((timeSlot) => (
                  <TableRow key={timeSlot} className="hover:bg-gray-100">
                    <TableCell className="border border-gray-300 bg-white px-2 py-3 sm:px-3 text-center font-semibold text-gray-800 text-xs sm:text-sm min-w-[120px]">
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
