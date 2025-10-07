"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { fetchScheduleLectures, ScheduleLectureInfo } from "@/lib/schedule-lectures"
import { ja } from "date-fns/locale"
import ClassroomTable from "@/components/ClassroomTable"
import { DatePicker } from "@/components/DatePicker"
import { saveClassroomData, type ClassroomType, type DailyClassroomData, type TimeSlot } from "@/lib/classrooms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { ClassroomComment } from "@/lib/comments"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dailyData, setDailyData] = useState<DailyClassroomData | null>(null)
  const [comments, setComments] = useState<ClassroomComment[]>([])
  const [lectureInfos, setLectureInfos] = useState<ScheduleLectureInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) throw error
        setIsAuthenticated(!!user)
        if (user) {
          fetchData(selectedDate)
        }
      } catch (err) {
        console.error("Authentication check failed:", err)
        setError("認証チェックに失敗しました。")
      }
    }
    checkAuth()
  }, [selectedDate])

  const fetchData = useCallback(async (date: Date) => {
    setIsLoading(true)
    setError(null)
    const dateString = format(date, "yyyy-MM-dd")
    try {
      // 教室データを取得
      const response = await fetch(`/api/classroom-data?date=${dateString}&timestamp=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      const data = await response.json()
      setDailyData(data)

      // コメントデータを取得
      const commentsResponse = await fetch(`/api/classroom-comments?date=${dateString}&timestamp=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      })
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData)
      }

      // 講義情報を取得
      const lectures = await fetchScheduleLectures(dateString)
      setLectureInfos(lectures)
    } catch (err) {
      console.error("Failed to fetch assignments:", err)
      setError(`データの取得に失敗しました。エラー: ${err instanceof Error ? err.message : JSON.stringify(err)}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setIsAuthenticated(true)
      fetchData(selectedDate)
    } catch (err: any) {
      console.error("Authentication error:", err)
      setError(`認証に失敗しました: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    fetchData(date)
  }

  const handleCellChange = useCallback((timeSlot: string, group: string, classroom: ClassroomType | null) => {
    setDailyData((prevData) => {
      if (!prevData) return prevData
      const newData = { ...prevData }
      if (timeSlot === "all") {
        // Update all time slots for the given group
        Object.keys(newData).forEach((slot) => {
          newData[slot as keyof DailyClassroomData] = {
            ...newData[slot as keyof DailyClassroomData],
            [group]: classroom,
          }
        })
      } else {
        // Update only the specified time slot
        newData[timeSlot as keyof DailyClassroomData] = {
          ...newData[timeSlot as keyof DailyClassroomData],
          [group]: classroom,
        }
      }
      return newData
    })
  }, [])

  const handleCommentChange = async (timeSlot: TimeSlot, group: string, classroom: string, comment: string) => {
    setIsLoading(true)
    const dateString = format(selectedDate, "yyyy-MM-dd")
    try {
      if (!comment.trim()) {
        // 空白ならコメント削除APIを呼ぶ
        const response = await fetch(
          `/api/classroom-comments?date=${dateString}&time_slot=${timeSlot}&class_group=${group}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        )
        if (!response.ok) {
          throw new Error("コメントの削除に失敗しました。")
        }
        setComments(comments.filter((c) => !(c.time_slot === timeSlot && c.class_group === group)))
        alert("コメントが削除されました。")
        return
      }

      // 通常のコメント保存
      const response = await fetch("/api/classroom-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateString,
          time_slot: timeSlot,
          class_group: group,
          classroom,
          comment,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("コメントの保存に失敗しました。")
      }

      // コメントリストを更新
      const existingCommentIndex = comments.findIndex((c) => c.time_slot === timeSlot && c.class_group === group)

      if (existingCommentIndex >= 0) {
        // 既存のコメントを更新
        const updatedComments = [...comments]
        updatedComments[existingCommentIndex] = {
          ...updatedComments[existingCommentIndex],
          comment,
          classroom,
          updated_at: new Date().toISOString(),
        }
        setComments(updatedComments)
      } else {
        // 新しいコメントを追加
        setComments([
          ...comments,
          {
            id: Date.now(), // 一時的なID
            date: dateString,
            time_slot: timeSlot,
            class_group: group,
            classroom,
            comment,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
      }

      alert("コメントが保存されました。")
    } catch (err) {
      console.error("Failed to save comment:", err)
      alert(err instanceof Error ? err.message : "コメントの保存に失敗しました。")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentDelete = async (timeSlot: TimeSlot, group: string) => {
    setIsLoading(true)
    const dateString = format(selectedDate, "yyyy-MM-dd")
    try {
      const response = await fetch(
        `/api/classroom-comments?date=${dateString}&time_slot=${timeSlot}&class_group=${group}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      )

      if (!response.ok) {
        throw new Error("コメントの削除に失敗しました。")
      }

      // コメントリストから削除
      setComments(comments.filter((c) => !(c.time_slot === timeSlot && c.class_group === group)))

      alert("コメントが削除されました。")
    } catch (err) {
      console.error("Failed to delete comment:", err)
      alert(err instanceof Error ? err.message : "コメントの削除に失敗しました。")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (dailyData) {
      setIsLoading(true)
      setError(null)
      const dateString = format(selectedDate, "yyyy-MM-dd")
      try {
        await saveClassroomData(dateString, dailyData)
        alert("変更が保存されました。")
        router.push("/")
      } catch (err: any) {
        console.error("Failed to save assignments:", err)
        setError(`データの保存に失敗しました: ${err.message}`)
        alert(`データの保存に失敗しました: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-md px-4">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-pink-600 tracking-wide">
            ELT <span className="text-pink-800">教室管理</span>
          </h1>
        </div>
        {error && <div className="text-red-500 mb-4 text-sm sm:text-base">{error}</div>}
        <div className="space-y-4 bg-pink-50 p-4 sm:p-6 rounded-2xl shadow-md border-2 border-pink-200">
          <h1 className="text-lg sm:text-2xl font-bold text-center text-pink-700">教室管理ログイン</h1>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button onClick={handleLogin} disabled={isLoading} className="w-full bg-pink-500 hover:bg-pink-600">
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading && !dailyData) {
    return <div className="container mx-auto py-8 text-center">データを読み込んでいます...</div>
  }

  if (error && !dailyData) {
    return <div className="container mx-auto py-8 text-center text-red-500">エラー: {error}</div>
  }

  if (!dailyData) {
    return <div className="container mx-auto py-8 text-center">データがありません。</div>
  }

  return (
    <div className="container mx-auto py-2 px-2 sm:py-8 sm:px-4">
      {/* ヘッダー部分 - タイトルを左に、日付選択を右に配置 */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8">
        <h1 className="text-lg sm:text-3xl font-bold text-pink-600 tracking-wide mb-2 sm:mb-0">
          ELT <span className="text-pink-800">教室管理</span>
        </h1>

        <div className="flex items-center gap-2">
          <DatePicker date={selectedDate} onSelect={handleDateChange} />
          <p className="text-xs sm:text-sm font-medium text-pink-700 hidden sm:block">
            {format(selectedDate, "yyyy年M月d日（E）", { locale: ja })}
          </p>
        </div>
      </div>

      <div className="mb-4 sm:mb-6 flex justify-center">
        <Button onClick={handleSave} disabled={isLoading} variant="default" className="bg-pink-500 hover:bg-pink-600 text-xs sm:text-base px-3 py-1 sm:px-4 sm:py-2">
          {isLoading ? "保存中..." : "変更を保存"}
        </Button>
      </div>

      <ClassroomTable
        data={dailyData}
        onCellChange={handleCellChange}
        isAdminView={true}
        comments={comments}
        onCommentChange={handleCommentChange}
        onCommentDelete={handleCommentDelete}
        lectureInfos={lectureInfos}
        classroomOptions={["---", "1F実習室", "2F実習室", "3F実習室", "3F小教室", "4F小教室", "4F大教室", "5F大教室", "7F大教室", "パソコン室", "DT3階小教室", "DT4階小教室"]}
      />
    </div>
  )
}
