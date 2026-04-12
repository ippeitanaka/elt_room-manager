import "./globals.css"
import "../styles/ud-biz-gothic.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "教室割り当て",
  description: "学生のための教室割り当て表示システム",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
