"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CurriculumData } from "@/lib/curriculum"
import { fetchCurriculum } from "@/lib/curriculum"

interface CurriculumTableProps {
  classGroup: string
  semester: string
}

export function CurriculumTable({ classGroup, semester }: CurriculumTableProps) {
  const [curriculum, setCurriculum] = useState<CurriculumData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCurriculum() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchCurriculum(classGroup, semester)
        setCurriculum(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "カリキュラムの取得に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    loadCurriculum()
  }, [classGroup, semester])

  if (isLoading) {
    return <div>読み込み中...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>時限</TableHead>
            <TableHead>曜日</TableHead>
            <TableHead>科目</TableHead>
            <TableHead>担当教員</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {curriculum.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.time_slot}</TableCell>
              <TableCell>{item.day_of_week}</TableCell>
              <TableCell>{item.subject}</TableCell>
              <TableCell>{item.teacher}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
