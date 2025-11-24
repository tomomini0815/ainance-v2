import React, { useState } from 'react';
import { Check, X, Edit2, FileText, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { approveReceiptAndCreateTransaction, saveReceipt } from '../services/receiptService';

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
    console.log('🎯 ReceiptResultModalが呼び出されました', { receiptData });
    
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(receiptData || {
        merchant: '',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        category: '雑費',
        taxRate: 10,
        confidence: 0,
    });
    const [selectedCategory, setSelectedCategory] = useState(receiptData?.category || '雑費');
    const [isSaving, setIsSaving] = useState(false);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setEditedData({ ...editedData, category });
    };

    const handleFieldEdit = (field: keyof ReceiptData, value: any) => {
        setEditedData({ ...editedData, [field]: value });
    };

    const handleSave = async () => {
        // Supabaseの認証情報の構造に合わせて修正
        if (!user?.id) {
            alert('ログインが必要です');
            return;
        }

        setIsSaving(true);

        try {
            const businessType = currentBusinessType?.business_type || 'individual';
            console.log('レシート保存を開始:', { user, businessType, editedData, selectedCategory });

            // レシートデータを作成（IDはデータベースで自動生成）
            // user.idを使用するように修正
            const receiptToSave = {
                user_id: user.id,
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

            // レシートを保存
            const savedReceipt = await saveReceipt(receiptToSave);
            console.log('レシート保存結果:', { savedReceipt });

            if (!savedReceipt || !savedReceipt.id) {
                throw new Error('レシートの保存に失敗しました');
            }

            // 保存されたレシートIDを使って取引を作成
            // user.idを使用するように修正
            const result = await approveReceiptAndCreateTransaction(
                savedReceipt.id,
                savedReceipt,
                businessType,
                user.id
            );
            console.log('取引作成結果:', { result });

            if (result.success) {
                // カスタムイベントを発火してダッシュボードのデータを更新
                window.dispatchEvent(new CustomEvent('transactionRecorded'));

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* ヘッダー */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                            <h2 className="text-lg font-bold">レシート読み取り結果</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">内容を確認して、カテゴリを選択してください</p>
                </div>

                {/* 信頼度バー */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">AI認識精度</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {Math.round(editedData.confidence)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${editedData.confidence}%` }}
                        />
                    </div>
                </div>

                {/* メインコンテンツ */}
                <div className="p-5 space-y-6">
                    {/* 抽出データセクション */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center">
                                <div className="w-1 h-4 bg-blue-600 rounded-full mr-2" />
                                抽出データ
                            </h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all ${isEditing
                                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                                    : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                                    }`}
                            >
                                {isEditing ? (
                                    <>
                                        <Check className="w-3 h-3 mr-1" />
                                        完了
                                    </>
                                ) : (
                                    <>
                                        <Edit2 className="w-3 h-3 mr-1" />
                                        編集
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {/* 店舗名 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                    <span className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded mr-1 flex items-center justify-center text-[8px]">
                                        🏪
                                    </span>
                                    店舗名
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedData.merchant}
                                        onChange={(e) => handleFieldEdit('merchant', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                        placeholder="店舗名を入力"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-sm font-medium text-gray-900 dark:text-white border border-blue-100 dark:border-blue-800/50">
                                        {editedData.merchant}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* 日付 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                        <span className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded mr-1 flex items-center justify-center text-[8px]">
                                            📅
                                        </span>
                                        日付
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editedData.date}
                                            onChange={(e) => handleFieldEdit('date', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                                            {editedData.date}
                                        </div>
                                    )}
                                </div>

                                {/* 金額 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                        <span className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 rounded mr-1 flex items-center justify-center text-[8px]">
                                            💰
                                        </span>
                                        金額
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editedData.amount}
                                            onChange={(e) => handleFieldEdit('amount', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                            placeholder="金額を入力"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg text-sm font-bold text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50">
                                            ¥{editedData.amount.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* カテゴリ選択セクション */}
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center mb-3">
                            <div className="w-1 h-4 bg-purple-600 rounded-full mr-2" />
                            カテゴリを選択
                            <span className="ml-2 px-1.5 py-0.5 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-[10px] font-bold rounded-full">
                                必須
                            </span>
                        </h3>

                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => handleCategoryChange(cat.value)}
                                    className={`p-3 rounded-lg border text-left transition-all text-sm ${selectedCategory === cat.value
                                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/50 shadow-sm'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <div className="text-base mr-2">
                                            {cat.label.split(' ')[0]}
                                        </div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {cat.label.split(' ')[1]}
                                        </div>
                                        {selectedCategory === cat.value && (
                                            <Check className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400" />
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                                        {cat.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* フッター */}
                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-6 rounded-b-2xl border-t border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        onClick={onRetake}
                        className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-all text-sm font-medium flex items-center justify-center"
                    >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        撮り直す
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || !selectedCategory}
                        className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center transition-all ${isSaving || !selectedCategory
                            ? 'bg-gray-300 dark:bg-gray-500 text-gray-500 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 shadow-sm'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                保存中...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-1" />
                                データを記録する
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptResultModal;