import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getTodayJST() {
  const f = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });
  const [y, m, d] = f.format(new Date()).split("/");
  return `${y}-${m}-${d}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let date = searchParams.get("date");
  if (!date) {
    date = getTodayJST();
  }

  // 必ずview_day_scheduleからsubject, instructor, ...を取得
    const { data, error } = await supabase
      .from("view_day_schedule")
      .select("*") // 変更: 全カラムを取得
      .eq("date", date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 並び順: class_group昇順, period_num昇順
  const items = (data || []).sort((a, b) => {
    if (a.class_group < b.class_group) return -1;
    if (a.class_group > b.class_group) return 1;
    return (a.period_num ?? 0) - (b.period_num ?? 0);
  });

  return NextResponse.json({ items: data, date }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
