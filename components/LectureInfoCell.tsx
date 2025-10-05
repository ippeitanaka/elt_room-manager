import React from "react"

export interface LectureInfoCellProps {
  lectureName?: string | null
  teacherName?: string | null
}

export const LectureInfoCell: React.FC<LectureInfoCellProps> = ({ lectureName, teacherName }) => {
  if (!lectureName && !teacherName) return null
  return (
    <div className="mt-1 leading-tight text-center text-gray-700 space-y-1">
      {lectureName && (
        <div
          className="font-semibold whitespace-nowrap"
          style={{ fontSize: "clamp(0.62rem, 1.9vw, 0.85rem)" }}
        >
          {lectureName === "マイスタディ" ? (
            <>
              <span className="sm:hidden">マイスタ</span>
              <span className="hidden sm:inline">マイスタディ</span>
            </>
          ) : (
            lectureName
          )}
        </div>
      )}
      {teacherName && <div className="text-gray-500 text-[0.68rem] sm:text-xs">{teacherName}</div>}
    </div>
  )
}
