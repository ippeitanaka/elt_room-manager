import { createClient } from "@supabase/supabase-js"

// v0環境用のハードコードされた値（実際のプロダクション環境では使用しないでください）
const FALLBACK_SUPABASE_URL = "https://usgpuiszdtzmxeujuxfb.supabase.co"
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZ3B1aXN6ZHR6bXhldWp1eGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MTkxNzEsImV4cCI6MjA1Mjk5NTE3MX0.p2nVZT_7-PmtrCRHXLQs4lsc3_KBExY1h1opSGCX0rY"

// 環境変数またはフォールバック値を使用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY

// 環境変数のデバッグログ
console.log("環境変数またはフォールバック - Supabase URL:", supabaseUrl ? "設定されています" : "設定されていません")
console.log(
  "環境変数またはフォールバック - Supabase Anon Key:",
  supabaseAnonKey ? "設定されています" : "設定されていません",
)

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey
}

// Supabase接続テスト
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("classroom_assignments").select("count", { count: "exact" })
    if (error) throw error
    console.log("Supabase接続テスト成功:", data)
    return true
  } catch (error) {
    console.error("Supabase接続テスト失敗:", error)
    return false
  }
}
