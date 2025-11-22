import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ChevronDown, ChevronUp, Building, User, Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface BusinessTypeSwitcherProps {
  userId?: string
  onBusinessTypeChange?: (businessType: any) => void
  displayMode?: 'dropdown' | 'inline'
}

const BusinessTypeSwitcher: React.FC<BusinessTypeSwitcherProps> = ({
  userId: propUserId,
  onBusinessTypeChange,
  displayMode = 'dropdown'
}) => {
  const { user } = useAuth();
  const userId = propUserId || user?.id;

  console.log('BusinessTypeSwitcher rendered with userId:', userId);

  const [showDropdown, setShowDropdown] = useState(false)
  const {
    businessTypes,
    loading,
    currentBusinessType,
    createBusinessType,
    switchBusinessType,
    updateBusinessType,
    deleteBusinessType,
    refreshBusinessTypes
  } = useBusinessTypeContext()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBusinessType, setEditingBusinessType] = useState<any>(null)
  const [selectedBusinessType, setSelectedBusinessType] = useState<'individual' | 'corporation'>('individual')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ローカルストレージから現在の業態形態を取得（バックアップ用）
  const [localBusinessType, setLocalBusinessType] = useLocalStorage<any>(`businessType_${userId}`, null)

  // currentBusinessTypeが変更されたときにローカルストレージを更新
  useEffect(() => {
    if (currentBusinessType) {
      setLocalBusinessType(currentBusinessType)
      onBusinessTypeChange?.(currentBusinessType)
    }
  }, [currentBusinessType, setLocalBusinessType, onBusinessTypeChange])

  // 初期ロード時にローカルストレージの値があればそれを使用
  useEffect(() => {
    if (!currentBusinessType && localBusinessType) {
      onBusinessTypeChange?.(localBusinessType)
    }
  }, [localBusinessType, onBusinessTypeChange, currentBusinessType])

  // userIdが変更されたときにデータを再取得
  useEffect(() => {
    if (userId) {
      refreshBusinessTypes()
    }
  }, [userId, refreshBusinessTypes])

  // businessTypesが空の場合、自動的に新規作成モーダルを表示
  useEffect(() => {
    if (businessTypes.length === 0 && userId && !loading) {
      // 少し遅延させて自動表示（UIが正しくレンダリングされるのを待つため）
      const timer = setTimeout(() => {
        setShowCreateModal(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [businessTypes.length, userId, loading])

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('handleCreateSubmit started')

    if (isSubmitting) return
    setIsSubmitting(true)

    // タイムアウト処理を追加
    const timeoutId = setTimeout(() => {
      console.log('タイムアウト発生');
      setIsSubmitting(false);
      alert('処理がタイムアウトしました。もう一度お試しください。');
    }, 10000); // 10秒でタイムアウト

    if (!userId) {
      alert('ログインしてください (User ID missing)')
      console.error('User ID is missing in handleCreateSubmit')
      setIsSubmitting(false)
      clearTimeout(timeoutId);
      return
    }

    try {
      const formData = new FormData(event.currentTarget)

      // Manual validation
      const companyName = formData.get('company_name') as string
      const address = formData.get('address') as string
      const representativeName = formData.get('representative_name') as string
      const businessType = formData.get('business_type') as 'individual' | 'corporation'

      console.log('Form data:', {
        companyName,
        address,
        representativeName,
        businessType
      });

      if (!companyName) {
        alert('会社名/屋号を入力してください')
        setIsSubmitting(false)
        clearTimeout(timeoutId);
        return
      }

      if (!address) {
        alert('住所を入力してください')
        setIsSubmitting(false)
        clearTimeout(timeoutId);
        return
      }

      if (!representativeName) {
        alert('代表者名を入力してください')
        setIsSubmitting(false)
        clearTimeout(timeoutId);
        return
      }

      if (!businessType) {
        alert('業態形態を選択してください')
        setIsSubmitting(false)
        clearTimeout(timeoutId);
        return
      }

      const businessTypeData = {
        business_type: businessType,
        company_name: companyName,
        tax_number: formData.get('tax_number') as string || '',
        address: address,
        phone: formData.get('phone') as string || '',
        email: formData.get('email') as string || '',
        representative_name: representativeName
      }

      console.log('Creating business type with data:', businessTypeData)

      const result = await createBusinessType(businessTypeData)
      clearTimeout(timeoutId); // 正常に完了した場合はタイムアウトをクリア
      console.log('createBusinessType result:', result)

      if (result) {
        setLocalBusinessType(result)
        setShowCreateModal(false)
        onBusinessTypeChange?.(result)
        refreshBusinessTypes() // Refresh context
        console.log('Business type created and set successfully')
      } else {
        console.error('createBusinessType returned null')
        // より詳細なエラーメッセージを表示
        alert('業態形態の作成に失敗しました。入力内容を確認して、もう一度お試しください。')
      }
    } catch (error: any) {
      clearTimeout(timeoutId); // エラー発生時はタイムアウトをクリア
      console.error('Error in handleCreateSubmit:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // より詳細なエラーメッセージを表示
      let errorMessage = '不明なエラー';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      }
      
      alert(`エラーが発生しました: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
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

    const result = await updateBusinessType(editingBusinessType.id, updates)
    if (result) {
      // 編集した業態が現在の業態の場合、ローカルストレージも更新
      if (localBusinessType && localBusinessType.id === editingBusinessType.id) {
        setLocalBusinessType(result)
        onBusinessTypeChange?.(result)
      }
      setShowEditModal(false)
      setEditingBusinessType(null)
      refreshBusinessTypes() // Refresh context
    }
  }

  const handleSwitch = async (businessTypeId: string) => {
    await switchBusinessType(businessTypeId)
    setShowDropdown(false)

    // switchBusinessType後に最新の情報を取得
    const selectedBusinessType = businessTypes.find(bt => bt.id === businessTypeId)
    if (selectedBusinessType) {
      setLocalBusinessType(selectedBusinessType)
      onBusinessTypeChange?.(selectedBusinessType)
    }
  }

  const handleEdit = (businessType: any) => {
    setEditingBusinessType(businessType)
    setSelectedBusinessType(businessType.business_type)
    setShowEditModal(true)
    setShowDropdown(false)
  }

  const handleDelete = async (businessTypeId: string) => {
    // 最後の業態形態を削除する場合の確認
    if (businessTypes.length <= 1) {
      if (!confirm('これは最後の業態形態です。削除すると新しい業態形態を作成するまでアプリが正しく動作しない可能性があります。本当に削除してもよろしいですか？')) {
        return;
      }
    } else {
      if (!confirm('この業態形態を削除してもよろしいですか？')) {
        return;
      }
    }

    await deleteBusinessType(businessTypeId)
    // 削除した業態が現在の業態の場合、ローカルストレージをクリア
    if (localBusinessType && localBusinessType.id === businessTypeId) {
      setLocalBusinessType(null)
      onBusinessTypeChange?.(null)
      // 新しいアクティブな業態を取得
      refreshBusinessTypes()
    }
    setShowDropdown(false)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm text-text-muted">読み込み中...</span>
      </div>
    )
  }

  const renderList = () => (
    <div className="p-3">
      {/* 選択中の業態形態をプルダウンの上部に表示 */}
      {currentBusinessType && (
        <div className="mb-3 p-3 bg-surface-highlight rounded-lg flex items-center border border-border">
          {currentBusinessType.business_type === 'individual' ? (
            <User className="w-4 h-4 text-primary mr-2" />
          ) : (
            <Building className="w-4 h-4 text-success mr-2" />
          )}
          <div>
            <div className="text-sm font-medium text-text-main">
              {currentBusinessType.business_type === 'individual' ? '個人事業主' : '法人'}
            </div>
            <div className="text-xs text-text-muted">{currentBusinessType.company_name}</div>
          </div>
          <Check className="w-4 h-4 text-primary ml-auto" />
        </div>
      )}

      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">業態形態</h3>
        <button
          onClick={() => {
            setShowCreateModal(true)
            setShowDropdown(false)
          }}
          className="flex items-center text-xs text-primary hover:text-primary-hover font-medium transition-colors"
        >
          <Plus className="w-3 h-3 mr-1" />
          新規作成
        </button>
      </div>

      <div className="space-y-1">
        {businessTypes.map((businessType) => (
          <div
            key={businessType.id}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${currentBusinessType?.id === businessType.id ? 'bg-surface-highlight' : 'hover:bg-surface-highlight'
              }`}
          >
            <button
              onClick={() => handleSwitch(businessType.id)}
              className="flex items-center space-x-3 flex-1 text-left"
            >
              {businessType.business_type === 'individual' ? (
                <User className="w-4 h-4 text-primary" />
              ) : (
                <Building className="w-4 h-4 text-success" />
              )}
              <div>
                <div className="text-sm font-medium text-text-main">
                  {businessType.business_type === 'individual' ? '個人事業主' : '法人'}
                </div>
                <div className="text-xs text-text-muted">{businessType.company_name}</div>
              </div>
            </button>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleEdit(businessType)}
                className="p-1.5 text-text-muted hover:text-text-main hover:bg-black/5 rounded-md transition-colors"
                title="編集"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete(businessType.id)}
                className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-md transition-colors"
                title="削除"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {businessTypes.length === 0 && (
        <div className="text-center py-6">
          <p className="text-text-muted text-sm mb-3">業態形態が設定されていません</p>
          <button
            onClick={() => {
              setShowCreateModal(true)
              setShowDropdown(false)
            }}
            className="btn-primary text-xs"
          >
            新規作成
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className={`relative ${displayMode === 'inline' ? 'w-full' : ''}`}>
      {/* 現在の業態形態表示 */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center justify-between space-x-2 bg-surface border border-border px-3 py-2 rounded-lg hover:bg-surface-highlight transition-colors shadow-sm ${displayMode === 'inline' ? 'w-full' : ''}`}
      >
        <div className="flex items-center space-x-2 truncate">
          {currentBusinessType ? (
            <>
              {currentBusinessType.business_type === 'individual' ? (
                <User className="w-4 h-4 text-primary flex-shrink-0" />
              ) : (
                <Building className="w-4 h-4 text-success flex-shrink-0" />
              )}
              <span className="text-sm font-medium text-text-main truncate">
                {currentBusinessType.business_type === 'individual' ? '個人事業主' : '法人'}
              </span>
              <span className="text-sm text-text-muted truncate">
                - {currentBusinessType.company_name}
              </span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-text-muted flex-shrink-0" />
              <span className="text-sm text-text-muted">業態形態を選択</span>
            </>
          )}
        </div>
        {showDropdown ? (
          <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
        )}
      </button>

      {/* ドロップダウン/インラインメニュー */}
      {showDropdown && (
        displayMode === 'inline' ? (
          <div className="mt-2 w-full bg-surface border border-border rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            {renderList()}
          </div>
        ) : (
          <div className="absolute top-full left-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
            {renderList()}
          </div>
        )
      )}

      {/* 新規作成モーダル */}
      {showCreateModal && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl w-[95%] max-w-md max-h-[85vh] border border-border animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0 bg-surface">
              <h3 className="text-lg font-bold text-text-main">新しい業態形態を作成</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-text-main p-1 hover:bg-surface-highlight rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">業態形態</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('個人事業主を選択');
                      setSelectedBusinessType('individual');
                    }}
                    className={`flex items-center justify-center px-4 py-2.5 rounded-xl border transition-all ${selectedBusinessType === 'individual'
                      ? 'bg-primary/10 border-primary text-primary font-medium'
                      : 'bg-surface border-border text-text-muted hover:bg-surface-highlight'
                      }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    個人事業主
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('法人を選択');
                      setSelectedBusinessType('corporation');
                    }}
                    className={`flex items-center justify-center px-4 py-2.5 rounded-xl border transition-all ${selectedBusinessType === 'corporation'
                      ? 'bg-success/10 border-success text-success font-medium'
                      : 'bg-surface border-border text-text-muted hover:bg-surface-highlight'
                      }`}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    法人
                  </button>
                </div>
                <input type="hidden" name="business_type" value={selectedBusinessType} />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  {selectedBusinessType === 'individual' ? '屋号' : '会社名'}
                </label>
                <input
                  type="text"
                  name="company_name"
                  className="input-base"
                  placeholder={selectedBusinessType === 'individual' ? '個人商店' : '株式会社サンプル'}
                />
              </div>

              {selectedBusinessType === 'corporation' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">法人番号</label>
                  <input
                    type="text"
                    name="tax_number"
                    className="input-base"
                    placeholder="1234567890123"
                  />
                </div>
              )}

              {selectedBusinessType === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">事業者登録番号</label>
                  <input
                    type="text"
                    name="tax_number"
                    className="input-base"
                    placeholder="T1234567890123"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">住所</label>
                <input
                  type="text"
                  name="address"
                  className="input-base"
                  placeholder="東京都渋谷区1-1-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">電話番号</label>
                  <input
                    type="tel"
                    name="phone"
                    className="input-base"
                    placeholder="03-1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">メールアドレス</label>
                  <input
                    type="email"
                    name="email"
                    className="input-base"
                    placeholder="info@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  {selectedBusinessType === 'individual' ? '事業主名' : '代表者名'}
                </label>
                <input
                  type="text"
                  name="representative_name"
                  className="input-base"
                  placeholder={selectedBusinessType === 'individual' ? '山田太郎' : '田中太郎'}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-tertiary"
                  disabled={isSubmitting}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                  disabled={isSubmitting}
                  onClick={() => console.log('Create button clicked')}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      作成中...
                    </>
                  ) : (
                    '作成'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 編集モーダル */}
      {showEditModal && editingBusinessType && createPortal(
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
          onClick={() => {
            setShowEditModal(false)
            setEditingBusinessType(null)
          }}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl w-[95%] max-w-md max-h-[85vh] border border-border animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0 bg-surface">
              <h3 className="text-lg font-bold text-text-main">業態形態を編集</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingBusinessType(null)
                }}
                className="text-text-muted hover:text-text-main p-1 hover:bg-surface-highlight rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">業態形態</label>
                <div className="px-4 py-2.5 bg-surface-highlight rounded-lg text-sm text-text-main border border-border flex items-center">
                  {editingBusinessType.business_type === 'individual' ? (
                    <User className="w-4 h-4 text-primary mr-2" />
                  ) : (
                    <Building className="w-4 h-4 text-success mr-2" />
                  )}
                  {editingBusinessType.business_type === 'individual' ? '個人事業主' : '法人'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  {editingBusinessType.business_type === 'individual' ? '屋号' : '会社名'}
                </label>
                <input
                  type="text"
                  name="company_name"
                  defaultValue={editingBusinessType.company_name}
                  required
                  className="input-base"
                />
              </div>

              {editingBusinessType.business_type === 'corporation' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">法人番号</label>
                  <input
                    type="text"
                    name="tax_number"
                    defaultValue={editingBusinessType.tax_number}
                    className="input-base"
                  />
                </div>
              )}

              {editingBusinessType.business_type === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">事業者登録番号</label>
                  <input
                    type="text"
                    name="tax_number"
                    defaultValue={editingBusinessType.tax_number}
                    className="input-base"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">住所</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={editingBusinessType.address}
                  required
                  className="input-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">電話番号</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingBusinessType.phone}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">メールアドレス</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingBusinessType.email}
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  {editingBusinessType.business_type === 'individual' ? '事業主名' : '代表者名'}
                </label>
                <input
                  type="text"
                  name="representative_name"
                  defaultValue={editingBusinessType.representative_name}
                  required
                  className="input-base"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingBusinessType(null)
                  }}
                  className="btn-tertiary"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default BusinessTypeSwitcher