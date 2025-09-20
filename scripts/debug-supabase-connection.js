import { supabase } from "../lib/supabase.js"

console.log("🔍 Supabase接続とテーブル構造をデバッグしています...")

async function debugSupabase() {
  try {
    // 1. 接続テスト
    console.log("1. 接続テスト中...")
    const { data: testData, error: testError } = await supabase
      .from("classroom_assignments")
      .select("count", { count: "exact" })

    if (testError) {
      console.error("❌ 接続エラー:", testError)
      return
    }
    console.log("✅ 接続成功")

    // 2. テーブル構造確認
    console.log("2. 既存データの確認...")
    const { data: existingData, error: dataError } = await supabase.from("classroom_assignments").select("*").limit(5)

    if (dataError) {
      console.error("❌ データ取得エラー:", dataError)
    } else {
      console.log("📊 既存データサンプル:", existingData)
    }

    // 3. 時限の種類を確認
    console.log("3. 時限の種類を確認...")
    const { data: timeSlots, error: timeSlotsError } = await supabase
      .from("classroom_assignments")
      .select("time_slot")
      .neq("time_slot", null)

    if (timeSlotsError) {
      console.error("❌ 時限データ取得エラー:", timeSlotsError)
    } else {
      const uniqueTimeSlots = [...new Set(timeSlots.map((item) => item.time_slot))]
      console.log("📅 データベース内の時限:", uniqueTimeSlots)
      console.log("📅 コード内の有効な時限:", [
        "1限目",
        "2限目",
        "昼食",
        "3限目",
        "4限目",
        "自　習",
        "補　習",
        "再試験",
      ])
    }

    // 4. テスト挿入
    console.log("4. テスト挿入を実行...")
    const testRecord = {
      date: "2024-01-15",
      time_slot: "1限目",
      class_group: "1-A",
      classroom: "1F実習室",
    }

    const { data: insertData, error: insertError } = await supabase
      .from("classroom_assignments")
      .insert([testRecord])
      .select()

    if (insertError) {
      console.error("❌ テスト挿入エラー:", insertError)
      console.error("📝 エラー詳細:", insertError.details)
      console.error("📝 エラーヒント:", insertError.hint)
    } else {
      console.log("✅ テスト挿入成功:", insertData)

      // テストデータを削除
      await supabase.from("classroom_assignments").delete().eq("date", "2024-01-15").eq("class_group", "1-A")
    }
  } catch (error) {
    console.error("❌ 予期しないエラー:", error)
  }
}

debugSupabase()
