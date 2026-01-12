# Vercel デプロイ & カスタムドメイン設定ガイド

このガイドでは、AinanceアプリケーションをVercelにデプロイし、お名前.comで取得した `ainance.jp` ドメインを設定する手順を説明します。

---

## 📋 事前準備

- [x] GitHubアカウント
- [x] Vercelアカウント（GitHubでサインアップ推奨）
- [x] お名前.comで `ainance.jp` ドメインを取得済み

---

## ステップ1: Vercelにプロジェクトをインポート

1. **Vercelにログイン**
   - [https://vercel.com/login](https://vercel.com/login) にアクセス
   - 「Continue with GitHub」でログイン

2. **新しいプロジェクトを作成**
   - ダッシュボードで「Add New...」→「Project」をクリック
   - 「Import Git Repository」セクションで `ainance-v2` リポジトリを探す
   - 「Import」をクリック

3. **プロジェクト設定**
   - **Framework Preset**: `Vite` を選択（自動検出される場合が多い）
   - **Build Command**: `npm run build`（デフォルトのまま）
   - **Output Directory**: `dist`（デフォルトのまま）
   - **Environment Variables**: 以下を追加
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     VITE_GOOGLE_VISION_API_KEY=your_google_vision_api_key_here
     ```

4. **デプロイ**
   - 「Deploy」をクリック
   - ビルドが完了するまで待機（2-3分程度）

> [!TIP]
> デプロイ成功後、`https://ainance-v2-xxxxx.vercel.app` のようなURLでアクセス可能になります。

---

## ステップ2: Vercelでカスタムドメインを追加

1. **プロジェクト設定を開く**
   - Vercelダッシュボードでプロジェクトを選択
   - 「Settings」タブをクリック
   - 左サイドバーで「Domains」を選択

2. **ドメインを追加**
   - 入力欄に `ainance.jp` と入力
   - 「Add」をクリック

3. **DNS設定情報を確認**
   - Vercelが表示するDNS設定情報をメモします：
     - **Aレコード**: `76.76.21.21`（Vercelの標準IP）
     - **CNAMEレコード**: `cname.vercel-dns.com`

> [!IMPORTANT]
> Vercelは通常、ルートドメイン（`ainance.jp`）には**Aレコード**、サブドメイン（`www.ainance.jp`）には**CNAMEレコード**を推奨します。

---

## ステップ3: お名前.comでDNS設定

1. **お名前.com Naviにログイン**
   - [https://navi.onamae.com/](https://navi.onamae.com/) にアクセス
   - ログイン

2. **DNS設定画面を開く**
   - 「ドメイン」→「ドメイン機能一覧」
   - 「DNS関連機能の設定」→「DNSレコード設定を利用する」
   - `ainance.jp` を選択して「次へ」

3. **Aレコードを追加（ルートドメイン用）**
   | 項目 | 設定値 |
   |------|--------|
   | ホスト名 | (空欄のまま) |
   | TYPE | A |
   | TTL | 3600 |
   | VALUE | `76.76.21.21` |

   「追加」をクリック

4. **CNAMEレコードを追加（www用）**
   | 項目 | 設定値 |
   |------|--------|
   | ホスト名 | www |
   | TYPE | CNAME |
   | TTL | 3600 |
   | VALUE | `cname.vercel-dns.com` |

   「追加」をクリック

5. **設定を確認して保存**
   - 「確認画面へ進む」→「設定する」

> [!WARNING]
> DNS設定の反映には最大24-48時間かかる場合がありますが、通常は数分〜数時間で反映されます。

---

## ステップ4: SSL証明書の確認

Vercelは自動的にSSL証明書（HTTPS）を発行します。

1. **Vercelダッシュボードで確認**
   - 「Settings」→「Domains」
   - ドメインの横に緑色のチェックマーク（✓）が表示されれば設定完了

2. **エラーが表示される場合**
   - DNS設定の反映を待つ（数時間〜最大48時間）
   - 「Refresh」ボタンをクリックして再確認

---

## ステップ5: 動作確認

1. ブラウザで `https://ainance.jp` にアクセス
2. ページが正常に表示されることを確認
3. ページをリロードしても404エラーが出ないことを確認
4. `https://www.ainance.jp` からも `ainance.jp` にリダイレクトされることを確認

---

## 🔧 トラブルシューティング

### DNS設定が反映されない
- 設定後、最大48時間待つ
- [https://dnschecker.org/](https://dnschecker.org/) でDNS伝播状況を確認

### SSL証明書エラー
- Vercelダッシュボードで「Refresh」をクリック
- DNS設定が正しいか再確認

### ビルドエラー
- Vercelダッシュボードで「Deployments」タブからログを確認
- 環境変数が正しく設定されているか確認

---

## 📝 環境変数一覧

| 変数名 | 説明 |
|--------|------|
| `VITE_GEMINI_API_KEY` | Google Gemini API キー |
| `VITE_GOOGLE_VISION_API_KEY` | Google Cloud Vision API キー |

---

## ✅ 完了チェックリスト

- [ ] Vercelにプロジェクトをインポート
- [ ] 環境変数を設定
- [ ] 初回デプロイ成功
- [ ] カスタムドメイン `ainance.jp` を追加
- [ ] お名前.comでAレコードを設定
- [ ] お名前.comでCNAMEレコードを設定
- [ ] SSL証明書が有効化
- [ ] `https://ainance.jp` でアクセス確認
