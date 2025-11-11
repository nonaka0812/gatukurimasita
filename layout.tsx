import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'スロット稼働・期待値管理ツール',
  description: 'プロフェッショナルなスロット収支・期待値管理アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="dark">
      <body className="min-h-screen bg-dark-bg">{children}</body>
    </html>
  )
}

