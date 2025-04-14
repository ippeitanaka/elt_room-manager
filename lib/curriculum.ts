import { supabase } from "./supabase"

export interface CurriculumData {
  id: number
  class_group: string
  subject: string
  teacher: string
  time_slot: string
  day_of_week: string
  semester: string
  created_at?: string
  updated_at?: string
}

export async function fetchCurriculum(classGroup: string, semester: string) {
  try {
    const { data, error } = await supabase
      .from("curriculum")
      .select("*")
      .eq("class_group", classGroup)
      .eq("semester", semester)
      .order("day_of_week")
      .order("time_slot")

    if (error) {
      console.error("Error fetching curriculum:", error)
      throw new Error(`Failed to fetch curriculum data: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Unexpected error in fetchCurriculum:", error)
    throw error instanceof Error ? error : new Error("An unknown error occurred")
  }
}

export async function saveCurriculum(curriculumData: Omit<CurriculumData, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase.from("curriculum").insert([curriculumData]).select()

    if (error) {
      console.error("Error saving curriculum:", error)
      throw new Error(`Failed to save curriculum data: ${error.message}`)
    }

    return data[0]
  } catch (error) {
    console.error("Unexpected error in saveCurriculum:", error)
    throw error instanceof Error ? error : new Error("An unknown error occurred")
  }
}

export async function updateCurriculum(id: number, curriculumData: Partial<CurriculumData>) {
  try {
    const { data, error } = await supabase.from("curriculum").update(curriculumData).eq("id", id).select()

    if (error) {
      console.error("Error updating curriculum:", error)
      throw new Error(`Failed to update curriculum data: ${error.message}`)
    }

    return data[0]
  } catch (error) {
    console.error("Unexpected error in updateCurriculum:", error)
    throw error instanceof Error ? error : new Error("An unknown error occurred")
  }
}

export async function deleteCurriculum(id: number) {
  try {
    const { error } = await supabase.from("curriculum").delete().eq("id", id)

    if (error) {
      console.error("Error deleting curriculum:", error)
      throw new Error(`Failed to delete curriculum data: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error("Unexpected error in deleteCurriculum:", error)
    throw error instanceof Error ? error : new Error("An unknown error occurred")
  }
}
