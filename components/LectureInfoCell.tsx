import React from "react"

export interface LectureInfoCellProps {
  lectureName?: string | null
  teacherName?: string | null
}

export const LectureInfoCell: React.FC<LectureInfoCellProps> = ({ lectureName, teacherName }) => {
  const getLectureFontStyle = (text: string): React.CSSProperties => {
    const cleaned = text.replace(/\s+/g, "");
    const length = cleaned.length;

    if (length === 0) {
      return { fontSize: "clamp(0.75rem, 2.6vw, 1rem)" };
    }

    if (length <= 4) {
      return { fontSize: "clamp(0.9rem, 3.4vw, 1.18rem)" };
    }
    if (length <= 8) {
      return { fontSize: "clamp(0.85rem, 3vw, 1.08rem)" };
    }
    if (length <= 12) {
      return { fontSize: "clamp(0.8rem, 2.7vw, 1.02rem)" };
    }
    if (length <= 18) {
      return { fontSize: "clamp(0.75rem, 2.4vw, 0.96rem)" };
    }

    return { fontSize: "clamp(0.7rem, 2.1vw, 0.9rem)" };
  };

  if (!lectureName && !teacherName) return null
  return (
    <div className="mt-1 leading-tight text-center text-gray-700 space-y-1">
      {lectureName && (
        <div
          className="font-semibold whitespace-nowrap"
          style={getLectureFontStyle(lectureName)}
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
