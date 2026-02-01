import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useBusinessTypeContext } from '../context/BusinessTypeContext'
import { useAuth } from '../hooks/useAuth'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { User, Building, X } from 'lucide-react'

interface CreateBusinessTypeModalProps {
    isOpen: boolean
    onClose: () => void
}

const CreateBusinessTypeModal: React.FC<CreateBusinessTypeModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth()
    const { createBusinessType, refreshBusinessTypes } = useBusinessTypeContext()
    const [selectedBusinessType, setSelectedBusinessType] = useState<'individual' | 'corporation'>('individual')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // ローカルストレージ更新用
    const [_, setLocalBusinessType] = useLocalStorage<any>(`businessType_${user?.id}`, null)

    const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (isSubmitting) return
        setIsSubmitting(true)

        const timeoutId = setTimeout(() => {
            setIsSubmitting(false);
            alert('処理がタイムアウトしました。もう一度お試しください。');
        }, 10000);

        if (!user?.id) {
            alert('ログインしてください')
            setIsSubmitting(false)
            clearTimeout(timeoutId)
            return
        }

        try {
            const formData = new FormData(event.currentTarget)
            const companyName = formData.get('company_name') as string
            const address = formData.get('address') as string
            const representativeName = formData.get('representative_name') as string
            const businessType = formData.get('business_type') as 'individual' | 'corporation'
            const establishedDate = formData.get('established_date') as string

            if (!companyName || !address || !representativeName || !businessType) {
                alert('必須項目を入力してください')
                setIsSubmitting(false)
                clearTimeout(timeoutId)
                return
            }

            const businessTypeData = {
                business_type: businessType,
                company_name: companyName,
                tax_number: formData.get('tax_number') as string || '',
                address: address,
                phone: formData.get('phone') as string || '',
                email: formData.get('email') as string || '',
                representative_name: representativeName,
                established_date: establishedDate || undefined
            }

            const result = await createBusinessType(businessTypeData)
            clearTimeout(timeoutId)

            if (result) {
                setLocalBusinessType(result)
                refreshBusinessTypes()
                onClose()
            } else {
                alert('業態形態の作成に失敗しました。')
            }
        } catch (error: any) {
            clearTimeout(timeoutId)
            console.error('Error:', error)
            alert(`エラーが発生しました: ${error.message || '不明なエラー'}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-surface rounded-2xl shadow-2xl w-[95%] max-w-md max-h-[85vh] border border-border animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-border flex-shrink-0 bg-surface">
                    <h3 className="text-lg font-bold text-text-main">新しい業態形態を作成</h3>
                    <button
                        onClick={onClose}
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
                                onClick={() => setSelectedBusinessType('individual')}
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
                                onClick={() => setSelectedBusinessType('corporation')}
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
                        <label htmlFor="companyName" className="block text-sm font-medium text-text-secondary mb-1.5">
                            {selectedBusinessType === 'individual' ? '屋号' : '会社名'}
                        </label>
                        <input
                            id="companyName"
                            type="text"
                            name="company_name"
                            className="input-base"
                            placeholder={selectedBusinessType === 'individual' ? '個人商店' : '株式会社サンプル'}
                        />
                    </div>

                    {selectedBusinessType === 'corporation' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="taxNumber" className="block text-sm font-medium text-text-secondary mb-1.5">法人番号</label>
                                <input
                                    id="taxNumber"
                                    type="text"
                                    name="tax_number"
                                    className="input-base"
                                    placeholder="1234567890123"
                                />
                            </div>
                            <div>
                                <label htmlFor="establishedDate" className="block text-sm font-medium text-text-secondary mb-1.5">設立日</label>
                                <input
                                    id="establishedDate"
                                    type="date"
                                    name="established_date"
                                    className="input-base"
                                />
                            </div>
                        </div>
                    )}

                    {selectedBusinessType === 'individual' && (
                        <div>
                            <label htmlFor="taxNumber" className="block text-sm font-medium text-text-secondary mb-1.5">事業者登録番号</label>
                            <input
                                id="taxNumber"
                                type="text"
                                name="tax_number"
                                className="input-base"
                                placeholder="T1234567890123"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-text-secondary mb-1.5">住所</label>
                        <input
                            id="address"
                            type="text"
                            name="address"
                            className="input-base"
                            placeholder="東京都渋谷区1-1-1"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1.5">電話番号</label>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                className="input-base"
                                placeholder="03-1234-5678"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">メールアドレス</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                className="input-base"
                                placeholder="info@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="representativeName" className="block text-sm font-medium text-text-secondary mb-1.5">
                            {selectedBusinessType === 'individual' ? '事業主名' : '代表者名'}
                        </label>
                        <input
                            id="representativeName"
                            type="text"
                            name="representative_name"
                            className="input-base"
                            placeholder={selectedBusinessType === 'individual' ? '山田太郎' : '田中太郎'}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-border mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-tertiary"
                            disabled={isSubmitting}
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex items-center"
                            disabled={isSubmitting}
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
    )
}

export default CreateBusinessTypeModal
