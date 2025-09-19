
"use client"
export const dynamic = "force-dynamic"
import { useEffect, useState } from "react"


interface DayScheduleItem {
  date: string
  time_slot: string
  period_num: number
  class_group: string
  subject?: string | null
  instructor?: string | null
  room_name?: string | null
  comment?: string | null
}

function getQueryDate(): string | undefined {
  if (typeof window === "undefined") return undefined
  const url = new URL(window.location.href)
  return url.searchParams.get("date") || undefined
}

export default function DayPage() {
  const [items, setItems] = useState<DayScheduleItem[]>([])
  console.log("items", items)
  const [date, setDate] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      const queryDate = getQueryDate()
      const res = await fetch(`/api/day-schedule${queryDate ? `?date=${queryDate}` : ""}`)
      if (!res.ok) {
        setError("データ取得エラー")
        setLoading(false)
        return
      }
      const json = await res.json()
      setItems(json.items || [])
      setDate(json.date || "")
      setLoading(false)
    }
    fetchData()
  }, [])

  // クラスごとにまとめる
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.class_group]) acc[item.class_group] = []
    acc[item.class_group].push(item)
    return acc
  }, {} as Record<string, DayScheduleItem[]>)

  return (
    <div className="max-w-2xl mx-auto p-4">
      <pre style={{ fontSize: "10px", color: "red" }}>{JSON.stringify(items, null, 2)}</pre>
      <h1 className="text-xl font-bold mb-4 text-pink-700">本日の教室割当</h1>
      <div className="mb-2 text-sm text-gray-500">{date}</div>
      {loading ? (
        <div>読み込み中...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-8">
          {Object.keys(grouped).sort().map((classGroup) => (
            <div key={classGroup}>
              <div className="font-bold text-pink-600 mb-2">{classGroup}</div>
              <div className="space-y-2">
                {grouped[classGroup].sort((a, b) => (a.period_num ?? 0) - (b.period_num ?? 0)).map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold text-xs ${!item.subject?.trim() ? "text-gray-400" : "text-gray-900"}`}>
                        {item.subject?.trim() ? item.subject : "講義未設定"}
                      </span>
                      {item.instructor?.trim() && (
                        <span className="text-xs text-gray-500 ml-2">{item.instructor}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-pink-700">{item.room_name || "—"}</span>
                      <span className="text-xs bg-pink-100 text-pink-700 rounded px-2 py-0.5 ml-2">{item.time_slot}</span>
                    </div>
                    {item.comment && (
                      <div className="text-xs text-gray-400 mt-1">{item.comment}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
