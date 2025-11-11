'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExpectationMaster, EXPECTATION_MASTER_STORAGE_KEY } from '@/lib/types'

interface ExpectationMasterManagerProps {
  onUpdate: () => void
}

export default function ExpectationMasterManager({ onUpdate }: ExpectationMasterManagerProps) {
  const [masters, setMasters] = useState<ExpectationMaster[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    machineName: '',
    target: '',
    game: '',
    expect: '',
  })

  // LocalStorageから期待値マスターデータ読み込み
  useEffect(() => {
    const stored = localStorage.getItem(EXPECTATION_MASTER_STORAGE_KEY)
    if (stored) {
      setMasters(JSON.parse(stored))
    }
  }, [])

  // マスターデータ追加
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.machineName.trim() || !formData.target.trim() || !formData.game || !formData.expect) return

    const newMaster: ExpectationMaster = {
      id: Date.now(),
      machineName: formData.machineName.trim(),
      target: formData.target.trim(),
      game: parseInt(formData.game) || 0,
      expect: parseFloat(formData.expect) || 0,
    }

    const updated = [...masters, newMaster]
    setMasters(updated)
    localStorage.setItem(EXPECTATION_MASTER_STORAGE_KEY, JSON.stringify(updated))
    setFormData({ machineName: '', target: '', game: '', expect: '' })
    onUpdate()
  }

  // マスターデータ削除
  const handleDelete = (id: number) => {
    if (confirm('このマスターデータを削除しますか？')) {
      const updated = masters.filter((m) => m.id !== id)
      setMasters(updated)
      localStorage.setItem(EXPECTATION_MASTER_STORAGE_KEY, JSON.stringify(updated))
      onUpdate()
    }
  }

  // ユニークな機種名リストを取得
  const uniqueMachineNames = Array.from(new Set(masters.map((m) => m.machineName))).sort()
  // ユニークな狙い目リストを取得
  const uniqueTargets = Array.from(new Set(masters.map((m) => m.target))).sort()
  // ユニークなゲーム数リストを取得
  const uniqueGames = Array.from(new Set(masters.map((m) => m.game))).sort((a, b) => a - b)

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-dark-accent">期待値マスターデータ管理</h3>
          <p className="text-xs text-gray-400 mt-1">
            登録データ数: {masters.length}件
          </p>
        </div>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="neomorphic-btn px-4 py-2 text-sm text-dark-accent hover:text-cyan-400 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? '閉じる' : '管理'}
        </motion.button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <p className="text-sm text-gray-400">
            機種名・狙い目・ゲーム数の組み合わせで期待値を登録します。データ登録フォームで選択すると自動的に期待値が表示されます。
          </p>
          {/* 追加フォーム */}
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={formData.machineName}
              onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
              placeholder="機種名"
              className="input-field"
              required
              list="machine-names"
            />
            <datalist id="machine-names">
              {uniqueMachineNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <input
              type="text"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              placeholder="狙い目"
              className="input-field"
              required
              list="targets"
            />
            <datalist id="targets">
              {uniqueTargets.map((target) => (
                <option key={target} value={target} />
              ))}
            </datalist>
            <input
              type="number"
              value={formData.game}
              onChange={(e) => setFormData({ ...formData, game: e.target.value })}
              placeholder="ゲーム数"
              min="0"
              className="input-field"
              required
              list="games"
            />
            <datalist id="games">
              {uniqueGames.map((game) => (
                <option key={game} value={game} />
              ))}
            </datalist>
            <input
              type="number"
              value={formData.expect}
              onChange={(e) => setFormData({ ...formData, expect: e.target.value })}
              placeholder="期待値"
              step="0.01"
              className="input-field"
              required
            />
            <motion.button
              type="submit"
              className="neomorphic-btn px-4 py-2 text-dark-accent hover:text-cyan-400 sm:col-span-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              追加
            </motion.button>
          </form>

          {/* マスターデータ一覧 */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {masters.length === 0 ? (
              <p className="text-center text-gray-400 py-4">マスターデータがありません</p>
            ) : (
              masters.map((master) => (
                <motion.div
                  key={master.id}
                  className="flex justify-between items-center p-3 bg-dark-card/30 rounded-lg border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex-1">
                    <div className="font-medium text-dark-text">{master.machineName}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      狙い目: {master.target} | ゲーム数: {master.game.toLocaleString()} | 期待値: ¥{master.expect.toLocaleString()}
                    </div>
                  </div>
                  <motion.button
                    onClick={() => handleDelete(master.id)}
                    className="text-red-400 hover:text-red-300 text-sm ml-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    削除
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

