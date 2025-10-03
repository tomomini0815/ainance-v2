
import React, { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import Header from '../components/Header'
import {Search, Filter, Check, X, Brain, Eye, AlertCircle, TrendingUp, SquareCheck as CheckSquare, Square, BarChart3, Zap, Target, Award, Clock, RefreshCw, Download, Settings, ArrowRight, Lightbulb, Activity, Cpu, Database, LineChart, PieChart, Users, Globe, Star, Trophy, Gauge, Rocket, Sparkles} from 'lucide-react'

const AITransactionList: React.FC = () => {
  const { 
    aiTransactions, 
    loading, 
    aiStats,
    verifyAITransaction,
    bulkVerifyAITransactions 
  } = useTransactions()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [confidenceFilter, setConfidenceFilter] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [showLearningDetails, setShowLearningDetails] = useState(true)
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true)
  const [feedbackText, setFeedbackText] = useState('')

  // フィルタリングされたAI取引
  const filteredAITransactions = useMemo(() => {
    return aiTransactions.filter(transaction => {
      const matchesSearch = transaction.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.original_text?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryFilter || transaction.ai_category === categoryFilter
      
      let matchesConfidence = true
      if (confidenceFilter) {
        const confidence = transaction.confidence
        switch (confidenceFilter) {
          case 'high':
            matchesConfidence = confidence >= 90
            break
          case 'medium':
            matchesConfidence = confidence >= 70 && confidence < 90
            break
          case 'low':
            matchesConfidence = confidence < 70
            break
        }
      }
      
      let matchesVerification = true
      if (verificationFilter) {
        switch (verificationFilter) {
          case 'verified':
            matchesVerification = transaction.manual_verified === true
            break
          case 'unverified':
            matchesVerification = transaction.manual_verified === false
            break
        }
      }
      
      return matchesSearch && matchesCategory && matchesConfidence && matchesVerification
    })
  }, [aiTransactions, searchTerm, categoryFilter, confidenceFilter, verificationFilter])

  // 高度な統計情報
  const advancedStats = useMemo(() => {
    const totalTransactions = filteredAITransactions.length
    const verifiedCount = filteredAITransactions.filter(t => t.manual_verified).length
    const averageConfidence = totalTransactions > 0 
      ? filteredAITransactions.reduce((sum, t) => sum + t.confidence, 0) / totalTransactions 
      : 0
    
    // 信頼度レベル別統計
    const highConfidenceCount = filteredAITransactions.filter(t => t.confidence >= 90).length
    const mediumConfidenceCount = filteredAITransactions.filter(t => t.confidence >= 70 && t.confidence < 90).length
    const lowConfidenceCount = filteredAITransactions.filter(t => t.confidence < 70).length
    
    // カテゴリ別精度
    const categoryAccuracy = filteredAITransactions.reduce((acc, t) => {
      if (!acc[t.ai_category]) {
        acc[t.ai_category] = { total: 0, verified: 0, totalConfidence: 0 }
      }
      acc[t.ai_category].total++
      acc[t.ai_category].totalConfidence += t.confidence
      if (t.manual_verified) {
        acc[t.ai_category].verified++
      }
      return acc
    }, {} as Record<string, { total: number; verified: number; totalConfidence: number }>)
    
    // 学習進捗計算
    const learningProgress = Math.min(100, (verifiedCount / Math.max(totalTransactions, 1)) * 100)
    const aiMaturity = averageConfidence * (learningProgress / 100)
    
    // 処理速度統計
    const averageProcessingTime = totalTransactions > 0 
      ? filteredAITransactions.reduce((sum, t) => sum + (t.processing_time || 0.5), 0) / totalTransactions 
      : 0

    // 時系列での改善率
    const recentTransactions = filteredAITransactions.filter(t => 
      new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    const recentAverageConfidence = recentTransactions.length > 0
      ? recentTransactions.reduce((sum, t) => sum + t.confidence, 0) / recentTransactions.length
      : 0
    const weeklyImprovement = recentAverageConfidence - averageConfidence

    return {
      totalTransactions,
      verifiedCount,
      verificationRate: totalTransactions > 0 ? (verifiedCount / totalTransactions) * 100 : 0,
      averageConfidence,
      highConfidenceCount,
      mediumConfidenceCount,
      lowConfidenceCount,
      highConfidenceRate: totalTransactions > 0 ? (highConfidenceCount / totalTransactions) * 100 : 0,
      categoryAccuracy,
      learningProgress,
      aiMaturity,
      averageProcessingTime,
      weeklyImprovement,
      recentTransactions: recentTransactions.length
    }
  }, [filteredAITransactions])

  // 信頼度に基づく色の取得
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // 信頼度に基づくバッジスタイル
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 95) return { color: 'bg-emerald-500', label: '最高精度' }
    if (confidence >= 90) return { color: 'bg-green-500', label: '高精度' }
    if (confidence >= 80) return { color: 'bg-blue-500', label: '良好' }
    if (confidence >= 70) return { color: 'bg-yellow-500', label: '中程度' }
    return { color: 'bg-red-500', label: '要確認' }
  }

  // チェックボックス管理
  const toggleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredAITransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredAITransactions.map(t => t._id))
    }
  }

  // AI分類の確認処理（フィードバック付き）
  const handleVerification = async (transactionId: string, verified: boolean) => {
    await verifyAITransaction(transactionId, verified, feedbackText)
    setFeedbackText('')
  }

  // バルク確認処理
  const handleBulkVerification = async (verified: boolean) => {
    if (selectedTransactions.length === 0) return
    
    const action = verified ? '承認' : '却下'
    if (confirm(`選択した${selectedTransactions.length}件のAI分類を${action}しますか？`)) {
      await bulkVerifyAITransactions(selectedTransactions, verified)
      setSelectedTransactions([])
    }
  }

  // スマート一括承認（高信頼度のみ）
  const handleSmartBulkApproval = () => {
    const highConfidenceTransactions = filteredAITransactions
      .filter(t => t.confidence >= 90 && !t.manual_verified)
      .map(t => t._id)
    
    if (highConfidenceTransactions.length === 0) {
      alert('高信頼度の未確認取引がありません')
      return
    }
    
    if (confirm(`信頼度90%以上の${highConfidenceTransactions.length}件を一括承認しますか？`)) {
      bulkVerifyAITransactions(highConfidenceTransactions, true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 強化されたヘッダー */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI自動仕分けシステム
              <span className="ml-3 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full">
                v2.0 Pro
              </span>
            </h1>
            <p className="text-gray-600">次世代機械学習による高精度な取引分類と継続的な学習改善</p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-sm text-green-600">
                <Activity className="w-4 h-4 mr-1" />
                <span>リアルタイム学習</span>
              </div>
              <div className="flex items-center text-sm text-blue-600">
                <Cpu className="w-4 h-4 mr-1" />
                <span>ニューラルネットワーク</span>
              </div>
              <div className="flex items-center text-sm text-purple-600">
                <Database className="w-4 h-4 mr-1" />
                <span>ビッグデータ分析</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2"
            >
              <Gauge size={18} />
              <span>パフォーマンス</span>
            </button>
            <button
              onClick={() => setShowLearningDetails(!showLearningDetails)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors flex items-center space-x-2"
            >
              <Brain size={18} />
              <span>学習詳細</span>
            </button>
            <button
              onClick={handleSmartBulkApproval}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center space-x-2"
            >
              <Sparkles size={18} />
              <span>スマート承認</span>
            </button>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-lg border border-orange-200">
              <Rocket className="w-5 h-5 text-orange-600" />
              <span className="text-orange-800 font-medium">AI分析システム稼働中</span>
            </div>
          </div>
        </div>

        {/* AI学習システム詳細 */}
        {showLearningDetails && (
          <div className="mb-8 space-y-6">
            {/* メイン統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <p className="text-sm text-gray-600">AI分析総数</p>
                  <p className="text-2xl font-bold text-gray-900">{advancedStats.totalTransactions}</p>
                  <div className="flex items-center mt-1">
                    <Brain className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-600">自動分析</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <p className="text-sm text-gray-600">学習完了率</p>
                  <p className="text-2xl font-bold text-green-600">{advancedStats.verificationRate.toFixed(1)}%</p>
                  <div className="flex items-center mt-1">
                    <Check className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">{advancedStats.verifiedCount}件確認済み</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <p className="text-sm text-gray-600">平均信頼度</p>
                  <p className="text-2xl font-bold text-purple-600">{advancedStats.averageConfidence.toFixed(1)}%</p>
                  <div className="flex items-center mt-1">
                    <Target className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-xs text-purple-600">AI精度</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <p className="text-sm text-gray-600">AI成熟度</p>
                  <p className="text-2xl font-bold text-orange-600">{advancedStats.aiMaturity.toFixed(1)}%</p>
                  <div className="flex items-center mt-1">
                    <Award className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-xs text-orange-600">総合スコア</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <p className="text-sm text-gray-600">週間改善</p>
                  <p className={`text-2xl font-bold ${advancedStats.weeklyImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {advancedStats.weeklyImprovement >= 0 ? '+' : ''}{advancedStats.weeklyImprovement.toFixed(1)}%
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-indigo-500 mr-1" />
                    <span className="text-xs text-indigo-600">学習速度</span>
                  </div>
                </div>
              </div>
            </div>

            {/* パフォーマンス指標 */}
            {showPerformanceMetrics && aiStats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Cpu className="w-5 h-5 mr-2 text-blue-600" />
                    処理パフォーマンス
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">平均処理時間</span>
                      <span className="text-lg font-bold text-blue-600">{aiStats.processingSpeed.toFixed(2)}秒</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">処理済み件数</span>
                      <span className="text-lg font-bold text-blue-600">{aiStats.totalProcessed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">精度向上率</span>
                      <span className="text-lg font-bold text-green-600">+{aiStats.improvementRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    信頼度分析
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">高信頼度 (90%+)</span>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-green-600">{aiStats.confidenceDistribution.high}</span>
                        <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(aiStats.confidenceDistribution.high / aiStats.totalProcessed) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">中信頼度 (70-89%)</span>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-yellow-600">{aiStats.confidenceDistribution.medium}</span>
                        <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(aiStats.confidenceDistribution.medium / aiStats.totalProcessed) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">低信頼度 (70%未満)</span>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-red-600">{aiStats.confidenceDistribution.low}</span>
                        <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(aiStats.confidenceDistribution.low / aiStats.totalProcessed) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-green-600" />
                    学習成果
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">全体精度</span>
                      <span className="text-lg font-bold text-green-600">{aiStats.accuracyRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">学習進捗</span>
                      <span className="text-lg font-bold text-blue-600">{aiStats.learningProgress.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">今週の分析</span>
                      <span className="text-lg font-bold text-purple-600">{advancedStats.recentTransactions}件</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* カテゴリ別精度分析 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                カテゴリ別AI精度分析
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(advancedStats.categoryAccuracy).map(([category, data]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{category}</h4>
                      <span className="text-lg font-bold text-blue-600">
                        {(data.totalConfidence / data.total).toFixed(1)}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">処理件数:</span>
                        <span className="font-medium">{data.total}件</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">確認済み:</span>
                        <span className="font-medium text-green-600">{data.verified}件</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${(data.totalConfidence / data.total)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 検索・フィルター */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="項目・場所・元テキストで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">すべてのカテゴリ</option>
                <option value="交通費">交通費</option>
                <option value="食費">食費</option>
                <option value="消耗品費">消耗品費</option>
                <option value="通信費">通信費</option>
                <option value="光熱費">光熱費</option>
                <option value="その他">その他</option>
              </select>

              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">すべての信頼度</option>
                <option value="high">高信頼度 (90%以上)</option>
                <option value="medium">中信頼度 (70-89%)</option>
                <option value="low">低信頼度 (70%未満)</option>
              </select>

              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">すべての状態</option>
                <option value="verified">確認済み</option>
                <option value="unverified">未確認</option>
              </select>
            </div>

            {/* バルク操作 */}
            {selectedTransactions.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                <span className="text-sm text-gray-600">
                  {selectedTransactions.length}件選択中
                </span>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleBulkVerification(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <Check size={16} />
                    <span>一括承認</span>
                  </button>
                  <button
                    onClick={() => handleBulkVerification(false)}
                    className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors flex items-center space-x-2"
                  >
                    <X size={16} />
                    <span>一括却下</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI取引一覧 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-900"
                    >
                      {selectedTransactions.length === filteredAITransactions.length && filteredAITransactions.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      <span>選択</span>
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">取引項目</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">金額</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">AI分類</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">信頼度</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">詳細情報</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">確認状態</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAITransactions.map((transaction) => {
                  const confidenceBadge = getConfidenceBadge(transaction.confidence)
                  return (
                    <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleSelectTransaction(transaction._id)}
                          className="flex items-center"
                        >
                          {selectedTransactions.includes(transaction._id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {transaction.item}
                            <div className={`ml-2 w-2 h-2 rounded-full ${confidenceBadge.color}`}></div>
                          </div>
                          {transaction.original_text && (
                            <div className="text-sm text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">
                              元: {transaction.original_text}
                            </div>
                          )}
                          {transaction.ai_suggestions && transaction.ai_suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {transaction.ai_suggestions.slice(0, 2).map((suggestion, idx) => (
                                <span key={idx} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                                  {suggestion}
                                </span>
                              ))}
                            </div>
                          )}
                          {transaction.receipt_url && (
                            <div className="flex items-center mt-1">
                              <Eye className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">レシート添付</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-gray-900 text-lg">
                          ¥{transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
                          {transaction.ai_category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getConfidenceColor(transaction.confidence)}`}>
                              {transaction.confidence}%
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full text-white ${confidenceBadge.color}`}>
                              {confidenceBadge.label}
                            </span>
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                transaction.confidence >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                transaction.confidence >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                                'bg-gradient-to-r from-red-400 to-red-600'
                              }`}
                              style={{ width: `${transaction.confidence}%` }}
                            ></div>
                          </div>
                          {transaction.processing_time && (
                            <div className="text-xs text-gray-500">
                              {transaction.processing_time.toFixed(2)}秒
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {transaction.location && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Globe className="w-3 h-3 mr-1" />
                              {transaction.location}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {transaction.manual_verified ? (
                          <div className="flex flex-col items-center space-y-1">
                            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                              <Check size={12} className="mr-1" />
                              確認済み
                            </span>
                            {transaction.learning_feedback && (
                              <div className="text-xs text-gray-500 max-w-20 truncate" title={transaction.learning_feedback}>
                                フィードバック有り
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800">
                            <Clock size={12} className="mr-1" />
                            未確認
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {!transaction.manual_verified && (
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleVerification(transaction._id, true)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
                              title="承認"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleVerification(transaction._id, false)}
                              className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-colors"
                              title="却下"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredAITransactions.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI分析データが見つかりません</h3>
              <p className="text-gray-500">検索条件を変更するか、新しいデータの分析をお待ちください。</p>
            </div>
          )}
        </div>

        {/* AI学習進捗とインサイト */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-8 rounded-xl border border-blue-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                AI学習システム
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">確認済み取引:</span>
                  <span className="font-semibold text-gray-900">{advancedStats.verifiedCount}件</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">平均精度:</span>
                  <span className="font-semibold text-purple-600">{advancedStats.averageConfidence.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">高精度分析:</span>
                  <span className="font-semibold text-green-600">{advancedStats.highConfidenceCount}件</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">処理速度:</span>
                  <span className="font-semibold text-blue-600">{advancedStats.averageProcessingTime.toFixed(2)}秒</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                学習進捗
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">全体進捗</span>
                    <span className="font-semibold text-blue-600">{advancedStats.learningProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-4 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 relative overflow-hidden"
                      style={{ width: `${advancedStats.learningProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">AI成熟度</span>
                    <span className="font-semibold text-orange-600">{advancedStats.aiMaturity.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-4 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full transition-all duration-1000 relative overflow-hidden"
                      style={{ width: `${advancedStats.aiMaturity}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                今週のハイライト
              </h3>
              <div className="space-y-4">
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">新規分析</span>
                    <span className="font-bold text-blue-600">{advancedStats.recentTransactions}件</span>
                  </div>
                  <div className="text-xs text-gray-500">過去7日間</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">精度向上</span>
                    <span className={`font-bold ${advancedStats.weeklyImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {advancedStats.weeklyImprovement >= 0 ? '+' : ''}{advancedStats.weeklyImprovement.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">前週比較</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フィードバック入力エリア */}
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            AI学習フィードバック
          </h3>
          <div className="flex space-x-4">
            <input
              type="text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="AIの分類についてフィードバックを入力してください..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setFeedbackText('')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              クリア
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            フィードバックはAIの学習に活用され、将来の分類精度向上に貢献します。
          </p>
        </div>
      </main>
    </div>
  )
}

export default AITransactionList
