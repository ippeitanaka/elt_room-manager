"use client"

export function ErrorDisplay({ message, details }: { message: string; details: string }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
      <p className="mb-4">{message}</p>
      <p className="text-sm text-gray-600">エラー詳細: {details}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        ページを再読み込み
      </button>
    </div>
  )
}
