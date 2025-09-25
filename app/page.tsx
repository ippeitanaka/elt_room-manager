import { ClassroomScheduleWrapper } from "@/components/ClassroomScheduleWrapper"
import { ErrorDisplay } from "@/components/ErrorDisplay"
import { getClassroomData } from "@/lib/classrooms"

// This is a server component, so revalidate is valid here
export const revalidate = 0

export default async function Home() {
  const today = new Date()
  const dateString = today.toISOString().split("T")[0]

  try {
    const initialData = await getClassroomData(dateString)
    if (!initialData) {
      throw new Error("Failed to fetch initial data")
    }

    // Pass the fetched data to the client component
    return <ClassroomScheduleWrapper initialData={initialData} initialDate={dateString} />
  } catch (error) {
    console.error("Error fetching initial data:", error)
    return (
      <ErrorDisplay
        message="データの取得中にエラーが発生しました。しばらくしてから再度お試しください。"
        details={error instanceof Error ? error.message : JSON.stringify(error)}
      />
    )
  }
}
