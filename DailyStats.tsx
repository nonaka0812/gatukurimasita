'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { SlotData } from '@/lib/types'

interface DailyStatsProps {
  data: SlotData[]
}

export default function DailyStats({ data }: DailyStatsProps) {
  const dailyStats = useMemo(() => {
    const dailyIncome: Record<string, number> = {}
    data.forEach((item) => {
      if (!dailyIncome[item.date]) {
        dailyIncome[item.date] = 0
      }
      dailyIncome[item.date] += item.income
    })

    return Object.entries(dailyIncome)
      .map(([date, income]) => ({ date, income }))
      .sort((a, b) => {
        const dateA = new Date(a.date.replace(/\//g, '-'))
        const dateB = new Date(b.date.replace(/\//g, '-'))
        return dateB.getTime() - dateA.getTime()
      })
  }, [data])

  if (dailyStats.length === 0) {
    return (
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-dark-accent mb-6">日ごとの収支</h2>
        <div className="text-center text-gray-400 py-8">データがありません</div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-dark-accent mb-6">日ごとの収支</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dailyStats.map((stat, index) => (
          <motion.div
            key={stat.date}
            className={`
              p-4 rounded-xl border-l-4
              ${
                stat.income >= 0
                  ? 'bg-green-500/10 border-green-500'
                  : 'bg-red-500/10 border-red-500'
              }
            `}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05, x: 5 }}
          >
            <div className="text-sm text-gray-400 mb-2">{stat.date}</div>
            <div
              className={`text-xl font-bold ${
                stat.income >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {stat.income >= 0 ? '+' : ''}
              {stat.income.toLocaleString()}円
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

