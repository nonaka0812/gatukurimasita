'use client'

import { motion } from 'framer-motion'
import { SlotData } from '@/lib/types'

interface StatsCardsProps {
  data: SlotData[]
}

export default function StatsCards({ data }: StatsCardsProps) {
  const totalExpect = data.reduce((sum, item) => sum + item.expect, 0)
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0)
  const totalGames = data.reduce((sum, item) => sum + item.game, 0)

  const stats = [
    {
      label: '合計期待値',
      value: totalExpect,
      color: 'text-dark-accent',
      icon: '📊',
    },
    {
      label: '合計収支',
      value: totalIncome,
      color: totalIncome >= 0 ? 'text-green-400' : 'text-red-400',
      icon: '💰',
    },
    {
      label: '総ゲーム数',
      value: totalGames,
      color: 'text-cyan-400',
      icon: '🎮',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <span className="text-sm text-gray-400">{stat.label}</span>
          </div>
          <div className={`text-3xl font-bold ${stat.color}`}>
            {typeof stat.value === 'number' && stat.value !== totalGames
              ? `¥${stat.value >= 0 ? '+' : ''}${stat.value.toLocaleString()}`
              : stat.value.toLocaleString()}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

