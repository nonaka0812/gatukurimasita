'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { SlotData } from '@/lib/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface IncomeChartProps {
  data: SlotData[]
}

export default function IncomeChart({ data }: IncomeChartProps) {
  // 日ごとの収支を集計してソート
  const chartData = useMemo(() => {
    const dailyIncome: Record<string, number> = {}
    data.forEach((item) => {
      if (!dailyIncome[item.date]) {
        dailyIncome[item.date] = 0
      }
      dailyIncome[item.date] += item.income
    })

    const sortedDates = Object.keys(dailyIncome).sort((a, b) => {
      const dateA = new Date(a.replace(/\//g, '-'))
      const dateB = new Date(b.replace(/\//g, '-'))
      return dateA.getTime() - dateB.getTime()
    })

    return {
      labels: sortedDates,
      values: sortedDates.map((date) => dailyIncome[date]),
    }
  }, [data])

  // 累積収支の計算
  const cumulativeData = useMemo(() => {
    let cumulative = 0
    return chartData.values.map((value) => {
      cumulative += value
      return cumulative
    })
  }, [chartData.values])

  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: '日次収支',
        data: chartData.values,
        borderColor: '#00FFC6',
        backgroundColor: 'rgba(0, 255, 198, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#00FFC6',
        pointBorderColor: '#00FFC6',
      },
      {
        label: '累積収支',
        data: cumulativeData,
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#00D4FF',
        pointBorderColor: '#00D4FF',
      },
    ],
  }

  const barChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: '日次収支',
        data: chartData.values,
        backgroundColor: chartData.values.map((value) =>
          value >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
        ),
        borderColor: chartData.values.map((value) =>
          value >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#E0E0E0',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        titleColor: '#E0E0E0',
        bodyColor: '#E0E0E0',
        borderColor: '#00FFC6',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      y: {
        ticks: {
          color: '#9CA3AF',
          callback: function (value: string | number) {
            if (typeof value === 'number') {
              return '¥' + value.toLocaleString()
            }
            return value
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  }

  if (chartData.labels.length === 0) {
    return (
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-dark-accent mb-6">収支推移グラフ</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          データがありません
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-dark-accent mb-6">収支推移グラフ</h2>
      <div className="space-y-6">
        {/* 折れ線グラフ */}
        <div className="h-64">
          <Line data={lineChartData} options={chartOptions} />
        </div>
        {/* 棒グラフ */}
        <div className="h-64">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>
    </motion.div>
  )
}

