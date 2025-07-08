"use server"

import { supabase } from "./supabase"
import type { DailyClassroomData, TimeSlot } from "./classrooms"
import { fetchScheduleFromSupabase, processScheduleData } from "./schedule-service"
import { allocateClassrooms } from "./classroom-allocator"
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
      "マイスタディ": {},
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
    for (const timeSlot in allocations) {
      for (const classGroup in allocations[timeSlot]) {
        if (allocations[timeSlot][classGroup]) {
          // 空の教室割り当ては保存しない
          dataToInsert.push({
            date: date,
            time_slot: timeSlot,
            class_group: classGroup,
            classroom: allocations[timeSlot][classGroup],
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

export async function autoAllocateClassrooms(date: string): Promise<DailyClassroomData> {
  try {
    console.log("Starting auto allocation for date:", date)

    // 日付形式の確認と変換
    let formattedDate = date
    try {
      // 日付形式を確認し、必要に応じて変換
      const parsedDate = parse(date, "yyyy-MM-dd", new Date())
      formattedDate = format(parsedDate, "yyyy/MM/dd") // 日本の一般的な日付形式に変換
      console.log("Converted date format:", formattedDate)
    } catch (err) {
      console.warn("Date format conversion failed, using original:", date)
    }

    // 両方の形式で試す
    let scheduleEntries = []
    try {
      scheduleEntries = await fetchScheduleFromSupabase(formattedDate)
    } catch (error) {
      console.error(`Error fetching with format ${formattedDate}:`, error)
      // エラーが発生しても続行し、別の形式を試す
    }

    if (scheduleEntries.length === 0) {
      console.log(`No data found with format ${formattedDate}, trying original format ${date}`)
      try {
        scheduleEntries = await fetchScheduleFromSupabase(date)
      } catch (error) {
        console.error(`Error fetching with format ${date}:`, error)
        // エラーが発生しても続行
      }
    }

    if (scheduleEntries.length === 0) {
      // スケジュールデータが存在しない場合は、空の割り当てデータを返す
      console.log(`No schedule data found for date: ${date} or ${formattedDate}. Creating empty allocations.`)

      const emptyAllocations: DailyClassroomData = {
        "1限目": {},
        "2限目": {},
        "3限目": {},
        "4限目": {},
        昼食: {},
        "マイスタディ": {},
        "補　習": {},
        再試験: {},
      }

      return emptyAllocations
    }

    // スケジュールデータを処理
    const processedSchedules = processScheduleData(scheduleEntries)
    console.log("Processed schedules:", processedSchedules)

    // 教室を自動割り当て
    const allocations = allocateClassrooms(processedSchedules)
    console.log("Generated allocations:", JSON.stringify(allocations, null, 2))

    // 割り当て結果を保存
    await saveClassroomData(date, allocations)

    return allocations
  } catch (error) {
    console.error("Error in autoAllocateClassrooms:", error)
    throw error instanceof Error
      ? error
      : new Error(
          `自動割り当て処理中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        )
  }
}

// テスト用のスケジュールデータを追加する関数
export async function addTestScheduleData(date: string): Promise<void> {
  try {
    // 日付形式の確認と変換
    let formattedDate = date
    try {
      // 日付形式を確認し、必要に応じて変換
      const parsedDate = parse(date, "yyyy-MM-dd", new Date())
      formattedDate = format(parsedDate, "yyyy/MM/dd") // 日本の一般的な日付形式に変換
    } catch (err) {
      console.warn("Date format conversion failed, using original:", date)
    }

    // テスト用のスケジュールデータ
    const testScheduleData = [
      {
        日付: formattedDate,
        曜日: "月曜日",
        時限: "1限目", // 時限を直接「1限目」形式に変更
        "1年Aクラスの授業内容": "情報処理",
        "1年Aクラス担当講師名": "山田",
        "1年Aクラスコマ数": "2",
        "1年Bクラスの授業内容": "基礎医学",
        "1年Bクラス担当講師名": "鈴木",
        "1年Bクラスコマ数": "2",
        "2年Aクラスの授業内容": "実習I",
        "2年Aクラス担当講師名": "佐藤",
        "2年Aクラスコマ数": "2",
        "2年Bクラスの授業内容": "臨床医学",
        "2年Bクラス担当講師名": "田中",
        "2年Bクラスコマ数": "2",
        "3年Aクラスの授業内容": "実習II",
        "3年Aクラス担当講師名": "伊藤",
        "3年Aクラスコマ数": "2",
        "3年Bクラスの授業内容": "総合演習",
        "3年Bクラス担当講師名": "渡辺",
        "3年Bクラスコマ数": "2",
      },
      {
        日付: formattedDate,
        曜日: "月曜日",
        時限: "2限目", // 時限を直接「2限目」形式に変更
        "1年Aクラスの授業内容": "基礎医学",
        "1年Aクラス担当講師名": "鈴木",
        "1年Aクラスコマ数": "2",
        "1年Bクラスの授業内容": "情報処理",
        "1年Bクラス担当講師名": "山田",
        "1年Bクラスコマ数": "2",
        "2年Aクラスの授業内容": "臨床医学",
        "2年Aクラス担当講師名": "田中",
        "2年Aクラスコマ数": "2",
        "2年Bクラスの授業内容": "実習I",
        "2年Bクラス担当講師名": "佐藤",
        "2年Bクラスコマ数": "2",
        "3年Aクラスの授業内容": "総合演習",
        "3年Aクラス担当講師名": "渡辺",
        "3年Aクラスコマ数": "2",
        "3年Bクラスの授業内容": "実習II",
        "3年Bクラス担当講師名": "伊藤",
        "3年Bクラスコマ数": "2",
      },
      {
        日付: formattedDate,
        曜日: "月曜日",
        時限: "3限目", // 時限を直接「3限目」形式に変更
        "1年Aクラスの授業内容": "解剖学",
        "1年Aクラス担当講師名": "高橋",
        "1年Aクラスコマ数": "2",
        "1年Bクラスの授業内容": "生理学",
        "1年Bクラス担当講師名": "小林",
        "1年Bクラスコマ数": "2",
        "2年Aクラスの授業内容": "病理学",
        "2年Aクラス担当講師名": "吉田",
        "2年Aクラスコマ数": "2",
        "2年Bクラスの授業内容": "薬理学",
        "2年Bクラス担当講師名": "松本",
        "2年Bクラスコマ数": "2",
        "3年Aクラスの授業内容": "実習III",
        "3年Aクラス担当講師名": "木村",
        "3年Aクラスコマ数": "2",
        "3年Bクラスの授業内容": "臨床実習",
        "3年Bクラス担当講師名": "清水",
        "3年Bクラスコマ数": "2",
      },
      {
        日付: formattedDate,
        曜日: "月曜日",
        時限: "4限目", // 時限を直接「4限目」形式に変更
        "1年Aクラスの授業内容": "生理学",
        "1年Aクラス担当講師名": "小林",
        "1年Aクラスコマ数": "2",
        "1年Bクラスの授業内容": "解剖学",
        "1年Bクラス担当講師名": "高橋",
        "1年Bクラスコマ数": "2",
        "2年Aクラスの授業内容": "薬理学",
        "2年Aクラス担当講師名": "松本",
        "2年Bクラスの授業内容": "病理学",
        "2年Bクラス担当講師名": "吉田",
        "2年Bクラスコマ数": "2",
        "3年Aクラスの授業内容": "臨床実習",
        "3年Aクラス担当講師名": "清水",
        "3年Aクラスコマ数": "2",
        "3年Bクラスの授業内容": "実習III",
        "3年Bクラス担当講師名": "木村",
        "3年Bクラスコマ数": "2",
      },
    ]

    // 既存のデータを削除
    const { error: deleteError } = await supabase.from("スケジュール").delete().eq("日付", formattedDate)

    if (deleteError) {
      console.error("Error deleting existing schedule data:", deleteError)
      throw new Error(`Failed to delete existing schedule data: ${deleteError.message}`)
    }

    // テストデータを挿入
    const { error: insertError } = await supabase.from("スケジュール").insert(testScheduleData)

    if (insertError) {
      console.error("Error inserting test schedule data:", insertError)
      throw new Error(`Failed to insert test schedule data: ${insertError.message}`)
    }

    console.log("Test schedule data added successfully for date:", formattedDate)
  } catch (error) {
    console.error("Error in addTestScheduleData:", error)
    throw error instanceof Error ? error : new Error("An unknown error occurred")
  }
}
