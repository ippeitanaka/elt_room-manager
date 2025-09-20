"use server"

import { supabase } from "./supabase"
import type { DailyClassroomData, TimeSlot } from "./classrooms"
// 不要なimport削除
import { format, parse } from "date-fns"

export async function fetchClassroomData(date: string): Promise<DailyClassroomData> {
  try {
    const { data, error } = await supabase.from("classroom_assignments").select("*").eq("date", date)

    if (error) {
      console.error("Error fetching classroom data:", error)
      throw new Error(`Failed to fetch classroom data: ${error.message}`)
    }

    if (!data) {
      throw new Error("No data returned from Supabase")
    }

    const dailyData: DailyClassroomData = {
      "1限目": {},
      "2限目": {},
      昼食: {},
      "3限目": {},
      "4限目": {},
      "自　習": {},
      "補　習": {},
      再試験: {},
    }

    data.forEach((item) => {
      if (item && typeof item === "object" && "time_slot" in item && "class_group" in item && "classroom" in item) {
        const timeSlot = item.time_slot as TimeSlot
        if (timeSlot in dailyData) {
          dailyData[timeSlot][item.class_group] = item.classroom
        } else {
          console.warn(`Unexpected time slot: ${timeSlot}`)
        }
      } else {
        console.warn("Invalid item in classroom_assignments:", item)
      }
    })

    return dailyData
  } catch (error) {
    console.error("Unexpected error in fetchClassroomData:", error)
    throw error instanceof Error ? error : new Error("An unknown error occurred")
  }
}

async function saveClassroomData(date: string, allocations: DailyClassroomData): Promise<void> {
  try {
    // Delete existing data for the date
    const { error: deleteError } = await supabase.from("classroom_assignments").delete().eq("date", date)

    if (deleteError) {
      console.error("Error deleting existing classroom data:", deleteError)
      throw new Error(`Failed to delete existing classroom data: ${deleteError.message}`)
    }

    // Prepare data for insertion
    const dataToInsert = []
    for (const [timeSlot, groups] of Object.entries(allocations)) {
      for (const [classGroup, classroom] of Object.entries(groups)) {
        if (
          typeof classroom === "string" &&
          classroom.trim() !== "" &&
          classroom !== "---"
        ) {
          dataToInsert.push({
            date: date,
            time_slot: timeSlot,
            class_group: classGroup,
            classroom,
          })
        }
      }
    }

    // Insert the new data
    const { error: insertError } = await supabase.from("classroom_assignments").insert(dataToInsert)

    if (insertError) {
      console.error("Error saving classroom data:", insertError)
      throw new Error(`Failed to save classroom data: ${insertError.message}`)
    }

    console.log("Classroom data saved successfully.")
  } catch (error) {
    console.error("Error in saveClassroomData:", error)
    throw error instanceof Error ? error : new Error("An unknown error occurred")
  }
}

// curriculum・スケジュール関連の自動割り当て関数・テストデータ追加関数を削除
