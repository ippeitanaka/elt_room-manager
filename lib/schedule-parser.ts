import { parse } from "csv-parse/sync"

export interface ScheduleRow {
  id: string
  日付: string
  曜日: string
  時限: string
  "1年Aクラスの授業内容": string
  "1年Aクラス担当講師名": string
  "1年Aクラスコマ数": string
  "1年Bクラスの授業内容": string
  "1年Bクラス担当講師名": string
  "1年Bクラスコマ数": string
  "1年Nクラスの授業内容": string
  "1年Nクラス担当講師名": string
  "1年Nクラスコマ数": string
  "2年Aクラスの授業内容": string
  "2年Aクラス担当講師名": string
  "2年Aクラスコマ数": string
  "2年Bクラスの授業内容": string
  "2年Bクラス担当講師名": string
  "2年Bクラスコマ数": string
  "2年Nクラスの授業内容": string
  "2年Nクラス担当講師名": string
  "2年Nクラスコマ数": string
  "3年Aクラスの授業内容": string
  "3年Aクラス担当講師名": string
  "3年Aクラスコマ数": string
  "3年Bクラスの授業内容": string
  "3年Bクラス担当講師名": string
  "3年Bクラスコマ数": string
  "3年Nクラスの授業内容": string
  "3年Nクラス担当講師名": string
  "3年Nクラスコマ数": string
  "3年各種模擬試験": string
  時間: string
}

export interface ClassInfo {
  className: string
  subject: string
  teacher: string
  periods: string
}

export interface DailySchedule {
  date: string
  dayOfWeek: string
  timeSlot: string
  time: string
  classes: ClassInfo[]
}

export async function fetchScheduleData(): Promise<ScheduleRow[]> {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E3%82%B9%E3%82%B1%E3%82%B7%E3%82%99%E3%83%A5%E3%83%BC%E3%83%AB_rows-YtpxrQ0w1itvqe0xK5OgFDHWb3Zo66.csv",
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule data: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    }) as ScheduleRow[]

    return records
  } catch (error) {
    console.error("Error fetching schedule data:", error)
    throw error
  }
}

export function processScheduleData(rows: ScheduleRow[]): DailySchedule[] {
  return rows.map((row) => {
    const classes: ClassInfo[] = []

    // 各クラスの情報を抽出
    const classNames = ["1-A", "1-B", "1-N", "2-A", "2-B", "2-N", "3-A", "3-B", "3-N"]

    classNames.forEach((className) => {
      const year = className.charAt(0)
      const section = className.charAt(2)

      const subjectKey = `${year}年${section}クラスの授業内容` as keyof ScheduleRow
      const teacherKey = `${year}年${section}クラス担当講師名` as keyof ScheduleRow
      const periodsKey = `${year}年${section}クラスコマ数` as keyof ScheduleRow

      const subject = row[subjectKey]
      const teacher = row[teacherKey]
      const periods = row[periodsKey]

      if (subject && subject.trim() !== "") {
        classes.push({
          className,
          subject,
          teacher,
          periods,
        })
      }
    })

    return {
      date: row.日付,
      dayOfWeek: row.曜日,
      timeSlot: row.時限,
      time: row.時間,
      classes,
    }
  })
}

export function filterScheduleByDate(schedules: DailySchedule[], date: string): DailySchedule[] {
  return schedules.filter((schedule) => schedule.date === date)
}
