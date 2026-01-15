
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Check, X, RefreshCw, AlertCircle, Settings, Eye, EyeOff, Copy } from 'lucide-react'

interface Integration {
  id: string
  name: string
  type: 'bank' | 'credit' | 'ecommerce' | 'pos' | 'accounting' | 'payment'
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  lastSync: string
  description: string
  logo: string
  features: string[]
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  created: string
  lastUsed: string
  status: 'active' | 'inactive'
}

const IntegrationSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'integrations' | 'api' | 'sync'>('integrations')
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({})

  const [integrations] = useState<Integration[]>([
    {
      id: '1',
      name: '三菱UFJ銀行',
      type: 'bank',
      status: 'connected',
      lastSync: '2024-01-15 09:30',
      description: '普通預金口座の取引履歴を自動取得',
      logo: '🏦',
      features: ['残高照会', '取引履歴', '自動仕訳']
    },
    {
      id: '2',
      name: '楽天カード',
      type: 'credit',
      status: 'connected',
      lastSync: '2024-01-15 08:45',
      description: 'クレジットカード利用明細を自動取得',
      logo: '💳',
      features: ['利用明細', '自動分類', 'レシート連携']
    },
    {
      id: '3',
      name: 'Amazon',
      type: 'ecommerce',
      status: 'error',
      lastSync: '2024-01-14 15:20',
      description: 'Amazon販売データの自動取得',
      logo: '📦',
      features: ['売上データ', '手数料計算', '在庫管理']
    },
    {
      id: '4',
      name: 'Square POS',
      type: 'pos',
      status: 'disconnected',
      lastSync: '未接続',
      description: 'POS売上データの自動取得',
      logo: '🛒',
      features: ['売上データ', '商品管理', 'レシート発行']
    },
    {
      id: '5',
      name: 'PayPal',
      type: 'payment',
      status: 'connected',
      lastSync: '2024-01-15 10:15',
      description: 'PayPal決済データの自動取得',
      logo: '💰',
      features: ['決済履歴', '手数料計算', '返金処理']
    },
    {
      id: '6',
      name: 'freee',
      type: 'accounting',
      status: 'pending',
      lastSync: '設定中',
      description: '会計ソフトとのデータ連携',
      logo: '📊',
      features: ['仕訳同期', 'レポート', '税務申告']
    }
  ])

  const [apiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'メインAPI',
      key: 'ak_live_1234567890abcdef...',
      permissions: ['read', 'write', 'admin'],
      created: '2024-01-01',
      lastUsed: '2024-01-15 09:30',
      status: 'active'
    },
    {
      id: '2',
      name: 'モバイルアプリ',
      key: 'ak_test_abcdef1234567890...',
      permissions: ['read'],
      created: '2024-01-10',
      lastUsed: '2024-01-14 16:45',
      status: 'active'
    },
    {
      id: '3',
      name: '開発用',
      key: 'ak_dev_fedcba0987654321...',
      permissions: ['read', 'write'],
      created: '2024-01-05',
      lastUsed: '2024-01-12 11:20',
      status: 'inactive'
    }
  ])

  const availableIntegrations = [
    { name: 'みずほ銀行', type: 'bank', logo: '🏦' },
    { name: 'りそな銀行', type: 'bank', logo: '🏦' },
    { name: 'イオンカード', type: 'credit', logo: '💳' },
    { name: 'JCBカード', type: 'credit', logo: '💳' },
    { name: 'Shopify', type: 'ecommerce', logo: '🛍️' },
    { name: 'BASE', type: 'ecommerce', logo: '🛍️' },
    { name: 'Airレジ', type: 'pos', logo: '📱' },
    { name: 'Stripe', type: 'payment', logo: '💳' },
    { name: 'マネーフォワード', type: 'accounting', logo: '📈' }
  ]

  const syncHistory = [
    { time: '2024-01-15 10:15', source: 'PayPal', type: '決済データ', count: 15, status: 'success' },
    { time: '2024-01-15 09:30', source: '三菱UFJ銀行', type: '取引履歴', count: 8, status: 'success' },
    { time: '2024-01-15 08:45', source: '楽天カード', type: '利用明細', count: 23, status: 'success' },
    { time: '2024-01-14 15:20', source: 'Amazon', type: '売上データ', count: 0, status: 'error' },
    { time: '2024-01-14 14:30', source: '三菱UFJ銀行', type: '取引履歴', count: 12, status: 'success' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'disconnected': return 'text-text-muted bg-surface-highlight'
      case 'error': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      default: return 'text-text-muted bg-surface-highlight'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return '接続済み'
      case 'disconnected': return '未接続'
      case 'error': return 'エラー'
      case 'pending': return '設定中'
      default: return '不明'
    }
  }

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    // トースト通知などを実装
  }

  const handleConnect = (integrationId: string) => {
    // 連携処理を実装
    console.log('Connecting to:', integrationId)
  }

  const handleDisconnect = (integrationId: string) => {
    // 切断処理を実装
    console.log('Disconnecting from:', integrationId)
  }

  const handleSync = (integrationId: string) => {
    // 同期処理を実装
    console.log('Syncing:', integrationId)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Under Development Notice */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-6 flex items-start gap-4 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-500/80 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h3 className="text-base font-semibold text-text-main mb-1">
              サービス連携は現在開発中です
            </h3>
            <p className="text-text-muted leading-relaxed">
              このページの機能は開発中のデモ表示です。実際の外部サービスとの連携はまだ行われていません。<br />
              今後のアップデートで順次対応予定です。
            </p>
          </div>
        </div>
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-main">連携設定</h1>
            <p className="text-text-muted">外部サービスとの連携を管理します</p>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-surface rounded-xl shadow-sm border border-border mb-6 overflow-hidden">
          <div>
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('integrations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'integrations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                サービス連携
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'api'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                API管理
              </button>
              <button
                onClick={() => setActiveTab('sync')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sync'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                同期履歴
              </button>
            </nav>
          </div>
        </div>

        {/* サービス連携タブ */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* 接続済みサービス */}
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 text-text-main">接続済みサービス</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{integration.logo}</span>
                        <div>
                          <h3 className="font-medium text-text-main">{integration.name}</h3>
                          <p className="text-sm text-text-muted">{integration.description}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(integration.status)}`}>
                        {getStatusText(integration.status)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-text-muted">最終同期: {integration.lastSync}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {integration.features.map((feature, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {integration.status === 'connected' ? (
                        <>
                          <button
                            onClick={() => handleSync(integration.id)}
                            className="flex-1 bg-primary text-white text-xs py-2 px-3 rounded hover:bg-primary/90"
                          >
                            <RefreshCw className="w-3 h-3 inline mr-1" />
                            同期
                          </button>
                          <button
                            onClick={() => handleDisconnect(integration.id)}
                            className="flex-1 bg-surface-highlight text-text-main text-xs py-2 px-3 rounded hover:bg-border"
                          >
                            切断
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration.id)}
                          className="w-full bg-green-600 text-white text-xs py-2 px-3 rounded hover:bg-green-700"
                        >
                          接続
                        </button>
                      )}
                      <button className="p-2 text-text-muted hover:text-text-main">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 利用可能なサービス */}
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 text-text-main">利用可能なサービス</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {availableIntegrations.map((service, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{service.logo}</span>
                        <div>
                          <h3 className="font-medium text-text-main">{service.name}</h3>
                          <p className="text-sm text-text-muted capitalize">{service.type}</p>
                        </div>
                      </div>
                      <button className="bg-primary text-white text-xs py-2 px-3 rounded hover:bg-primary/90">
                        <Plus className="w-3 h-3 inline mr-1" />
                        追加
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API管理タブ */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text-main">APIキー管理</h2>
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                  <Plus className="w-4 h-4 inline mr-2" />
                  新しいAPIキー
                </button>
              </div>

              {/* モバイル用カード表示 */}
              <div className="block md:hidden space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="bg-surface p-4 rounded-lg shadow-sm border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-text-main">{apiKey.name}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${apiKey.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-surface-highlight text-text-muted'
                        }`}>
                        {apiKey.status === 'active' ? 'アクティブ' : '無効'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">APIキー:</span>
                        <div className="flex items-center space-x-2">
                          <code className="bg-surface-highlight px-2 py-1 rounded text-xs">
                            {showApiKey[apiKey.id] ? apiKey.key : '••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => toggleApiKeyVisibility(apiKey.id)}
                            className="text-text-muted hover:text-text-main"
                          >
                            {showApiKey[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => copyApiKey(apiKey.key)}
                            className="text-text-muted hover:text-text-main"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">権限:</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {apiKey.permissions.map((permission, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">最終使用:</span>
                        <span className="text-text-main">{apiKey.lastUsed}</span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t border-border">
                      <button className="text-sm text-primary hover:text-primary/80 px-2 py-1">編集</button>
                      <button className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-2 py-1">削除</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-highlight">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">名前</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">APIキー</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">権限</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">最終使用</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">ステータス</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-border">
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">
                          {apiKey.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                          <div className="flex items-center space-x-2">
                            <code className="bg-surface-highlight px-2 py-1 rounded text-xs">
                              {showApiKey[apiKey.id] ? apiKey.key : '••••••••••••••••'}
                            </code>
                            <button
                              onClick={() => toggleApiKeyVisibility(apiKey.id)}
                              className="text-text-muted hover:text-text-main"
                            >
                              {showApiKey[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => copyApiKey(apiKey.key)}
                              className="text-text-muted hover:text-text-main"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.map((permission, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                          {apiKey.lastUsed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${apiKey.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-surface-highlight text-text-muted'
                            }`}>
                            {apiKey.status === 'active' ? 'アクティブ' : '無効'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary hover:text-primary/80">編集</button>
                            <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">削除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API使用状況 */}
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 text-text-main">API使用状況</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-300">今月のリクエスト数</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">12,547</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">上限: 50,000</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 dark:text-green-300">成功率</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">99.2%</p>
                  <p className="text-sm text-green-700 dark:text-green-300">12,447 / 12,547</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-900 dark:text-yellow-300">平均レスポンス時間</h3>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">245ms</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">過去24時間</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 同期履歴タブ */}
        {activeTab === 'sync' && (
          <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-main">同期履歴</h2>
              <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                <RefreshCw className="w-4 h-4 inline mr-2" />
                全て同期
              </button>
            </div>

            {/* モバイル用カード表示 */}
            <div className="block md:hidden space-y-4">
              {syncHistory.map((sync, index) => (
                <div key={index} className="bg-surface p-4 rounded-lg shadow-sm border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-text-main">{sync.source}</div>
                    <div className="flex items-center">
                      {sync.status === 'success' ? (
                        <Check className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${sync.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {sync.status === 'success' ? '成功' : 'エラー'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">データ種別:</span>
                      <span className="text-text-main">{sync.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">件数:</span>
                      <span className="text-text-main">{sync.count}件</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">時刻:</span>
                      <span className="text-text-main">{sync.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-highlight">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">時刻</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">サービス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">データ種別</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">件数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">ステータス</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {syncHistory.map((sync, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                        {sync.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">
                        {sync.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                        {sync.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                        {sync.count}件
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {sync.status === 'success' ? (
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                          )}
                          <span className={`text-sm ${sync.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                            {sync.status === 'success' ? '成功' : 'エラー'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default IntegrationSettings
