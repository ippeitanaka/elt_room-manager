import React from "react"

export interface LectureInfoCellProps {
  lectureName?: string | null
  teacherName?: string | null
}

export const LectureInfoCell: React.FC<LectureInfoCellProps> = ({ lectureName, teacherName }) => {
  if (!lectureName && !teacherName) return null
  return (
    <div className="text-xs sm:text-sm text-gray-700 mt-1 whitespace-pre-line leading-tight">
      {lectureName && <div className="font-semibold">{lectureName === "マイスタディ" ? <><span className="sm:hidden">マイスタ</span><span className="hidden sm:inline">マイスタディ</span></> : lectureName}</div>}
      {teacherName && <div className="text-gray-500">{teacherName}</div>}
    </div>
  )
}
