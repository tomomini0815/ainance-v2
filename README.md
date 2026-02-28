# Ainance v2 (AInance会計アプリ)

Ainanceは、AIと音声認識を最大限に活用した、次世代型のスマート会計・税務支援プラットフォームです。
複雑な会計業務や税務申告を、対話形式や自動化によって「もっと身近に、もっと簡単に」することを目指しています。

## 🚀 主要機能

### 🤖 AIアシスタント & 自動化
- **AIチャット registro**: Gemini APIを活用し、自然な会話（テキスト・音声）から取引を自動的に判別・登録。
- **インテリジェント仕訳**: 過去のデータやキーワードに基づき、勘定科目を高精度で自動推論。
- **レシートOCR**: 写真をアップロードするだけで、日付・金額・店舗名を瞬時にデータ化。

### 📄 税務・決算支援
- **法人税申告ウィザード**: 複雑な法人税申告をステップバイステップでナビゲート。
- **申告書PDF自動生成**: 入力データに基づき、税務署提出用のPDF（別表、決算書等）を自動作成。
- **e-Tax連携**: 電子申告に必要なデータフォーマットへの書き出しに対応。

### 💼 業務管理
- **インボイス作成・管理**: 適格請求書の作成、管理、およびPDF出力。
- **助成金マッチング**: 事業内容に適した助成金・補助金をAIが提案。
- **キャッシュフロー分析**: 収支の推移をリアルタイムで可視化するモダンなダッシュボード。

## 🛠 技術スタック

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Framer Motion (アニメーション)
- **State Management**: Zustand, React Hook Form
- **AI**: Google Gemini Pro 1.5 / Flash
- **Database**: Supabase (cloud), Firebase
- **PDF**: pdf-lib, jspdf (日本語フォント埋め込み対応)
- **OCR**: Tesseract.js / Google Cloud Vision

## 📦 セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env`ファイルをルートディレクトリに作成し、`.env.example`を参考に以下の情報を設定してください。
```env
# Gemini API Key
VITE_GEMINI_API_KEY=your_key_here

# Supabase
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### 3. アプリケーションの起動
```bash
# クライアント(Vite)
npm run dev
```

## 📂 ディレクトリ構成
- `src/pages`: 各機能のメイン画面（法人税、インボイス、分析など）
- `src/services`: ビジネスロジック・外部API連携（AI, PDF生成, DB操作）
- `src/components`: 再利用可能なUIコンポーネント
- `src/types`: TypeScriptの型定義

## 📜 ライセンス
MIT License

---
*Updated: 2026-02-25*
