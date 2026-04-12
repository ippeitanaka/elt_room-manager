import React, { useEffect, useRef, useState } from "react"

export interface LectureInfoCellProps {
  lectureName?: string | null
  teacherName?: string | null
  isMobile?: boolean
}

export const LectureInfoCell: React.FC<LectureInfoCellProps> = ({ lectureName, teacherName, isMobile = false }) => {
  const lectureNameRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState<number>(16) // 初期値: 16px (1rem)

  useEffect(() => {
    if (!lectureNameRef.current || isMobile || !lectureName) return

    const adjustFontSize = () => {
      const element = lectureNameRef.current
      if (!element) return

      const parentWidth = element.parentElement?.clientWidth
      if (!parentWidth) return

      // パディングを考慮した利用可能な幅 (親要素の95%程度を使用)
      const availableWidth = parentWidth * 0.95
      
      let currentFontSize = 16 // 1remの基準値
      const minFontSize = 10 // 最小フォントサイズ
      const maxFontSize = 18 // 最大フォントサイズ

      // 一時的に最大サイズで測定
      element.style.fontSize = `${maxFontSize}px`
      
      // スクロール幅が利用可能幅を超える場合、フォントサイズを調整
      if (element.scrollWidth > availableWidth) {
        // 比率計算でフォントサイズを決定
        currentFontSize = Math.max(
          minFontSize,
          Math.floor((availableWidth / element.scrollWidth) * maxFontSize)
        )
      } else {
        currentFontSize = maxFontSize
      }

      setFontSize(currentFontSize)
    }

    // 初回調整
    adjustFontSize()

    // リサイズ時の調整
    const resizeObserver = new ResizeObserver(adjustFontSize)
    if (lectureNameRef.current.parentElement) {
      resizeObserver.observe(lectureNameRef.current.parentElement)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [lectureName, isMobile])

  if (!lectureName && !teacherName) return null
  
  return (
    <div className="mt-1 space-y-1 text-center leading-tight text-slate-600">
      {lectureName && (
        <div
          ref={lectureNameRef}
          className="mobile-ellipsis whitespace-nowrap"
          style={isMobile ? { fontSize: "0.64rem" } : { fontSize: `${fontSize}px` }}
          title={lectureName}
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
      {teacherName && (
        <div className="mobile-ellipsis text-[0.58rem] text-slate-400 sm:text-xs" title={teacherName}>
          {teacherName}
        </div>
      )}
    </div>
  )
}
