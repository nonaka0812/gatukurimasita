'use client'

import { motion } from 'framer-motion'
import { SlotData } from '@/lib/types'

interface DataTableProps {
  data: SlotData[]
  onDelete: (id: number) => void
  onDeleteAll: () => void
  onSort: (key: keyof SlotData) => void
  sortConfig: { key: keyof SlotData | null; direction: 'asc' | 'desc' }
}

export default function DataTable({
  data,
  onDelete,
  onDeleteAll,
  onSort,
  sortConfig,
}: DataTableProps) {
  const SortIcon = ({ column }: { column: keyof SlotData }) => {
    if (sortConfig.key !== column) {
      return <span className="text-gray-500 text-xs">↕</span>
    }
    return (
      <span className="text-dark-accent">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  if (data.length === 0) {
    return (
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-dark-accent mb-6">登録データ一覧</h2>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-dark-accent">登録データ一覧</h2>
        <motion.button
          onClick={onDeleteAll}
          className="neomorphic-btn px-4 py-2 text-red-400 hover:text-red-300 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          全削除
        </motion.button>
      </div>

      {/* モバイル用カード表示 */}
      <div className="block md:hidden space-y-4">
        {data.map((item, index) => (
          <motion.div
            key={item.id}
            className="bg-dark-card/50 p-4 rounded-xl border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-dark-accent">{item.name}</h3>
              <motion.button
                onClick={() => onDelete(item.id)}
                className="text-red-400 hover:text-red-300 text-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                削除
              </motion.button>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">狙い目:</span>{' '}
                <span className="text-dark-text">{item.target}</span>
              </div>
              <div>
                <span className="text-gray-400">ゲーム数:</span>{' '}
                <span className="text-dark-text">{item.game.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">期待値:</span>{' '}
                <span className="text-dark-text">¥{item.expect.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">収支:</span>{' '}
                <span
                  className={`font-bold ${
                    item.income >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {item.income >= 0 ? '+' : ''}¥{item.income.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">{item.date}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* PC用テーブル表示 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-dark-accent transition-colors"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center gap-2">
                  機種名 <SortIcon column="name" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-dark-accent transition-colors"
                onClick={() => onSort('target')}
              >
                <div className="flex items-center gap-2">
                  狙い目 <SortIcon column="target" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-dark-accent transition-colors"
                onClick={() => onSort('game')}
              >
                <div className="flex items-center justify-end gap-2">
                  ゲーム数 <SortIcon column="game" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-dark-accent transition-colors"
                onClick={() => onSort('expect')}
              >
                <div className="flex items-center justify-end gap-2">
                  期待値 <SortIcon column="expect" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-dark-accent transition-colors"
                onClick={() => onSort('income')}
              >
                <div className="flex items-center justify-end gap-2">
                  収支 <SortIcon column="income" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 text-sm font-semibold text-gray-400 cursor-pointer hover:text-dark-accent transition-colors"
                onClick={() => onSort('date')}
              >
                <div className="flex items-center gap-2">
                  日付 <SortIcon column="date" />
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <motion.tr
                key={item.id}
                className="border-b border-white/5 hover:bg-dark-card/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <td className="py-4 px-4 text-dark-text font-medium">{item.name}</td>
                <td className="py-4 px-4 text-gray-300">{item.target}</td>
                <td className="py-4 px-4 text-right text-gray-300">
                  {item.game.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right text-gray-300">
                  ¥{item.expect.toLocaleString()}
                </td>
                <td
                  className={`py-4 px-4 text-right font-bold ${
                    item.income >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {item.income >= 0 ? '+' : ''}¥{item.income.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-gray-400 text-sm">{item.date}</td>
                <td className="py-4 px-4 text-center">
                  <motion.button
                    onClick={() => onDelete(item.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    削除
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

