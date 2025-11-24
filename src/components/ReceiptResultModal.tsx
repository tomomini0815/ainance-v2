import React, { useState } from 'react';
import { Check, X, Edit2, Save, FileText, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { approveReceiptAndCreateTransaction } from '../services/receiptService';

interface ReceiptData {
    merchant: string;
    date: string;
    amount: number;
    category: string;
    taxRate: number;
    confidence: number;
}

interface ReceiptResultModalProps {
    receiptData: ReceiptData;
    onClose: () => void;
    onRetake: () => void;
}

// カテゴリのマスターデータ
const CATEGORIES = [
    { value: '食費', label: '🍽️ 食費', description: '食料品、飲料、外食など' },
    { value: '交通費', label: '🚃 交通費', description: '電車、バス、タクシー、ガソリンなど' },
    { value: '消耗品費', label: '📦 消耗品費', description: '事務用品、日用品など' },
    { value: '接待交際費', label: '🍻 接待交際費', description: '取引先との飲食、贈答品など' },
    { value: '通信費', label: '📱 通信費', description: '携帯電話、インターネットなど' },
    { value: '水道光熱費', label: '💡 水道光熱費', description: '電気、ガス、水道など' },
    { value: '家賃', label: '🏠 家賃', description: '事務所家賃、駐車場代など' },
    { value: '雑費', label: '📝 雑費', description: 'その他の経費' },
];

const ReceiptResultModal: React.FC<ReceiptResultModalProps> = ({
    receiptData,
    onClose,
    onRetake,
}) => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(receiptData);
    const [selectedCategory, setSelectedCategory] = useState(receiptData.category);
    const [isSaving, setIsSaving] = useState(false);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setEditedData({ ...editedData, category });
    };

    const handleFieldEdit = (field: keyof ReceiptData, value: any) => {
        setEditedData({ ...editedData, [field]: value });
    };

    const handleSave = async () => {
        if (!user?.uid) {
            alert('ログインが必要です');
            return;
        }

        setIsSaving(true);

        try {
            const businessType = currentBusinessType?.business_type || 'individual';

            // レシートデータを作成
            const receiptToSave = {
                id: Date.now().toString(),
                user_id: user.uid,
                date: editedData.date,
                merchant: editedData.merchant,
                amount: editedData.amount,
                category: selectedCategory,
                description: `${editedData.merchant}での購入`,
                confidence: editedData.confidence,
                status: 'approved' as const,
                tax_rate: editedData.taxRate,
                confidence_scores: {
                    merchant: editedData.confidence,
                    date: editedData.confidence,
                    amount: editedData.confidence,
                },
            };

            // レシートを承認して取引を作成
            const result = await approveReceiptAndCreateTransaction(
                receiptToSave.id,
                receiptToSave,
                businessType,
                user.uid
            );

            if (result.success) {
                // 成功通知
                alert('✅ レシートが記録されました！ダッシュボードに反映されています。');

                // ダッシュボードに遷移
                navigate('/dashboard');
                onClose();
            } else {
                throw new Error(result.error || '保存に失敗しました');
            }
        } catch (error: any) {
            console.error('保存エラー:', error);
            alert(`❌ エラーが発生しました: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* ヘッダー */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">📸 レシート読み取り結果</h2>
                            <p className="text-blue-100 mt-1">内容を確認して記録してください</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* 信頼度バー */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">認識精度</span>
                        <span className="text-sm font-bold text-blue-600">{Math.round(editedData.confidence)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${editedData.confidence}%` }}
                        />
                    </div>
                </div>

                {/* メインコンテンツ */}
                <div className="p-6 space-y-6">
                    {/* 抽出データ */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            抽出データ
                        </h3>

                        {/* 店舗名 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🏪 店舗名
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedData.merchant}
                                    onChange={(e) => handleFieldEdit('merchant', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-50 rounded-lg text-lg font-medium text-gray-900">
                                    {editedData.merchant}
                                </div>
                            )}
                        </div>

                        {/* 日付と金額 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📅 日付
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editedData.date}
                                        onChange={(e) => handleFieldEdit('date', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-gray-50 rounded-lg font-medium text-gray-900">
                                        {editedData.date}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    💰 金額
                                </label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editedData.amount}
                                        onChange={(e) => handleFieldEdit('amount', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-lg font-bold text-blue-600">
                                        ¥{editedData.amount.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 編集ボタン */}
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {isEditing ? (
                                <>
                                    <Check className="w-4 h-4 mr-1" />
                                    編集完了
                                </>
                            ) : (
                                <>
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    データを編集
                                </>
                            )}
                        </button>
                    </div>

                    {/* カテゴリ選択 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Save className="w-5 h-5 mr-2 text-blue-600" />
                            カテゴリを選択
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => handleCategoryChange(cat.value)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${selectedCategory === cat.value
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900">{cat.label}</div>
                                    <div className="text-xs text-gray-600 mt-1">{cat.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* フッター */}
                <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl border-t flex justify-between">
                    <button
                        onClick={onRetake}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        撮り直す
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || !selectedCategory}
                        className={`px-8 py-3 rounded-lg font-bold text-white flex items-center transition-all ${isSaving || !selectedCategory
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                保存中...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5 mr-2" />
                                データを記録
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptResultModal;
