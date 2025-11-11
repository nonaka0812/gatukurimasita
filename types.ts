// スロットデータの型定義
export interface SlotData {
  id: number
  name: string
  target: string
  game: number
  expect: number
  income: number
  date: string
}

// 期待値マスターデータの型定義（機種名 + 狙い目 + ゲーム数 → 期待値）
export interface ExpectationMaster {
  id: number
  machineName: string // 機種名
  target: string // 狙い目
  game: number // ゲーム数
  expect: number // 期待値
}

// ストレージキー
export const STORAGE_KEY = 'slotData'
export const EXPECTATION_MASTER_STORAGE_KEY = 'expectationMasterData'

