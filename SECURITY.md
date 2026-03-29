# セキュリティガイドライン (Security Guidelines)

AinanceプロジェクトにおけるAPIキーやシークレット情報の安全な取扱手順に関するドキュメントです。
過去にビルドファイルへのハードコーディングによるキー漏洩が発生した反省を踏まえ、**すべての開発者**はこのガイドラインを遵守してください。

## 1. 🔑 APIキーの厳格な管理ルール

- **【禁止】ソースコードへの直接記述（ハードコーディング）**
  `.ts`, `.js`, `.tsx` 等のファイル内に直接 `AIzaSy...` などのAPIキーを書き込むことは**絶対に禁止**です。
- **【必須】環境変数（`.env`）の使用**
  機密情報は必ずプロジェクトルートにある `.env` ファイルに記述してください。

## 2. 📝 `.env` ファイルの正しい使い方

ローカル（自分のPC）での開発時は以下の手順を踏みます。

1. **`.env` ファイルの作成**
   プロジェクトディレクトリの直下に `.env` ファイルを作成します。
2. **キーの定義**
   Vite環境では、ブラウザで参照する環境変数には必ず `VITE_` プレフィックスを付けます。
   ```env
   VITE_GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJh...
   ```
3. **`.gitignore` による不可視化の徹底**
   `.env` は絶対にGitにコミットしてはいけません。
   （`.gitignore` ファイル内に `.env` が含まれていることを常に確認してください）

## 3. 💻 コードからAPIキーを呼び出す方法

コード内では、文字列ではなく以下のように `import.meta.env` を経由して安全に呼び出します。

```typescript
// ⭕️ 正しい呼び出し方 (Vite環境)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('環境変数にVITE_GEMINI_API_KEYが設定されていません');
}
```

## 4. 🚀 本番環境（Vercel）への自動デプロイ時の設定

`.env` はGitHubにアップロードされないため、そのままではVercelのビルド時にAPIキーが存在せずエラーになります。

- **Vercelのダッシュボードで設定する**
  1. Vercelの該当プロジェクトの `Settings` を開く
  2. `Environment Variables` を選択
  3. Key に `VITE_GEMINI_API_KEY`、Value に実際のAPI文字列を入力して `Save` を押す

これにより、本番環境のビルド時のみ安全にAPIキーが展開されます。
