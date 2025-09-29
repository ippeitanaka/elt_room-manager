import { NextResponse } from "next/server"
import { getClassroomData } from "@/lib/classrooms"
import { format, parse } from "date-fns"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get("date")

  if (!dateParam) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 })
  }

  try {
    const date = parse(dateParam, "yyyy-MM-dd", new Date())
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format")
    }

    const formattedDate = format(date, "yyyy-MM-dd")
    const data = await getClassroomData(formattedDate)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching classroom data:", error)
    return NextResponse.json(
      { error: "Failed to fetch classroom data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, timeSlot, classGroup, classroom } = body

    if (!date || !timeSlot || !classGroup) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Supabaseにデータを保存
    const { error } = await supabase
      .from('classroom_assignments')
      .upsert({
        date,
        time_slot: timeSlot,
        class_group: classGroup,
        classroom: classroom || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date,time_slot,class_group'
      })

    if (error) {
      console.error("Error saving classroom data:", error)
      return NextResponse.json({ error: "Failed to save classroom data" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/classroom-data:", error)
    return NextResponse.json(
      { error: "Failed to save classroom data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
