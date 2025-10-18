# AInance会計アプリ

AInanceは、音声認識機能を搭載したスマート会計アプリケーションです。

## 機能

- 音声入力による取引登録
- ダッシュボードでの収支分析
- 取引履歴の管理
- AIによる自動仕訳
- レシートのOCR読み取り

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

または

```bash
pnpm install
```

### 2. 環境変数の設定

`.env`ファイルに以下の環境変数を設定してください：

```env
# MySQL接続情報
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=ainance
MYSQL_PORT=3306
```

### 3. MySQLデータベースのセットアップ

1. MySQLサーバーを起動してください
2. `src/entities/mysql_tables.sql`ファイルのSQLを実行して、必要なテーブルを作成してください

### 4. アプリケーションの起動

```bash
npm run dev
```

または

```bash
pnpm dev
```

## データベース設計

### transactionsテーブル

| カラム名 | 型 | 説明 |
|---------|---|-----|
| id | INT AUTO_INCREMENT PRIMARY KEY | 一意の識別子 |
| item | VARCHAR(255) | 取引項目 |
| amount | DECIMAL(10, 2) | 金額 |
| date | DATE | 取引日 |
| category | VARCHAR(100) | カテゴリ |
| type | VARCHAR(100) | 収支タイプ（income/expense） |
| description | TEXT | 説明 |
| receipt_url | VARCHAR(500) | レシート画像のURL |
| creator | VARCHAR(255) | 作成者 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |
| tags | TEXT | タグ |
| location | VARCHAR(255) | 場所 |
| recurring | BOOLEAN | 繰り返し取引フラグ |
| recurring_frequency | VARCHAR(20) | 繰り返し頻度 |

### ai_transactionsテーブル

AIによる自動仕訳用のテーブルです。

## デプロイ

```bash
npm run build
```

または

```bash
pnpm build
```

## ライセンス

MIT