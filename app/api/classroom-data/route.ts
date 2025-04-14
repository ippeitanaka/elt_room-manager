import { NextResponse } from "next/server"
import { getClassroomData } from "@/lib/classrooms"
import { format, parse } from "date-fns"

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
