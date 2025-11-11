'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CalendarView from '@/components/CalendarView'
import DailyStats from '@/components/DailyStats'
import MobileNav from '@/components/MobileNav'
import { SlotData, STORAGE_KEY } from '@/lib/types'

export default function CalendarPage() {
  const [data, setData] = useState<SlotData[]>([])

  // LocalStorageからデータ読み込み
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setData(JSON.parse(stored))
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <MobileNav />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
            📅 カレンダー
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            日ごとの収支をカレンダーで確認
          </p>
        </motion.header>

        {/* カレンダー表示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CalendarView data={data} />
        </motion.div>

        {/* 日ごとの収支 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DailyStats data={data} />
        </motion.div>
      </div>
    </div>
  )
}

