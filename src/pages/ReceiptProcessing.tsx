
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {ArrowLeft, Upload, Camera, FileImage, Check, X, Edit3, Save} from 'lucide-react'
import Header from '../components/Header'

interface ReceiptData {
  id: string
  date: string
  merchant: string
  amount: number
  category: string
  description: string
  confidence: number
  status: 'pending' | 'approved' | 'rejected'
}

const ReceiptProcessing: React.FC = () => {
  const [uploadedReceipts, setUploadedReceipts] = useState<ReceiptData[]>([
    {
      id: '1',
      date: '2024-01-15',
      merchant: 'セブンイレブン',
      amount: 1200,
      category: '消耗品費',
      description: '事務用品購入',
      confidence: 95,
      status: 'pending'
    },
    {
      id: '2',
      date: '2024-01-14',
      merchant: 'スターバックス',
      amount: 580,
      category: '接待交際費',
      description: 'クライアント打ち合わせ',
      confidence: 88,
      status: 'approved'
    }
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<ReceiptData>>({})

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // シミュレーション: 新しいレシートを追加
      const newReceipt: ReceiptData = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        merchant: 'AI解析中...',
        amount: 0,
        category: '未分類',
        description: '解析中...',
        confidence: 0,
        status: 'pending'
      }
      setUploadedReceipts(prev => [newReceipt, ...prev])
      
      // 3秒後にAI解析結果をシミュレート
      setTimeout(() => {
        setUploadedReceipts(prev => prev.map(receipt => 
          receipt.id === newReceipt.id 
            ? {
                ...receipt,
                merchant: 'ファミリーマート',
                amount: 850,
                category: '消耗品費',
                description: 'コピー用紙・文具',
                confidence: 92
              }
            : receipt
        ))
      }, 3000)
    }
  }

  const handleEdit = (receipt: ReceiptData) => {
    setEditingId(receipt.id)
    setEditData(receipt)
  }

  const handleSave = () => {
    if (editingId && editData) {
      setUploadedReceipts(prev => prev.map(receipt => 
        receipt.id === editingId ? { ...receipt, ...editData } : receipt
      ))
      setEditingId(null)
      setEditData({})
    }
  }

  const handleApprove = (id: string) => {
    setUploadedReceipts(prev => prev.map(receipt => 
      receipt.id === id ? { ...receipt, status: 'approved' as const } : receipt
    ))
  }

  const handleReject = (id: string) => {
    setUploadedReceipts(prev => prev.map(receipt => 
      receipt.id === id ? { ...receipt, status: 'rejected' as const } : receipt
    ))
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
            <h1 className="text-2xl font-bold text-gray-900">レシート処理</h1>
            <p className="text-gray-600">画像から自動で仕訳を作成します</p>
          </div>
        </div>

        {/* アップロードエリア */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">レシートをアップロード</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ファイルアップロード */}
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">ファイルを選択</p>
              <p className="text-xs text-gray-500">PNG, JPG, PDF対応</p>
            </label>

            {/* カメラ撮影 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">カメラで撮影</p>
              <p className="text-xs text-gray-500">その場で撮影</p>
            </div>

            {/* ドラッグ&ドロップ */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">ドラッグ&ドロップ</p>
              <p className="text-xs text-gray-500">ここに画像をドロップ</p>
            </div>
          </div>
        </div>

        {/* 処理済みレシート一覧 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">処理済みレシート</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">店舗名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">説明</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信頼度</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploadedReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === receipt.id ? (
                        <input
                          type="date"
                          value={editData.date || receipt.date}
                          onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        receipt.date
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === receipt.id ? (
                        <input
                          type="text"
                          value={editData.merchant || receipt.merchant}
                          onChange={(e) => setEditData(prev => ({ ...prev, merchant: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        receipt.merchant
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === receipt.id ? (
                        <input
                          type="number"
                          value={editData.amount || receipt.amount}
                          onChange={(e) => setEditData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        `¥${receipt.amount.toLocaleString()}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === receipt.id ? (
                        <select
                          value={editData.category || receipt.category}
                          onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="消耗品費">消耗品費</option>
                          <option value="接待交際費">接待交際費</option>
                          <option value="旅費交通費">旅費交通費</option>
                          <option value="通信費">通信費</option>
                          <option value="水道光熱費">水道光熱費</option>
                        </select>
                      ) : (
                        receipt.category
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {editingId === receipt.id ? (
                        <input
                          type="text"
                          value={editData.description || receipt.description}
                          onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        receipt.description
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              receipt.confidence >= 90 ? 'bg-green-500' :
                              receipt.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${receipt.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{receipt.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        receipt.status === 'approved' ? 'bg-green-100 text-green-800' :
                        receipt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {receipt.status === 'approved' ? '承認済み' :
                         receipt.status === 'rejected' ? '却下' : '保留中'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {editingId === receipt.id ? (
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(receipt)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {receipt.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(receipt.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(receipt.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReceiptProcessing
