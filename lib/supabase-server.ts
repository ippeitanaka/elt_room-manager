import { createClient } from "@supabase/supabase-js"

// サーバーサイド用のSupabaseクライアント（サービスロールキーを使用）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://usgpuiszdtzmxeujuxfb.supabase.co"
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseServiceRoleKey) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Using anon key as fallback.")
}

// サービスロールキーがある場合はそれを使用、ない場合はanon keyを使用
const serviceKey =
  supabaseServiceRoleKey ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZ3B1aXN6ZHR6bXhldWp1eGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MTkxNzEsImV4cCI6MjA1Mjk5NTE3MX0.p2nVZT_7-PmtrCRHXLQs4lsc3_KBExY1h1opSGCX0rY"

export const supabaseServer = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function testSupabaseServerConnection() {
  try {
    const { data, error } = await supabaseServer.from("classroom_comments").select("count", { count: "exact" })
    if (error) throw error
    console.log("Supabase server connection test successful:", data)
    return true
  } catch (error) {
    console.error("Supabase server connection test failed:", error)
    return false
  }
}
