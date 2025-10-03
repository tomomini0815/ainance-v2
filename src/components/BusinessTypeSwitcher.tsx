
import React, { useState } from 'react'
import { useBusinessType } from '../hooks/useBusinessType'
import {ChevronDown, Building, User, Settings, Plus, Edit, Trash2} from 'lucide-react'

interface BusinessTypeSwitcherProps {
  userId?: string
  onBusinessTypeChange?: (businessType: any) => void
}

const BusinessTypeSwitcher: React.FC<BusinessTypeSwitcherProps> = ({ 
  userId,
  onBusinessTypeChange 
}) => {
  const { 
    currentBusinessType, 
    businessTypes, 
    loading, 
    createBusinessType,
    switchBusinessType,
    updateBusinessType,
    deleteBusinessType 
  } = useBusinessType(userId)
  
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBusinessType, setEditingBusinessType] = useState<any>(null)

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const businessTypeData = {
      business_type: formData.get('business_type') as 'individual' | 'corporation',
      company_name: formData.get('company_name') as string,
      tax_number: formData.get('tax_number') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      representative_name: formData.get('representative_name') as string
    }

    const result = await createBusinessType(businessTypeData)
    if (result) {
      setShowCreateModal(false)
      onBusinessTypeChange?.(result)
    }
  }

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingBusinessType) return

    const formData = new FormData(event.currentTarget)
    
    const updates = {
      company_name: formData.get('company_name') as string,
      tax_number: formData.get('tax_number') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      representative_name: formData.get('representative_name') as string
    }

    const result = await updateBusinessType(editingBusinessType._id, updates)
    if (result) {
      setShowEditModal(false)
      setEditingBusinessType(null)
      onBusinessTypeChange?.(result)
    }
  }

  const handleSwitch = async (businessTypeId: string) => {
    await switchBusinessType(businessTypeId)
    setShowDropdown(false)
    
    const selectedBusinessType = businessTypes.find(bt => bt._id === businessTypeId)
    onBusinessTypeChange?.(selectedBusinessType)
  }

  const handleEdit = (businessType: any) => {
    setEditingBusinessType(businessType)
    setShowEditModal(true)
    setShowDropdown(false)
  }

  const handleDelete = async (businessTypeId: string) => {
    if (confirm('この業態形態を削除してもよろしいですか？')) {
      await deleteBusinessType(businessTypeId)
      setShowDropdown(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm text-gray-700">読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* 現在の業態形態表示 */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
      >
        {currentBusinessType ? (
          <>
            {currentBusinessType.business_type === 'individual' ? (
              <User className="w-4 h-4 text-blue-600" />
            ) : (
              <Building className="w-4 h-4 text-green-600" />
            )}
            <span className="text-sm text-gray-700">
              {currentBusinessType.business_type === 'individual' ? '個人事業主' : '法人'}
            </span>
            <span className="text-sm text-gray-500">
              - {currentBusinessType.company_name}
            </span>
          </>
        ) : (
          <>
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">業態形態を選択</span>
          </>
        )}
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* ドロップダウンメニュー */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-900">業態形態</h3>
              <button
                onClick={() => {
                  setShowCreateModal(true)
                  setShowDropdown(false)
                }}
                className="flex items-center text-xs text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                新規作成
              </button>
            </div>
            
            <div className="space-y-1">
              {businessTypes.map((businessType) => (
                <div
                  key={businessType._id}
                  className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 ${
                    currentBusinessType?._id === businessType._id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <button
                    onClick={() => handleSwitch(businessType._id)}
                    className="flex items-center space-x-2 flex-1 text-left"
                  >
                    {businessType.business_type === 'individual' ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Building className="w-4 h-4 text-green-600" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {businessType.business_type === 'individual' ? '個人事業主' : '法人'}
                      </div>
                      <div className="text-xs text-gray-500">{businessType.company_name}</div>
                    </div>
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(businessType)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="編集"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    {businessTypes.length > 1 && (
                      <button
                        onClick={() => handleDelete(businessType._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="削除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {businessTypes.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                業態形態が設定されていません
              </div>
            )}
          </div>
        </div>
      )}

      {/* 新規作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">新しい業態形態を作成</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">業態形態</label>
                <select
                  name="business_type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="individual">個人事業主</option>
                  <option value="corporation">法人</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会社名・屋号</label>
                <input
                  type="text"
                  name="company_name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="株式会社サンプル"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">法人番号・事業者登録番号</label>
                <input
                  type="text"
                  name="tax_number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="T1234567890123"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                <input
                  type="text"
                  name="address"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="東京都渋谷区1-1-1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="03-1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="info@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">代表者名</label>
                <input
                  type="text"
                  name="representative_name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="田中太郎"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {showEditModal && editingBusinessType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">業態形態を編集</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">業態形態</label>
                <div className="px-3 py-2 bg-gray-100 rounded-md text-sm">
                  {editingBusinessType.business_type === 'individual' ? '個人事業主' : '法人'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会社名・屋号</label>
                <input
                  type="text"
                  name="company_name"
                  defaultValue={editingBusinessType.company_name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">法人番号・事業者登録番号</label>
                <input
                  type="text"
                  name="tax_number"
                  defaultValue={editingBusinessType.tax_number}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={editingBusinessType.address}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingBusinessType.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingBusinessType.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">代表者名</label>
                <input
                  type="text"
                  name="representative_name"
                  defaultValue={editingBusinessType.representative_name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingBusinessType(null)
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessTypeSwitcher
