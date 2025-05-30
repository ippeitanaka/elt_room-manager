import { supabase } from "./supabase"

export interface ClassroomComment {
  id: number
  date: string
  time_slot: string
  class_group: string
  classroom: string
  comment: string
  created_at: string
  updated_at: string
}

export async function fetchClassroomComments(date: string): Promise<ClassroomComment[]> {
  try {
    const { data, error } = await supabase.from("classroom_comments").select("*").eq("date", date)

    if (error) {
      console.error("Error fetching classroom comments:", error)
      throw new Error(`Failed to fetch classroom comments: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in fetchClassroomComments:", error)
    throw error instanceof Error ? error : new Error("An unknown error occurred")
  }
}

export async function saveClassroomComment(
  date: string,
  time_slot: string,
  class_group: string,
  classroom: string,
  comment: string,
): Promise<void> {
  try {
    // 既存のコメントを確認
    const { data: existingComment, error: fetchError } = await supabase
      .from("classroom_comments")
      .select("id")
      .eq("date", date)
      .eq("time_slot", time_slot)
      .eq("class_group", class_group)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116はデータが見つからない場合のエラーコード
      throw fetchError
    }

    if (existingComment) {
      // 既存のコメントを更新
      const { error } = await supabase
        .from("classroom_comments")
        .update({ comment, classroom, updated_at: new Date().toISOString() })
        .eq("id", existingComment.id)

      if (error) throw error
    } else {
      // 新しいコメントを作成
      const { error } = await supabase.from("classroom_comments").insert([
        {
          date,
          time_slot,
          class_group,
          classroom,
          comment,
        },
      ])

      if (error) throw error
    }
  } catch (error) {
    console.error("Error saving classroom comment:", error)
    throw error instanceof Error ? error : new Error("An unknown error occurred")
  }
}

export async function deleteClassroomComment(date: string, time_slot: string, class_group: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("classroom_comments")
      .delete()
      .eq("date", date)
      .eq("time_slot", time_slot)
      .eq("class_group", class_group)

    if (error) {
      console.error("Error deleting classroom comment:", error)
      throw new Error(`Failed to delete classroom comment: ${error.message}`)
    }
  } catch (error) {
    console.error("Unexpected error in deleteClassroomComment:", error)
    throw error instanceof Error ? error : new Error("An unknown error occurred")
  }
}
