import React, { useState } from 'react';
import { Check, X, FileText, RotateCcw } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { useBusinessTypeContext } from '../context/BusinessTypeContext';
import { useTransactions } from '../hooks/useTransactions';
import { saveReceipt } from '../services/receiptService';

interface ReceiptData {
    merchant: string;
    date: string;
    amount: number;
    category: string;
    taxRate: number;
    confidence: number;
    validationErrors?: string[];
    items?: {
        name: string;
        price: number | null;
        qty: number | null;
        line_total: number | null;
    }[];
}

interface ReceiptResultModalProps {
    receiptData: ReceiptData;
    onClose: () => void;
    onRetake?: () => void; // Make optional for edit mode
    onSave?: () => void;
    mode?: 'create' | 'edit';
    transactionId?: string | number;
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
    onSave,
    mode = 'create',
    transactionId,
}) => {
    console.log('🎯 ReceiptResultModalが呼び出されました', { receiptData, mode });

    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { createTransaction, updateTransaction } = useTransactions(user?.id, currentBusinessType?.business_type);

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

    // モバイルでのズーム問題を解決するためのEffect
    React.useEffect(() => {
        // iOSで入力フォーカス時にズームされるのを防ぐため、またモーダルを閉じた時にズームをリセットするために
        // metaタグを一時的に調整する、または単にマウント時に現在のスクロール/ズーム状態を意識する処理

        // 16px未満のフォントサイズでフォーカスするとiOSは自動ズームするため、CSSで解決するのが基本だが
        // ここではモーダルが閉じたときに確実に元の状態を示唆するようにする
        return () => {
            // モーダルが閉じるときに、もしズームされていたらリセットを試みる
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                const content = viewport.getAttribute('content');
                // 一旦別の値をセットして戻すことで再描画を促す（ハック的だが有効な場合がある）
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
                setTimeout(() => {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                }, 100);
            }
        };
    }, []);

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

            // ユーザーIDの検証
            if (!user.id) {
                throw new Error('ユーザーIDが無効です');
            }

            console.log('ユーザー認証情報:', user);
            console.log('現在の業態:', currentBusinessType);

            // 1. レシートテーブルに保存
            // 明細がある場合はDescriptionに追記
            let finalDescription = editedData.merchant; // シンプルに店舗名のみ、または空でも良いが、一旦店舗名にする
            if (editedData.items && editedData.items.length > 0) {
                finalDescription += '\n【内訳】\n' + editedData.items.map(i => `・${i.name}: ¥${i.line_total || i.price}`).join('\n');
            } else if (mode === 'edit' && receiptData.items && receiptData.items.length > 0) {
                // 編集モードで、itemsがstateにないがpropsにある場合（初期表示時など）のガード
                // ただしeditedData.itemsはstate管理されているので、基本は上の分岐でOK
            }

            if (mode === 'edit') {
                if (!transactionId) throw new Error('更新対象のIDが見つかりません');

                const updates = {
                    item: editedData.merchant,
                    amount: editedData.amount,
                    date: editedData.date,
                    category: selectedCategory,
                    description: finalDescription,
                };

                const result = await updateTransaction(String(transactionId), updates);
                if (result.error) throw result.error;

                alert('✅ 取引内容を更新しました');
                if (onSave) onSave();
                window.dispatchEvent(new CustomEvent('transactionRecorded')); // 更新通知
                onClose();
                return;
            }

            // --- 新規作成モード (Create) ---
            const receiptToSave = {
                user_id: user.id,
                date: editedData.date,
                merchant: editedData.merchant,
                amount: editedData.amount,
                category: selectedCategory,
                description: finalDescription,
                confidence: editedData.confidence,
                status: 'pending' as const,
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

            // 2. トランザクションとして保存（approval_status: 'pending'で保存してInboxに表示させる）
            // レシートURLやIDがあれば紐付けることも可能だが、現状は独立して保存
            const transactionToSave = {
                item: editedData.merchant,
                amount: editedData.amount,
                date: editedData.date,
                category: selectedCategory,
                type: 'expense' as const,
                description: finalDescription, // ここもfinalDescriptionを使う
                approval_status: 'pending' as const, // 保留中で保存
                tags: ['receipt_created', `receipt_id:${savedReceipt.id}`],
                creator: user.id,
                // receipt_id: savedReceipt.id // もしトランザクションテーブルにカラムがあれば追加
            };

            // トランザクションを保存
            const result = await createTransaction(transactionToSave);
            console.log('トランザクション保存結果:', result);

            if (result.error) {
                // トランザクション保存に失敗した場合のロールバック（今回は簡易的にログ出力のみ）
                console.error('トランザクション保存失敗:', result.error);
                throw result.error;
            }

            // 成功通知
            alert('✅ レシートがインボックスとレシート一覧に保存されました。内容を確認して承認を行ってください。');

            // 一覧を更新するためのコールバック
            if (onSave) {
                onSave();
            }

            // 完了イベントを発火
            window.dispatchEvent(new CustomEvent('transactionRecorded'));

            onClose();
        } catch (error: any) {
            console.error('保存エラー:', error);
            alert(`❌ エラーが発生しました: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden touch-none animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto touch-auto animate-in zoom-in-95 duration-300">
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

                {/* 検証エラー表示 */}
                {receiptData.validationErrors && receiptData.validationErrors.length > 0 && (
                    <div className="mx-5 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <span className="text-red-500 dark:text-red-400">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">抽出データの不整合</h3>
                                <div className="mt-1 text-xs text-red-700 dark:text-red-400">
                                    <ul className="list-disc pl-4 space-y-1">
                                        {receiptData.validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* メインコンテンツ */}
                <div className="p-4 space-y-6">
                    {/* 抽出データセクション */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center">
                                <div className="w-1 h-4 bg-blue-600 rounded-full mr-2" />
                                抽出データ
                            </h3>
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
                                <input
                                    type="text"
                                    value={editedData.merchant}
                                    onChange={(e) => handleFieldEdit('merchant', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-base sm:text-sm"
                                    placeholder="店舗名を入力"
                                />
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
                                    <input
                                        type="date"
                                        value={editedData.date}
                                        onChange={(e) => handleFieldEdit('date', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-base sm:text-sm"
                                    />
                                </div>

                                {/* 金額 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                        <span className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 rounded mr-1 flex items-center justify-center text-[8px]">
                                            💰
                                        </span>
                                        金額
                                    </label>
                                    <input
                                        type="number"
                                        value={editedData.amount}
                                        onChange={(e) => handleFieldEdit('amount', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-base sm:text-sm"
                                        placeholder="金額を入力"
                                    />
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

                    {/* AI抽出明細リスト表示 (編集可能) */}
                    {editedData.items && editedData.items.length > 0 && (
                        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                                <span className="flex items-center">
                                    <FileText className="w-4 h-4 mr-1 text-gray-500" />
                                    読み取った明細 (編集可)
                                    <span className="ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                        {editedData.items.length}件
                                    </span>
                                </span>
                            </h4>
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto shadow-inner">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-2/3">品名</th>
                                            <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">金額</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {editedData.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-1 py-1 text-xs text-gray-900 dark:text-gray-300">
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => {
                                                            const newItems = [...(editedData.items || [])];
                                                            newItems[index] = { ...item, name: e.target.value };
                                                            setEditedData({ ...editedData, items: newItems });
                                                        }}
                                                        className="w-full px-2 py-1 bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-base sm:text-xs"
                                                    />
                                                </td>
                                                <td className="px-1 py-1 text-xs text-right text-gray-900 dark:text-gray-300">
                                                    <div className="flex items-center justify-end">
                                                        <span className="text-gray-400 mr-1">¥</span>
                                                        <input
                                                            type="number"
                                                            value={item.line_total || item.price || 0}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                const newItems = [...(editedData.items || [])];
                                                                newItems[index] = { ...item, line_total: val, price: val };
                                                                setEditedData({ ...editedData, items: newItems });
                                                            }}
                                                            className="w-20 px-1 py-1 bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-right text-base sm:text-xs font-mono"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-1 text-[10px] text-gray-500 text-right">※明細を修正しても合計金額は自動計算されません（必要なら上部で修正してください）</p>
                        </div>
                    )}
                </div>

                {/* フッター */}
                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-2xl border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
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
                            : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
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