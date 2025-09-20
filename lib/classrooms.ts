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

export type TimeSlot = "1限目" | "2限目" | "昼食" | "3限目" | "4限目" | "5限目" | "6限目" | "自　習" | "補　習" | "再試験"

export interface DailyClassroomData {
  "1限目": Record<string, string | null>
  "2限目": Record<string, string | null>
  昼食: Record<string, string | null>
  "3限目": Record<string, string | null>
  "4限目": Record<string, string | null>
  "5限目": Record<string, string | null>
  "6限目": Record<string, string | null>
  "自　習": Record<string, string | null>
  "補　習": Record<string, string | null>
  再試験: Record<string, string | null>
}

export type ClassroomData = {
  [date: string]: DailyClassroomData
}

export const regularClassGroups = ["1-A", "1-B", "2-A", "2-B", "3-A", "3-B"]
export const nursingClassGroups = ["1-N", "2-N", "3-N"]
export const regularTimeSlots: TimeSlot[] = ["1限目", "2限目", "昼食", "3限目", "4限目", "自　習", "補　習", "再試験"]
export const nursingTimeSlots: TimeSlot[] = ["1限目", "2限目", "自　習", "補　習", "再試験"]

// 有効な時限の配列（チェック制約と一致）
export const VALID_TIME_SLOTS: TimeSlot[] = ["1限目", "2限目", "昼食", "3限目", "4限目", "5限目", "6限目", "自　習", "補　習", "再試験"]

export async function getClassroomData(date: string): Promise<DailyClassroomData> {
  try {
    console.log("Fetching classroom data for date:", date)
    const parsedDate = parse(date, "yyyy-MM-dd", new Date())
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format")
    }

    const formattedDate = format(parsedDate, "yyyy-MM-dd")
    const { data, error } = await supabase
      .from("classroom_assignments")
      .select("*")
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
        "5限目": {},
        "6限目": {},
        "自　習": {},
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
      "5限目": {},
      "6限目": {},
      "自　習": {},
      "補　習": {},
      再試験: {},
    }

    data.forEach((item) => {
      if (item.time_slot && item.class_group) {
        if (VALID_TIME_SLOTS.includes(item.time_slot as TimeSlot)) {
          dailyData[item.time_slot as TimeSlot][item.class_group] = item.classroom || null
        } else {
          console.warn(`Invalid time slot from database: ${item.time_slot}`)
        }
      } else {
        console.warn("Invalid item in classroom_assignments:", item)
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
    // 有効な時限のみを処理
    if (!VALID_TIME_SLOTS.includes(timeSlot as TimeSlot)) {
      console.warn(`Skipping invalid time slot: ${timeSlot}`)
      continue
    }

    for (const [classGroup, classroom] of Object.entries(groups)) {
      // 空の教室割り当ては保存しない
  if (typeof classroom === "string" && classroom.trim() !== "" && classroom !== "---") {
        assignments.push({
          date,
          time_slot: timeSlot,
          class_group: classGroup,
          classroom,
        })
      }
    }
  }

  try {
    console.log("Saving classroom data for date:", date)
    console.log("Assignments to save:", assignments)

    // Step 1: Delete existing data for the given date
    const { error: deleteError } = await supabase.from("classroom_assignments").delete().eq("date", date)

    if (deleteError) {
      console.error("Error deleting existing classroom data:", deleteError)
      throw new Error(`Failed to delete existing classroom data: ${deleteError.message}`)
    }

    // Step 2: Insert new data (only if there are assignments to save)
    if (assignments.length > 0) {
      const { data: savedData, error: insertError } = await supabase.from("classroom_assignments").insert(assignments)

      if (insertError) {
        console.error("Error saving new classroom data:", insertError)
        console.error("Failed assignments:", assignments)
        throw new Error(`Failed to save new classroom data: ${insertError.message}`)
      }

      console.log("Saved data:", savedData)
      return savedData
    } else {
      console.log("No assignments to save")
      return []
    }
  } catch (error) {
    console.error("Unexpected error in saveClassroomData:", error)
    throw error
  }
}
