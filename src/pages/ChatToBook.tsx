
import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {ArrowLeft, Send, Mic, MicOff, FileText, Calculator, TrendingUp, Plus, Check, X} from 'lucide-react'
import Header from '../components/Header'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  transactions?: Transaction[]
  suggestions?: string[]
}

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
  status: 'pending' | 'approved' | 'rejected'
}

const ChatToBook: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'こんにちは！会計処理のお手伝いをします。取引内容を自然な言葉で教えてください。例：「今日コンビニで文房具を1200円で買いました」',
      timestamp: new Date(),
      suggestions: [
        '売上を記録したい',
        '経費を入力したい',
        '残高を確認したい',
        '月次レポートを見たい'
      ]
    }
  ])
  
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'セブンイレブン - 事務用品',
      amount: 1200,
      category: '消耗品費',
      type: 'expense',
      status: 'approved'
    },
    {
      id: '2',
      date: '2024-01-15',
      description: 'ウェブサイト制作費',
      amount: 300000,
      category: '売上',
      type: 'income',
      status: 'approved'
    },
    {
      id: '3',
      date: '2024-01-14',
      description: 'スターバックス - 打ち合わせ',
      amount: 580,
      category: '接待交際費',
      type: 'expense',
      status: 'approved'
    }
  ]

  const quickActions = [
    { icon: FileText, label: '売上記録', action: () => handleQuickInput('売上を記録したい') },
    { icon: Calculator, label: '経費入力', action: () => handleQuickInput('経費を入力したい') },
    { icon: TrendingUp, label: '残高確認', action: () => handleQuickInput('現在の残高を教えて') },
    { icon: Plus, label: '新規取引', action: () => handleQuickInput('新しい取引を追加したい') }
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleQuickInput = (text: string) => {
    setInputText(text)
    inputRef.current?.focus()
  }

  const processUserInput = (input: string): { transactions: Transaction[], response: string } => {
    // シンプルなNLP処理のシミュレーション
    const response = {
      transactions: [] as Transaction[],
      response: ''
    }

    // 売上関連
    if (input.includes('売上') || input.includes('収入') || input.includes('入金')) {
      const amount = extractAmount(input)
      if (amount) {
        response.transactions.push({
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          description: input,
          amount: amount,
          category: '売上',
          type: 'income',
          status: 'pending'
        })
        response.response = `売上 ¥${amount.toLocaleString()} を記録しました。内容を確認して承認してください。`
      } else {
        response.response = '売上金額を教えてください。例：「50万円の売上がありました」'
      }
    }
    // 経費関連
    else if (input.includes('経費') || input.includes('支出') || input.includes('買いました') || input.includes('購入')) {
      const amount = extractAmount(input)
      if (amount) {
        let category = '雑費'
        if (input.includes('文房具') || input.includes('事務用品')) category = '消耗品費'
        if (input.includes('交通費') || input.includes('電車') || input.includes('バス')) category = '旅費交通費'
        if (input.includes('食事') || input.includes('レストラン') || input.includes('打ち合わせ')) category = '接待交際費'
        if (input.includes('通信') || input.includes('インターネット') || input.includes('電話')) category = '通信費'

        response.transactions.push({
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          description: input,
          amount: amount,
          category: category,
          type: 'expense',
          status: 'pending'
        })
        response.response = `経費 ¥${amount.toLocaleString()} (${category}) を記録しました。内容を確認して承認してください。`
      } else {
        response.response = '経費金額を教えてください。例：「コンビニで1200円使いました」'
      }
    }
    // 残高確認
    else if (input.includes('残高') || input.includes('現在の') || input.includes('いくら')) {
      response.response = '現在の残高は ¥2,450,000 です。今月の売上は ¥3,200,000、支出は ¥750,000 となっています。'
    }
    // レポート
    else if (input.includes('レポート') || input.includes('月次') || input.includes('分析')) {
      response.response = '月次レポートを作成しました。今月の利益は ¥2,450,000 で、前月比 +12.5% の成長です。詳細は経営分析ページでご確認ください。'
    }
    else {
      response.response = '申し訳ございませんが、理解できませんでした。以下のような形で教えてください：\n• 「コンビニで1200円使いました」\n• 「50万円の売上がありました」\n• 「現在の残高を教えて」'
    }

    return response
  }

  const extractAmount = (text: string): number | null => {
    // 金額抽出のシンプルなロジック
    const patterns = [
      /(\d+)万円/,
      /(\d+)円/,
      /¥(\d+)/,
      /(\d+)$/
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        let amount = parseInt(match[1])
        if (text.includes('万円')) {
          amount *= 10000
        }
        return amount
      }
    }
    return null
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsProcessing(true)

    // AI処理をシミュレート
    setTimeout(() => {
      const result = processUserInput(inputText)
      
      if (result.transactions.length > 0) {
        setPendingTransactions(prev => [...prev, ...result.transactions])
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: result.response,
        timestamp: new Date(),
        transactions: result.transactions.length > 0 ? result.transactions : undefined
      }

      setMessages(prev => [...prev, aiMessage])
      setIsProcessing(false)
    }, 1500)
  }

  const handleApproveTransaction = (transactionId: string) => {
    setPendingTransactions(prev => 
      prev.map(t => t.id === transactionId ? { ...t, status: 'approved' as const } : t)
    )
  }

  const handleRejectTransaction = (transactionId: string) => {
    setPendingTransactions(prev => 
      prev.map(t => t.id === transactionId ? { ...t, status: 'rejected' as const } : t)
    )
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // 実際の音声認識実装はここに
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CHAT-TO-BOOK</h1>
            <p className="text-gray-600">自然な言葉で会計処理ができます</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* メインチャットエリア */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
              {/* チャットヘッダー */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">AI</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">会計AIアシスタント</h3>
                      <p className="text-sm text-green-600">オンライン</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={action.label}
                      >
                        <action.icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* チャットメッセージ */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickInput(suggestion)}
                              className="block w-full text-left text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      {message.transactions && (
                        <div className="mt-3 space-y-2">
                          {message.transactions.map((transaction) => (
                            <div key={transaction.id} className="bg-white bg-opacity-20 p-2 rounded text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{transaction.description}</span>
                                <span>¥{transaction.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300">{transaction.category}</span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleApproveTransaction(transaction.id)}
                                    className="p-1 bg-green-500 hover:bg-green-600 rounded"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectTransaction(transaction.id)}
                                    className="p-1 bg-red-500 hover:bg-red-600 rounded"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 入力エリア */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleRecording}
                    className={`p-2 rounded-lg transition-colors ${
                      isRecording 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="取引内容を入力してください..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isProcessing}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 保留中の取引 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">保留中の取引</h2>
              <div className="space-y-3">
                {pendingTransactions.filter(t => t.status === 'pending').map((transaction) => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </span>
                      <span className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{transaction.category}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveTransaction(transaction.id)}
                        className="flex-1 bg-green-600 text-white text-xs py-1 px-2 rounded hover:bg-green-700"
                      >
                        承認
                      </button>
                      <button
                        onClick={() => handleRejectTransaction(transaction.id)}
                        className="flex-1 bg-red-600 text-white text-xs py-1 px-2 rounded hover:bg-red-700"
                      >
                        却下
                      </button>
                    </div>
                  </div>
                ))}
                {pendingTransactions.filter(t => t.status === 'pending').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">保留中の取引はありません</p>
                )}
              </div>
            </div>

            {/* 最近の取引 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">最近の取引</h2>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">{transaction.description}</p>
                      <p className="text-xs text-gray-600">{transaction.category}</p>
                    </div>
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ヘルプ */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">使い方のヒント</h2>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• 「コンビニで1200円使いました」</p>
                <p>• 「50万円の売上がありました」</p>
                <p>• 「交通費で500円かかりました」</p>
                <p>• 「現在の残高を教えて」</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChatToBook
