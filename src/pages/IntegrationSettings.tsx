
import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Check, RefreshCw, AlertCircle, Settings, Eye, EyeOff, Copy, Building2, User, Save, Loader2, Upload, FileText, ExternalLink } from 'lucide-react'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'
import { useAuth } from '../hooks/useAuth'
import PreviousYearImportModal from '../components/PreviousYearImportModal'
import BalanceSheetImportModal from '../components/BalanceSheetImportModal'
import { yearlySettlementService, YearlySettlement } from '../services/yearlySettlementService'
import { yearlyBalanceSheetService, YearlyBalanceSheet } from '../services/yearlyBalanceSheetService'
import { storageService } from '../services/storageService'
import toast from 'react-hot-toast'

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
  const { user, signOut } = useAuth();
  const { currentBusinessType, businessTypes, switchBusinessType, updateBusinessType } = useBusinessTypeContext();
  const [activeTab, setActiveTab] = useState<'integrations' | 'api' | 'sync' | 'setup' | 'invoice' | 'account'>('setup')
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({})
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // モーダル管理
  const [isPLModalOpen, setIsPLModalOpen] = useState(false);
  const [isBSModalOpen, setIsBSModalOpen] = useState(false);

  // フォーム用ステート
  const [taxNumber, setTaxNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [establishedDate, setEstablishedDate] = useState('');
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState<number>(4);
  const [capitalAmount, setCapitalAmount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  // 保存済みデータ
  const [savedPL, setSavedPL] = useState<YearlySettlement | null>(null);
  const [savedBS, setSavedBS] = useState<YearlyBalanceSheet | null>(null);

  const fetchFinancialData = useCallback(async () => {
    if (!user || !currentBusinessType) return;
    try {
      // 最新のデータを取得（前年度分を想定）
      // ここでは全件取得して最新のものを採用、または特定年度を指定することも可能
      // 今回はシンプルに最新のものを取得して表示する
      const plList = await yearlySettlementService.getAllByBusinessType(user.id, currentBusinessType.business_type);
      const bsList = await yearlyBalanceSheetService.getAllByBusinessType(user.id, currentBusinessType.business_type);

      if (plList.length > 0) setSavedPL(plList[0]);
      if (bsList.length > 0) setSavedBS(bsList[0]);
    } catch (error) {
      console.error('Fetch Financial Data Error:', error);
    }
  }, [user, currentBusinessType]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleViewDocument = async (path: string) => {
    if (!path) return;
    const toastId = toast.loading('書類を開いています...');
    try {
      const url = await storageService.getSignedUrl(path);
      if (url) {
        window.open(url, '_blank');
        toast.success('書類を開きました', { id: toastId });
      } else {
        toast.error('書類の取得に失敗しました', { id: toastId });
      }
    } catch (error) {
      console.error('View Document Error:', error);
      toast.error('エラーが発生しました', { id: toastId });
    }
  };

  // 業態が切り替わった時にステートを同期
  useEffect(() => {
    if (currentBusinessType) {
      setTaxNumber(currentBusinessType.tax_number || '');
      setCompanyName(currentBusinessType.company_name || '');
      setAddress(currentBusinessType.address || '');
      setPhone(currentBusinessType.phone || '');
      setEmail(currentBusinessType.email || '');
      setRepresentativeName(currentBusinessType.representative_name || '');
      setEstablishedDate(currentBusinessType.established_date || '');
      setFiscalYearStartMonth(currentBusinessType.fiscal_year_start_month || (currentBusinessType.business_type === 'individual' ? 1 : 4));
      setCapitalAmount(currentBusinessType.capital_amount || 0);
    }
  }, [currentBusinessType]);

  const handleSaveSettings = async () => {
    if (!currentBusinessType) return;
    setIsSaving(true);
    try {
      await updateBusinessType(currentBusinessType.id, {
        tax_number: taxNumber,
        company_name: companyName,
        address,
        phone,
        email,
        representative_name: representativeName,
        established_date: establishedDate || null,
        fiscal_year_start_month: fiscalYearStartMonth,
        capital_amount: capitalAmount
      });
      toast.success('設定を保存しました');
    } catch (error) {
      console.error('Save Settings Error:', error);
      toast.error('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      // 実際にはアカウント削除APIを呼び出します
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      toast.success('アカウントを削除しました（退会完了）');
      await signOut();
    } catch (error) {
      toast.error('アカウントの削除に失敗しました');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  const [integrations] = useState<Integration[]>([])

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
    { name: 'Shopify', type: 'ecommerce', logo: '🛍️' },
    { name: 'BASE', type: 'ecommerce', logo: '🛍️' },
    { name: 'Airレジ', type: 'pos', logo: '📱' },
    { name: 'Stripe', type: 'payment', logo: '💳' }
  ]

  const syncHistory: any[] = []

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
                onClick={() => setActiveTab('setup')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'setup'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                初期設定
              </button>
              <button
                onClick={() => setActiveTab('invoice')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'invoice'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                インボイス設定
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'integrations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                サービス連携
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'api'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                API管理
              </button>
              <button
                onClick={() => setActiveTab('sync')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'sync'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                同期履歴
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'account'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
              >
                アカウント設定
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
              {integrations.length === 0 ? (
                <div className="bg-surface-highlight border border-border rounded-lg p-8 text-center mt-2">
                  <p className="text-text-muted text-sm">現在接続済みのサービスはありません。<br/>下の「利用可能なサービス」から設定してください。</p>
                </div>
              ) : (
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
              )}
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

            {syncHistory.length === 0 ? (
              <div className="bg-surface-highlight border border-border rounded-lg p-8 text-center mt-4">
                <p className="text-text-muted text-sm">完了した同期履歴はありません。</p>
              </div>
            ) : (
              <>
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
            </>
            )}
          </div>
        )}

        {/* 初期設定タブ */}
        {activeTab === 'setup' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold mb-6 text-text-main">
                初期設定 ({currentBusinessType?.business_type === 'individual' ? '個人事業主' : '法人'})
              </h2>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">事業形態の切り替え</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['individual', 'corporation'].map((type) => {
                      const targetType = businessTypes.find(bt => bt.business_type === type);
                      const isActive = currentBusinessType?.business_type === type;
                      return (
                        <button
                          key={type}
                          onClick={() => targetType && switchBusinessType(targetType.id)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg font-medium transition-all ${isActive
                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                            : 'border-border text-text-muted hover:border-primary/30 hover:text-text-main'
                            }`}
                        >
                          {type === 'individual' ? <User size={18} /> : <Building2 size={18} />}
                          {type === 'individual' ? '個人事業主' : '法人'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">基本情報</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">屋号・会社名</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2 text-text-main focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">代表者名</label>
                      <input
                        type="text"
                        value={representativeName}
                        onChange={(e) => setRepresentativeName(e.target.value)}
                        className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2 text-text-main focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-text-muted mb-1">所在地</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2 text-text-main focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">電話番号</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2 text-text-main focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">メールアドレス</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2 text-text-main focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">設立日・事業開始日</label>
                      <input
                        type="date"
                        value={establishedDate}
                        onChange={(e) => setEstablishedDate(e.target.value)}
                        className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2 text-text-main focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">
                        {currentBusinessType?.business_type === 'corporation' ? '法人番号' : '登録番号 (インボイス番号)'}
                      </label>
                      <div className="relative">
                        {currentBusinessType?.business_type === 'individual' && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-medium text-sm">T</span>
                        )}
                        <input
                          type="text"
                          placeholder="13桁の数字"
                          value={taxNumber.replace(/^T/, '')}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 13);
                            if (currentBusinessType?.business_type === 'individual') {
                              setTaxNumber('T' + val);
                            } else {
                              setTaxNumber(val);
                            }
                          }}
                          className={`w-full bg-surface-highlight border border-border rounded-lg ${currentBusinessType?.business_type === 'individual' ? 'pl-7' : 'px-4'} pr-4 py-2 text-text-main focus:ring-2 focus:ring-primary/50 outline-none`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">決算開始月（会計初月）</label>
                      <select
                        className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2 text-text-main focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        value={fiscalYearStartMonth}
                        onChange={(e) => setFiscalYearStartMonth(parseInt(e.target.value))}
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}月</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">資本金</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-medium text-sm">¥</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={capitalAmount}
                          onChange={(e) => setCapitalAmount(Number(e.target.value))}
                          className="w-full bg-surface-highlight border border-border rounded-lg pl-7 pr-4 py-2 text-text-main focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-md font-medium text-text-main mb-4">前期データの引き継ぎ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* P&L Section */}
                  <div className="bg-surface-highlight p-4 rounded-lg border border-dashed border-border flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-text-main font-medium">前期損益計算書 (P&L)</p>
                        <p className="text-xs text-text-muted mt-1">
                          {savedPL ? `${savedPL.year}年度データ取込済` : '前期の実績を取り込みます'}
                        </p>
                      </div>
                      {savedPL && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => setIsPLModalOpen(true)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload size={14} /> {savedPL ? '再インポート' : 'P&Lインポート'}
                      </button>
                      {savedPL?.document_path && (
                        <button
                          onClick={() => handleViewDocument(savedPL.document_path!)}
                          className="bg-surface hover:bg-surface-highlight border border-border text-text-main px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                          title="書類を表示"
                        >
                          <FileText size={14} className="mr-1" />
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* B/S Section */}
                  <div className="bg-surface-highlight p-4 rounded-lg border border-dashed border-border flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-text-main font-medium">前期貸借対照表 (B/S)</p>
                        <p className="text-xs text-text-muted mt-1">
                          {savedBS ? `${savedBS.year}年度データ取込済` : '期首残高を設定します'}
                        </p>
                      </div>
                      {savedBS && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => setIsBSModalOpen(true)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload size={14} /> {savedBS ? '再インポート' : 'B/Sインポート'}
                      </button>
                      {savedBS?.document_path && (
                        <button
                          onClick={() => handleViewDocument(savedBS.document_path!)}
                          className="bg-surface hover:bg-surface-highlight border border-border text-text-main px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                          title="書類を表示"
                        >
                          <FileText size={14} className="mr-1" />
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {currentBusinessType?.business_type === 'individual' ? '個人事業主' : '法人'}の設定を保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* インボイス設定タブ */}
        {activeTab === 'invoice' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold mb-6 text-text-main">
                インボイス制度の設定 ({currentBusinessType?.business_type === 'individual' ? '個人事業主' : '法人'})
              </h2>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">事業形態の切り替え</label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {['individual', 'corporation'].map((type) => {
                      const targetType = businessTypes.find(bt => bt.business_type === type);
                      const isActive = currentBusinessType?.business_type === type;
                      return (
                        <button
                          key={type}
                          onClick={() => targetType && switchBusinessType(targetType.id)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg font-medium transition-all ${isActive
                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                            : 'border-border text-text-muted hover:border-primary/30 hover:text-text-main'
                            }`}
                        >
                          {type === 'individual' ? <User size={18} /> : <Building2 size={18} />}
                          {type === 'individual' ? '個人事業主' : '法人'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">適格請求書発行事業者の登録状態</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center p-4 border border-primary bg-primary/5 rounded-lg cursor-pointer">
                      <input type="radio" name="invoice_status" className="w-4 h-4 text-primary" defaultChecked />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-text-main">登録済み</span>
                        <span className="block text-xs text-text-muted">適格請求書発行事業者として登録しています</span>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-highlight">
                      <input type="radio" name="invoice_status" className="w-4 h-4 text-primary" />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-text-main">未登録 / 免税事業者</span>
                        <span className="block text-xs text-text-muted">現在は登録していません</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">登録番号</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">T</span>
                    <input
                      type="text"
                      placeholder="13桁の数字を入力"
                      value={taxNumber.replace(/^T/, '')}
                      onChange={(e) => setTaxNumber('T' + e.target.value.replace(/\D/g, '').slice(0, 13))}
                      className="w-full bg-surface-highlight border border-border rounded-lg pl-8 pr-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <p className="mt-2 text-xs text-text-muted">Tから始まる13桁の登録番号を入力してください。</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <label className="block text-sm font-medium text-text-main mb-2">デフォルトの消費税設定</label>
                  <select className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                    <option value="10">標準税率 (10%)</option>
                    <option value="8">軽減税率 (8%)</option>
                    <option value="0">非課税 / 免税</option>
                  </select>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {currentBusinessType?.business_type === 'individual' ? '個人事業主' : '法人'}のインボイス設定を保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* アカウント設定タブ (退会処理など) */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-semibold mb-6 text-text-main border-b border-border pb-4">
                アカウント設定
              </h2>
              
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-md font-medium text-text-main mb-2">ログイン情報</h3>
                  <div className="bg-surface-highlight border border-border rounded-lg p-4">
                    <p className="text-sm text-text-muted mb-1">メールアドレス</p>
                    <p className="font-medium text-text-main">{user?.email || '未設定'}</p>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-border">
                  <h3 className="text-md font-medium text-red-500 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    危険な操作 (アカウントの削除)
                  </h3>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
                    <p className="text-sm text-text-main mb-4 leading-relaxed">
                      アカウントを削除すると、以下のデータが<strong>完全に削除され、復元することはできません。</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-text-muted space-y-2 mb-6 ml-2">
                      <li>すべての事業所の仕訳・取引データ</li>
                      <li>作成された請求書・決算書・各種設定</li>
                      <li>アップロードされた画像や書類ファイル</li>
                      <li>外部サービスとの連携情報</li>
                    </ul>
                    
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                      >
                        退会手続きへ進む
                      </button>
                    ) : (
                      <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                        <p className="font-medium text-red-500">本当にアカウントを削除して退会しますか？この操作は取り消せません。</p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={isDeletingAccount}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            {isDeletingAccount ? <Loader2 size={18} className="animate-spin" /> : null}
                            {isDeletingAccount ? '削除中...' : '完全に削除する'}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeletingAccount}
                            className="bg-surface hover:bg-surface-highlight border border-border text-text-main px-6 py-2.5 rounded-lg font-medium transition-colors"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* モーダル類 */}
        {user && currentBusinessType && (
          <>
            <PreviousYearImportModal
              isOpen={isPLModalOpen}
              onClose={() => setIsPLModalOpen(false)}
              userId={user.id}
              businessType={currentBusinessType.business_type}
              onImportSuccess={() => {
                toast.success('P&Lのインポートが完了しました');
                fetchFinancialData();
              }}
            />
            <BalanceSheetImportModal
              isOpen={isBSModalOpen}
              onClose={() => setIsBSModalOpen(false)}
              userId={user.id}
              businessType={currentBusinessType.business_type}
              onImportSuccess={() => {
                toast.success('B/Sのインポートが完了しました');
                fetchFinancialData();
              }}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default IntegrationSettings
