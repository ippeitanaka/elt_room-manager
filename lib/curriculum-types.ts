export interface CurriculumEntry {
  date: string
  day_of_week: string
  time_slot: string
  "1A_subject": string | null
  "1A_teacher": string | null
  "1A_periods": number | null
  "1B_subject": string | null
  "1B_teacher": string | null
  "1B_periods": number | null
  "1N_subject": string | null
  "1N_teacher": string | null
  "1N_periods": number | null
  "2A_subject": string | null
  "2A_teacher": string | null
  "2A_periods": number | null
  "2B_subject": string | null
  "2B_teacher": string | null
  "2B_periods": number | null
  "2N_subject": string | null
  "2N_teacher": string | null
  "2N_periods": number | null
  "3A_subject": string | null
  "3A_teacher": string | null
  "3A_periods": number | null
  "3B_subject": string | null
  "3B_teacher": string | null
  "3B_periods": number | null
  "3N_subject": string | null
  "3N_teacher": string | null
  "3N_periods": number | null
}

export interface ClassInfo {
  subject: string
  teacher: string
  periods: number
}

export interface DailySchedule {
  [timeSlot: string]: {
    [classGroup: string]: ClassInfo
  }
}

// 教室割り当てのルール
export const CLASSROOM_RULES = {
  PRACTICAL_ROOMS: ["1F実習室", "2F実習室", "3F実習室"],
  SMALL_LECTURE_ROOMS: ["3F小教室", "4F小教室"],
  LARGE_LECTURE_ROOMS: ["4F大教室", "5F大教室", "7F大教室"],

  // 実習科目かどうかを判定
  isPracticalSubject(subject: string): boolean {
    return subject.includes("実習")
  },

  // 合同授業かどうかを判定
  isJointClass(schedule: DailySchedule, timeSlot: string, subject: string): boolean {
    const classesWithSameSubject = Object.entries(schedule[timeSlot] || {}).filter(
      ([_, info]) => info.subject === subject,
    )
    return classesWithSameSubject.length > 1
  },
}

// 利用可能な教室リスト
export const AVAILABLE_CLASSROOMS = [
  "1F実習室",
  "2F実習室",
  "3F実習室",
  "3F小教室",
  "4F小教室",
  "4F大教室",
  "5F大教室",
  "7F大教室",
] as const

export type ClassroomType = (typeof AVAILABLE_CLASSROOMS)[number]
