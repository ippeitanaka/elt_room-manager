import { format, parse } from "date-fns"
import { supabase } from "./supabase"

export type ClassroomType =
  | "1F実習室"
  | "2F実習室"
  | "3F実習室"
  | "3F小教室"
  | "4F小教室"
  | "4F大教室"
  | "5F大教室"
  | "7F大教室"
  | "パソコン室"
  | "DT3階小教室"
  | "DT4階小教室"
  | "図書室"

export type TimeSlot = "1限目" | "2限目" | "昼食" | "3限目" | "4限目" | "マイスタディ" | "補　習" | "再試験"

export interface DailyClassroomDataCell {
  classroom: string | null
  subject?: string | null
  instructor?: string | null
}

export interface DailyClassroomData {
  "1限目": Record<string, DailyClassroomDataCell>
  "2限目": Record<string, DailyClassroomDataCell>
  昼食: Record<string, DailyClassroomDataCell>
  "3限目": Record<string, DailyClassroomDataCell>
  "4限目": Record<string, DailyClassroomDataCell>
  "マイスタディ": Record<string, DailyClassroomDataCell>
  "補　習": Record<string, DailyClassroomDataCell>
  再試験: Record<string, DailyClassroomDataCell>
}

export type ClassroomData = {
  [date: string]: DailyClassroomData
}

export const regularClassGroups = ["1-A", "1-B", "2-A", "2-B", "3-A", "3-B"]
export const nursingClassGroups = ["1-N", "2-N", "3-N"]
export const regularTimeSlots: TimeSlot[] = ["1限目", "2限目", "昼食", "3限目", "4限目", "マイスタディ", "補　習", "再試験"]
export const nursingTimeSlots: TimeSlot[] = ["1限目", "2限目", "マイスタディ", "補　習", "再試験"]

export async function getClassroomData(date: string): Promise<DailyClassroomData> {
  try {
    console.log("Fetching classroom data for date:", date)
    const parsedDate = parse(date, "yyyy-MM-dd", new Date())
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format")
    }

    const formattedDate = format(parsedDate, "yyyy-MM-dd")
    // view_day_scheduleからclassroom/subject/instructorを取得
    const { data, error } = await supabase
      .from("view_day_schedule")
      .select("time_slot, class_group, classroom, subject, instructor")
      .eq("date", formattedDate)
      .order("time_slot", { ascending: true })
      .order("class_group", { ascending: true })

    if (error) {
      console.error("Error fetching classroom data:", error)
      throw new Error(`Failed to fetch classroom data: ${error.message}`)
    }

    if (!data || data.length === 0) {
      console.log("No data found for date:", formattedDate)
      return {
        "1限目": {},
        "2限目": {},
        昼食: {},
        "3限目": {},
        "4限目": {},
        "マイスタディ": {},
        "補　習": {},
        再試験: {},
      }
    }

    console.log("Received data:", data)


    const dailyData: DailyClassroomData = {
      "1限目": {},
      "2限目": {},
      昼食: {},
      "3限目": {},
      "4限目": {},
      "マイスタディ": {},
      "補　習": {},
      再試験: {},
    }

    data.forEach((item) => {
      if (item.time_slot && item.class_group) {
        if (item.time_slot in dailyData) {
          dailyData[item.time_slot as TimeSlot][item.class_group] = {
            classroom: item.classroom || null,
            subject: item.subject ?? null,
            instructor: item.instructor ?? null,
          }
        } else {
          console.warn(`Unexpected time slot: ${item.time_slot}`)
        }
      } else {
        console.warn("Invalid item in view_day_schedule:", item)
      }
    })

    console.log("Processed daily data:", dailyData)
    return dailyData
  } catch (error) {
    console.error("Unexpected error in getClassroomData:", error)
    throw error instanceof Error ? error : new Error(JSON.stringify(error))
  }
}

export async function saveClassroomData(date: string, data: DailyClassroomData) {
  const assignments = []

  for (const [timeSlot, groups] of Object.entries(data)) {
    for (const [classGroup, classroom] of Object.entries(groups)) {
      assignments.push({
        date,
        time_slot: timeSlot,
        class_group: classGroup,
        classroom,
      })
    }
  }

  try {
    console.log("Saving classroom data for date:", date)

    // Step 1: Delete existing data for the given date
    const { error: deleteError } = await supabase.from("classroom_assignments").delete().eq("date", date)

    if (deleteError) {
      console.error("Error deleting existing classroom data:", deleteError)
      throw new Error(`Failed to delete existing classroom data: ${deleteError.message}`)
    }

    // Step 2: Insert new data
    const { data: savedData, error: insertError } = await supabase.from("classroom_assignments").insert(assignments)

    if (insertError) {
      console.error("Error saving new classroom data:", insertError)
      throw new Error(`Failed to save new classroom data: ${insertError.message}`)
    }

    console.log("Saved data:", savedData)
    return savedData
  } catch (error) {
    console.error("Unexpected error in saveClassroomData:", error)
    throw error
  }
}
