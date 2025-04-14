import { supabase } from "./supabase"
import type { CurriculumEntry, DailySchedule, ClassroomType } from "./curriculum-types"
import { CLASSROOM_RULES } from "./curriculum-types"

export async function fetchCurriculumForDate(date: string): Promise<CurriculumEntry[]> {
  const { data, error } = await supabase.from("カリキュラム").select("*").eq("date", date).order("time_slot")

  if (error) {
    console.error("Error fetching curriculum:", error)
    throw new Error(`カリキュラムの取得に失敗しました: ${error.message}`)
  }

  return data || []
}

function convertToSchedule(entries: CurriculumEntry[]): DailySchedule {
  const schedule: DailySchedule = {}

  entries.forEach((entry) => {
    const timeSlot = entry.time_slot
    if (!schedule[timeSlot]) {
      schedule[timeSlot] = {}
    }

    // 各クラスのデータを処理
    const classes = ["1A", "1B", "1N", "2A", "2B", "2N", "3A", "3B", "3N"]
    classes.forEach((classCode) => {
      const subject = entry[`${classCode}_subject` as keyof CurriculumEntry]
      const teacher = entry[`${classCode}_teacher` as keyof CurriculumEntry]
      const periods = entry[`${classCode}_periods` as keyof CurriculumEntry]

      if (subject && teacher) {
        schedule[timeSlot][classCode] = {
          subject: subject as string,
          teacher: teacher as string,
          periods: periods as number,
        }
      }
    })
  })

  return schedule
}

function assignClassrooms(schedule: DailySchedule): Record<string, Record<string, ClassroomType>> {
  const assignments: Record<string, Record<string, ClassroomType>> = {}
  const usedClassrooms: Set<ClassroomType> = new Set()

  // 各時限ごとに教室を割り当て
  Object.entries(schedule).forEach(([timeSlot, classes]) => {
    assignments[timeSlot] = {}
    usedClassrooms.clear()

    // まず実習科目を割り当て
    Object.entries(classes).forEach(([classGroup, info]) => {
      if (CLASSROOM_RULES.isPracticalSubject(info.subject)) {
        // 実習室を割り当て
        for (const room of CLASSROOM_RULES.PRACTICAL_ROOMS) {
          if (!usedClassrooms.has(room as ClassroomType)) {
            assignments[timeSlot][classGroup] = room as ClassroomType
            usedClassrooms.add(room as ClassroomType)
            break
          }
        }
      }
    })

    // 次に座学を割り当て
    Object.entries(classes).forEach(([classGroup, info]) => {
      if (!CLASSROOM_RULES.isPracticalSubject(info.subject) && !assignments[timeSlot][classGroup]) {
        const isJoint = CLASSROOM_RULES.isJointClass(schedule, timeSlot, info.subject)

        // 合同授業の場合は大教室を割り当て
        if (isJoint) {
          for (const room of CLASSROOM_RULES.LARGE_LECTURE_ROOMS) {
            if (!usedClassrooms.has(room as ClassroomType)) {
              assignments[timeSlot][classGroup] = room as ClassroomType
              usedClassrooms.add(room as ClassroomType)
              break
            }
          }
        } else {
          // 通常の座学は小教室か大教室を割り当て
          const availableRooms = [...CLASSROOM_RULES.SMALL_LECTURE_ROOMS, ...CLASSROOM_RULES.LARGE_LECTURE_ROOMS]
          for (const room of availableRooms) {
            if (!usedClassrooms.has(room as ClassroomType)) {
              assignments[timeSlot][classGroup] = room as ClassroomType
              usedClassrooms.add(room as ClassroomType)
              break
            }
          }
        }
      }
    })
  })

  return assignments
}

export async function generateClassroomAssignments(date: string) {
  try {
    // カリキュラムデータを取得
    const curriculumEntries = await fetchCurriculumForDate(date)

    // スケジュール形式に変換
    const schedule = convertToSchedule(curriculumEntries)

    // 教室を割り当て
    const assignments = assignClassrooms(schedule)

    // 割り当て結果をDBに保存
    const { error } = await supabase.from("classroom_assignments").delete().eq("date", date)

    if (error) throw error

    const assignmentRows = Object.entries(assignments).flatMap(([timeSlot, classAssignments]) =>
      Object.entries(classAssignments).map(([classGroup, classroom]) => ({
        date,
        time_slot: timeSlot,
        class_group: classGroup,
        classroom,
      })),
    )

    const { error: insertError } = await supabase.from("classroom_assignments").insert(assignmentRows)

    if (insertError) throw insertError

    return assignments
  } catch (error) {
    console.error("Error generating classroom assignments:", error)
    throw error
  }
}
