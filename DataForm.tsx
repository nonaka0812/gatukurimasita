'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SlotData, ExpectationMaster, EXPECTATION_MASTER_STORAGE_KEY } from '@/lib/types'

interface DataFormProps {
  onAdd: (data: Omit<SlotData, 'id' | 'date'>) => void
}

export default function DataForm({ onAdd }: DataFormProps) {
  const [masters, setMasters] = useState<ExpectationMaster[]>([])
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    game: '',
    expect: '',
    income: '',
  })

  // LocalStorageから期待値マスターデータ読み込み
  useEffect(() => {
    const loadMasters = () => {
      const stored = localStorage.getItem(EXPECTATION_MASTER_STORAGE_KEY)
      if (stored) {
        setMasters(JSON.parse(stored))
      }
    }
    loadMasters()
    // ストレージ変更を監視（マスターデータ更新時に再読み込み）
    const interval = setInterval(loadMasters, 1000)
    return () => clearInterval(interval)
  }, [])

  // ユニークな機種名・狙い目・ゲーム数のリスト
  const uniqueMachineNames = useMemo(() => 
    Array.from(new Set(masters.map((m) => m.machineName))).sort(), 
    [masters]
  )
  const uniqueTargets = useMemo(() => 
    Array.from(new Set(masters.map((m) => m.target))).sort(), 
    [masters]
  )
  const uniqueGames = useMemo(() => 
    Array.from(new Set(masters.map((m) => m.game))).sort((a, b) => a - b), 
    [masters]
  )

  // 機種名・狙い目・ゲーム数が選択されたら期待値を自動検索
  useEffect(() => {
    if (formData.name && formData.target && formData.game) {
      const matched = masters.find(
        (m) =>
          m.machineName === formData.name &&
          m.target === formData.target &&
          m.game === parseInt(formData.game)
      )
      if (matched) {
        setFormData((prev) => ({ ...prev, expect: matched.expect.toString() }))
      } else {
        setFormData((prev) => ({ ...prev, expect: '' }))
      }
    } else {
      setFormData((prev) => ({ ...prev, expect: '' }))
    }
  }, [formData.name, formData.target, formData.game, masters])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 期待値が設定されているか確認
    if (!formData.expect) {
      alert('機種名・狙い目・ゲーム数を選択して期待値を表示してください。')
      return
    }
    
    onAdd({
      name: formData.name.trim(),
      target: formData.target.trim(),
      game: parseInt(formData.game) || 0,
      expect: parseFloat(formData.expect) || 0,
      income: parseFloat(formData.income) || 0,
    })
    setFormData({ name: '', target: '', game: '', expect: '', income: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <motion.div
      className="glass-card p-6 sm:p-8"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <h2 className="text-2xl font-bold text-dark-accent mb-6">データ登録</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              機種名
            </label>
            <select
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field cursor-pointer"
            >
              <option value="">機種を選択してください</option>
              {uniqueMachineNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {uniqueMachineNames.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                機種データがありません。マスターデータ管理から追加してください。
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              狙い目
            </label>
            <select
              name="target"
              value={formData.target}
              onChange={handleChange}
              required
              className="input-field cursor-pointer"
            >
              <option value="">狙い目を選択してください</option>
              {uniqueTargets.map((target) => (
                <option key={target} value={target}>
                  {target}
                </option>
              ))}
            </select>
            {uniqueTargets.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                狙い目データがありません。マスターデータ管理から追加してください。
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ゲーム数
            </label>
            <select
              name="game"
              value={formData.game}
              onChange={handleChange}
              required
              className="input-field cursor-pointer"
            >
              <option value="">ゲーム数を選択してください</option>
              {uniqueGames.map((game) => (
                <option key={game} value={game}>
                  {game.toLocaleString()}
                </option>
              ))}
            </select>
            {uniqueGames.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                ゲーム数データがありません。マスターデータ管理から追加してください。
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              期待値
            </label>
            <input
              type="number"
              name="expect"
              value={formData.expect}
              readOnly
              step="0.01"
              placeholder="機種・狙い目・ゲーム数を選択すると自動表示"
              className="input-field bg-dark-card/30 cursor-not-allowed"
            />
            {formData.expect && (
              <p className="text-xs text-dark-accent mt-1">
                ✓ マスターデータから自動設定されました
              </p>
            )}
            {!formData.expect && formData.name && formData.target && formData.game && (
              <p className="text-xs text-yellow-400 mt-1">
                ⚠ 該当する期待値データが見つかりません
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              実際の収支
            </label>
            <input
              type="number"
              name="income"
              value={formData.income}
              onChange={handleChange}
              required
              step="0.01"
              placeholder="例: -3000 (マイナス可)"
              className="input-field"
            />
          </div>
        </div>
        <motion.button
          type="submit"
          className="w-full neomorphic-btn px-6 py-3 text-white font-semibold rounded-xl bg-gradient-to-r from-dark-accent to-cyan-500 hover:from-cyan-400 hover:to-dark-accent transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          登録
        </motion.button>
      </form>
    </motion.div>
  )
}

