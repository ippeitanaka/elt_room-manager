import { supabase } from "./supabase"
import { TimeSlot } from "./classrooms"
import { format, parse } from "date-fns"

// 1-A → 1年Aクラス などのマッピング
const classGroupToScheduleColumn = (classGroup: string) => {
  // 例: 1-A → 1年Aクラス, 2-B → 2年Bクラス, 3-N → 3年Nクラス
  const match = classGroup.match(/(\d)-(\w)/)
  if (!match) return null
  const [_, grade, group] = match
  // Nクラスは特別表記
  if (group === "N") return `${grade}年Nクラス`
  return `${grade}年${group}クラス`
}

export interface ScheduleLectureInfo {
  time_slot: string // 1限目など
  class_group: string // 1-Aなど
  lecture_name: string | null
  teacher_name: string | null
}

export async function fetchScheduleLectures(date: string): Promise<ScheduleLectureInfo[]> {
  // まずyyyy-MM-dd形式で検索
  let { data, error } = await supabase
    .from("スケジュール")
    .select("*")
    .eq("日付", date)

  // データがなければyyyy/MM/dd形式でも検索
  if ((!data || data.length === 0) && date.includes("-")) {
    try {
      const parsed = parse(date, "yyyy-MM-dd", new Date())
      const slashDate = format(parsed, "yyyy/MM/dd")
      const res2 = await supabase
        .from("スケジュール")
        .select("*")
        .eq("日付", slashDate)
      if (res2.data && res2.data.length > 0) {
        data = res2.data
        error = res2.error
      }
    } catch (e) {
      // パース失敗時は何もしない
    }
  }

  if (error) throw error
  if (!data) return []

  // 各行（時限ごと）について、各class_groupごとに講義名・講師名を抽出
  const result: ScheduleLectureInfo[] = []
  // 時限の数値→ラベル変換
  const slotMap: Record<string, string> = {
    "1": "1限目",
    "2": "2限目",
    "3": "3限目",
    "4": "4限目",
    "5": "5限目",
    "6": "6限目",
    "7": "自　習",
    "8": "補　習",
    "9": "再試験",
    // 旧マッピングも残す（自習・補習・再試験）
    "自　習": "自　習",
    "補　習": "補　習",
    "再試験": "再試験",
  }
  for (const row of data) {
    for (const classGroup of [
      "1-A","1-B","2-A","2-B","3-A","3-B","1-N","2-N","3-N"
    ]) {
      const colPrefix = classGroupToScheduleColumn(classGroup)
      if (!colPrefix) continue
      const lecture = row[`${colPrefix}の授業内容`] ?? null
      const teacher = row[`${colPrefix}担当講師名`] ?? null
      // 時限の変換
      let slotLabel = row["時限"]
      if (slotMap[slotLabel]) slotLabel = slotMap[slotLabel]
      result.push({
        time_slot: slotLabel,
        class_group: classGroup,
        lecture_name: lecture,
        teacher_name: teacher,
      })
    }
  }
  return result
}
