"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { ClassroomTable } from "@/components/ClassroomTable"
import { DatePicker } from "@/components/DatePicker"
import { saveClassroomData, type ClassroomType, type DailyClassroomData } from "@/lib/classrooms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dailyData, setDailyData] = useState<DailyClassroomData | null>(null)
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
      const response = await fetch(`/api/classroom-data?date=${dateString}&timestamp=${Date.now()}`, {
        cache: "no-store",
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      const data = await response.json()
      setDailyData(data)
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
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-pink-600 tracking-wide">
            ELT <span className="text-pink-800">教室管理</span>
          </h1>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="space-y-4 bg-pink-50 p-6 rounded-2xl shadow-md border-2 border-pink-200">
          <h1 className="text-2xl font-bold text-center text-pink-700">教室管理ログイン</h1>
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

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">データを読み込んでいます...</div>
  }

  if (error) {
    return <div className="container mx-auto py-8 text-center text-red-500">エラー: {error}</div>
  }

  if (!dailyData) {
    return <div className="container mx-auto py-8 text-center">データがありません。</div>
  }

  return (
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4">
      {/* ヘッダー部分 - タイトルを左に、日付選択を右に配置 */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-600 tracking-wide mb-4 sm:mb-0">
          ELT <span className="text-pink-800">教室管理</span>
        </h1>

        <div className="flex items-center gap-2">
          <DatePicker date={selectedDate} onSelect={handleDateChange} />
          <p className="text-sm font-medium text-pink-700 hidden sm:block">
            {format(selectedDate, "yyyy年M月d日（E）", { locale: ja })}
          </p>
        </div>
      </div>

      <div className="mb-6 flex justify-center">
        <Button onClick={handleSave} disabled={isLoading} variant="default" className="bg-pink-500 hover:bg-pink-600">
          {isLoading ? "保存中..." : "変更を保存"}
        </Button>
      </div>

      <ClassroomTable data={dailyData} onCellChange={handleCellChange} isAdminView={true} />
    </div>
  )
}
