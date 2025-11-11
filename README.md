# 🎰 スロット稼働・期待値管理ツール

プロフェッショナルなスロット収支・期待値管理アプリケーション

## ✨ 機能

- 📝 **データ登録**: 機種名・狙い目・ゲーム数・期待値・収支を登録
- 🔍 **検索・ソート**: 機種名で検索、各カラムでソート可能
- 📊 **統計表示**: 合計期待値・合計収支・総ゲーム数を表示
- 📅 **カレンダー表示**: 日ごとの収支をカレンダーで可視化
- 📈 **収支推移グラフ**: 折れ線グラフと棒グラフで収支の推移を表示
- 📱 **レスポンシブ対応**: スマホ・タブレット・PCに対応
- 🌙 **ダークモード**: 目に優しいダークテーマ
- 💾 **LocalStorage保存**: ブラウザにデータを自動保存

## 🚀 セットアップ

### 必要な環境

- Node.js 18以上
- npm または yarn

### インストール

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### ビルド

```bash
# 本番用ビルド
npm run build

# 本番サーバーの起動
npm start
```

## 🛠️ 使用技術

- **Next.js 14**: Reactフレームワーク
- **TypeScript**: 型安全性
- **Tailwind CSS**: ユーティリティファーストのCSS
- **Framer Motion**: スムーズなアニメーション
- **Chart.js**: グラフ表示
- **LocalStorage**: データ永続化

## 📁 プロジェクト構造

```
.
├── app/
│   ├── globals.css      # グローバルスタイル
│   ├── layout.tsx       # レイアウト
│   └── page.tsx         # メインページ
├── components/
│   ├── DataForm.tsx     # データ登録フォーム
│   ├── SearchBar.tsx    # 検索バー
│   ├── StatsCards.tsx   # 統計カード
│   ├── CalendarView.tsx # カレンダー表示
│   ├── IncomeChart.tsx  # 収支推移グラフ
│   ├── DailyStats.tsx   # 日ごとの収支
│   └── DataTable.tsx    # データテーブル
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 デザイン特徴

- **グラスモーフィズム**: 透明感のあるカードデザイン
- **ニューモーフィズム**: 立体感のあるボタン
- **スムーズなアニメーション**: Framer Motionによる滑らかな動き
- **統一された配色**: ダークテーマ + アクセントカラー（#00FFC6）

## 📝 ライセンス

MIT

