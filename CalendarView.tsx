'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SlotData } from '@/lib/types'

interface CalendarViewProps {
  data: SlotData[]
}

export default function CalendarView({ data }: CalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())

  // 日ごとの収支を集計
  const dailyIncome = useMemo(() => {
    const incomeMap: Record<string, number> = {}
    data.forEach((item) => {
      if (!incomeMap[item.date]) {
        incomeMap[item.date] = 0
      }
      incomeMap[item.date] += item.income
    })
    return incomeMap
  }, [data])

  // カレンダー生成
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toLocaleDateString('ja-JP')
      days.push({
        date: new Date(currentDate),
        dateStr,
        isCurrentMonth: currentDate.getMonth() === currentMonth,
        income: dailyIncome[dateStr] || 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return days
  }, [currentYear, currentMonth, dailyIncome])

  const changeMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      let newMonth = prev + direction
      if (newMonth < 0) {
        newMonth = 11
        setCurrentYear((y) => y - 1)
      } else if (newMonth > 11) {
        newMonth = 0
        setCurrentYear((y) => y + 1)
      }
      return newMonth
    })
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-dark-accent mb-6">カレンダー</h2>

      {/* 月切り替えコントロール */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          onClick={() => changeMonth(-1)}
          className="neomorphic-btn px-4 py-2 text-dark-text hover:text-dark-accent transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← 前月
        </motion.button>
        <h3 className="text-xl font-semibold text-dark-accent">
          {currentYear}年{currentMonth + 1}月
        </h3>
        <motion.button
          onClick={() => changeMonth(1)}
          className="neomorphic-btn px-4 py-2 text-dark-text hover:text-dark-accent transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          翌月 →
        </motion.button>
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2">
        {/* 曜日ヘッダー */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-400 py-2"
          >
            {day}
          </div>
        ))}

        {/* 日付セル */}
        {calendarDays.map((day, index) => (
          <motion.div
            key={index}
            className={`
              min-h-[80px] p-2 rounded-lg border
              ${
                day.isCurrentMonth
                  ? 'bg-dark-card/50 border-white/10'
                  : 'bg-dark-card/20 border-white/5 opacity-50'
              }
              ${day.income !== 0 ? 'border-2' : ''}
              ${day.income > 0 ? 'border-green-500/50' : ''}
              ${day.income < 0 ? 'border-red-500/50' : ''}
            `}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.01 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-sm font-medium text-gray-300 mb-1">
              {day.date.getDate()}
            </div>
            {day.income !== 0 && (
              <div
                className={`text-xs font-bold ${
                  day.income >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {day.income >= 0 ? '+' : ''}
                {day.income.toLocaleString()}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

