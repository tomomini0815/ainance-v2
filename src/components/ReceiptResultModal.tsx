import React, { useState } from 'react';
import { Check, X, Edit2, FileText, RotateCcw } from 'lucide-react';
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                {/* ヘッダー */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6 md:p-8 rounded-t-3xl shadow-lg z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">レシート読み取り結果</h2>
                            <p className="text-blue-100 text-lg">内容を確認して、カテゴリを選択してください</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-white/20 rounded-xl transition-colors ml-4 flex-shrink-0"
                        >
                            <X className="w-7 h-7" />
                        </button>
                    </div>
                </div>

                {/* 信頼度バー */}
                <div className="bg-gradient-to-r from-green-50 via-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-semibold text-gray-700">AI 認識精度</span>
                            </div>
                            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                {Math.round(editedData.confidence)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                            <div
                                className="bg-gradient-to-r from-green-500 via-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 shadow-md"
                                style={{ width: `${editedData.confidence}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* メインコンテンツ */}
                <div className="p-8 md:p-10 space-y-8">
                    {/* 抽出データセクション */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                                <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full mr-3" />
                                抽出データ
                            </h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all ${isEditing
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                            >
                                {isEditing ? (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        編集完了
                                    </>
                                ) : (
                                    <>
                                        <Edit2 className="w-5 h-5 mr-2" />
                                        データを編集
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* 店舗名 */}
                            <div className="lg:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                                        🏪
                                    </span>
                                    店舗名
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedData.merchant}
                                        onChange={(e) => handleFieldEdit('merchant', e.target.value)}
                                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
                                        placeholder="店舗名を入力"
                                    />
                                ) : (
                                    <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-xl font-bold text-gray-900 border-2 border-blue-100">
                                        {editedData.merchant}
                                    </div>
                                )}
                            </div>

                            {/* 日付 */}
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                                        📅
                                    </span>
                                    日付
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editedData.date}
                                        onChange={(e) => handleFieldEdit('date', e.target.value)}
                                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                                    />
                                ) : (
                                    <div className="px-5 py-4 bg-gray-50 rounded-xl font-semibold text-gray-900 border-2 border-gray-100">
                                        {editedData.date}
                                    </div>
                                )}
                            </div>

                            {/* 金額 */}
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-2">
                                        💰
                                    </span>
                                    金額
                                </label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editedData.amount}
                                        onChange={(e) => handleFieldEdit('amount', parseInt(e.target.value))}
                                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
                                        placeholder="金額を入力"
                                    />
                                ) : (
                                    <div className="px-5 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-100">
                                        ¥{editedData.amount.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* カテゴリ選択セクション */}
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                            <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full mr-3" />
                            カテゴリを選択
                            <span className="ml-3 px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                必須
                            </span>
                        </h3>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => handleCategoryChange(cat.value)}
                                    className={`group p-5 rounded-2xl border-2 text-left transition-all duration-200 transform hover:scale-105 ${selectedCategory === cat.value
                                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-200/50'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`text-3xl mb-2 transition-transform group-hover:scale-110 ${selectedCategory === cat.value ? 'animate-bounce' : ''
                                        }`}>
                                        {cat.label.split(' ')[0]}
                                    </div>
                                    <div className="font-bold text-gray-900 mb-1">
                                        {cat.label.split(' ')[1]}
                                    </div>
                                    <div className="text-xs text-gray-600 leading-tight">
                                        {cat.description}
                                    </div>
                                    {selectedCategory === cat.value && (
                                        <div className="mt-2 flex items-center text-blue-600 text-sm font-semibold">
                                            <Check className="w-4 h-4 mr-1" />
                                            選択中
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* フッター */}
                <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 p-6 md:p-8 rounded-b-3xl border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg">
                    <button
                        onClick={onRetake}
                        className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold flex items-center justify-center shadow-sm hover:shadow-md"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        撮り直す
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || !selectedCategory}
                        className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center transition-all shadow-lg transform ${isSaving || !selectedCategory
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                                保存中...
                            </>
                        ) : (
                            <>
                                <Check className="w-6 h-6 mr-2" />
                                データを記録する
                                {selectedCategory && (
                                    <div className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                                        →
                                    </div>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptResultModal;
