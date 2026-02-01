import React, { useState, useEffect } from 'react';
import { TaxReturnInputData, initialTaxReturnInputData } from '../../types/taxReturnInput';
import { TaxReturnInputService } from '../../services/TaxReturnInputService';
import { TaxReturnTable1Input } from './TaxReturnTable1Input';
import { TaxReturnTable2Input } from './TaxReturnTable2Input';
import { BlueReturnInput } from './BlueReturnInput';
import { Save, RefreshCw, FileText, Activity, CreditCard, Download } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

import { useBusinessTypeContext } from '../../context/BusinessTypeContext';

export const TaxReturnInputForm: React.FC = () => {
    const [data, setData] = useState<TaxReturnInputData>(initialTaxReturnInputData);
    const [activeTab, setActiveTab] = useState<'table1' | 'table2' | 'blue'>('table1');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const { user } = useAuth();
    const { currentBusinessType } = useBusinessTypeContext();
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);

    // データ読み込み
    useEffect(() => {
        const loadedData = TaxReturnInputService.getData();
        setData(loadedData);
    }, []);

    // 変更ハンドラ wrapper
    const handleDataChange = (updates: Partial<TaxReturnInputData>) => {
        setData(prev => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
        setSaveStatus('idle');
    };

    // 取引データからのインポート処理
    const handleImportFromTransactions = () => {
        if (!transactions || transactions.length === 0) {
            toast.error('取り込む取引データがありません');
            return;
        }

        if (!window.confirm('現在入力されているデータに、取引データから集計した値を加算・上書きしますか？\n（手動修正した内容は上書きされる可能性があります）')) {
            return;
        }

        try {
            const calculatedData = TaxReturnInputService.calculateDataFromTransactions(transactions);

            // 既存データとマージ（数値は加算ではなく上書きが基本だが、ユーザー体験としてはどうすべきか？計画では「転記」なので上書きで実装）
            // ただし、計算結果が0の場合は上書きしないほうが安全かもしれないが、
            // 「転記」なら取引データの結果（0なら0）を正とするのが自然。

            setData(prev => {
                const newData = { ...prev };

                // Income
                if (calculatedData.income) {
                    newData.income = { ...newData.income, ...calculatedData.income };
                }

                // Deductions
                if (calculatedData.deductions) {
                    // deductionsは部分的なので、存在するキーのみ更新したいが、
                    // calculateDataFromTransactionsは全deductionsを返しているため、
                    // 0より大きいものだけ、あるいは全てを上書きする。
                    // ここではシンプルに「計算された項目」を上書きする。
                    // ただしcalculateDataFromTransactionsは全項目を初期化して返しているため、
                    // 意図しない0上書きを防ぐため、計算ロジック側で調整済み出ない場合は注意。
                    // 今回の実装では calculateDataFromTransactions は全項目 0 スタートで計算している。
                    // したがって、取引データにない項目は 0 にリセットされてしまう恐れがある。
                    // よって、計算結果が 0 より大きいものだけをマージするか、
                    // ユーザーに「リセットして計算」か「マージ」かを選ばせるのがベストだが、
                    // シンプルに「計算結果で上書き」とする（インポート機能の性質上）。
                    // ただし、すでに手入力がある場合に 0 で消えると困るため、
                    // ここでは「計算結果 > 0 の項目のみ上書き」とする折衷案をとる。

                    const newDeductions = { ...newData.deductions };
                    if (calculatedData.deductions) {
                        (Object.keys(calculatedData.deductions) as Array<keyof typeof calculatedData.deductions>).forEach(key => {
                            const val = calculatedData.deductions![key];
                            if (val > 0) {
                                newDeductions[key] = val;
                            }
                        });
                    }
                    newData.deductions = newDeductions;
                }

                return newData;
            });

            setHasUnsavedChanges(true);
            toast.success('取引データを転記しました');
        } catch (error) {
            console.error('Import failed:', error);
            toast.error('データの転記に失敗しました');
        }
    };

    // 保存処理
    const handleSave = () => {
        setSaveStatus('saving');
        // 少し遅延させてSaving状態を見せる
        setTimeout(() => {
            TaxReturnInputService.saveData(data);
            setHasUnsavedChanges(false);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* ヘッダー */}
                {/* ヘッダー */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-text-main whitespace-nowrap">申告書入力エディタ</h1>
                        <p className="text-xs sm:text-base text-text-muted mt-1">
                            申告書に記載する詳細情報を手動で入力・編集します
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            onClick={handleImportFromTransactions}
                            className="btn-outline whitespace-nowrap px-2 py-2 text-xs sm:px-4 sm:text-sm h-8 sm:h-10"
                            title="収入や一部の控除を取引履歴から自動集計して入力します"
                        >
                            <Download className="w-3 h-3 mr-1 sm:w-4 sm:mr-2" />
                            取引データ転記
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm('入力内容をすべてリセットしますか？')) {
                                    TaxReturnInputService.resetData();
                                    setData(initialTaxReturnInputData);
                                    setHasUnsavedChanges(true); // リセットも変更とみなす
                                }
                            }}
                            className="btn-ghost whitespace-nowrap px-2 py-2 text-xs sm:px-4 sm:text-sm h-8 sm:h-10"
                        >
                            <RefreshCw className="w-3 h-3 mr-1 sm:w-4 sm:mr-2" />
                            リセット
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasUnsavedChanges && saveStatus !== 'saved'}
                            className={`btn-primary whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:text-sm h-8 sm:h-10 min-w-0 sm:min-w-[140px] ${saveStatus === 'saved' ? 'bg-success hover:bg-success' : ''}`}
                        >
                            {saveStatus === 'saving' ? (
                                <>
                                    <RefreshCw className="w-3 h-3 mr-1 sm:w-4 sm:mr-2 animate-spin" />
                                    保存中...
                                </>
                            ) : saveStatus === 'saved' ? (
                                <>保存しました</>
                            ) : (
                                <>
                                    <Save className="w-3 h-3 mr-1 sm:w-4 sm:mr-2" />
                                    {hasUnsavedChanges ? '保存する' : '保存済み'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* タブナビゲーション */}
                <div className="bg-surface rounded-xl shadow-sm border border-border mb-6 overflow-hidden">
                    <div className="flex overflow-x-auto">
                        <TabButton
                            active={activeTab === 'table1'}
                            onClick={() => setActiveTab('table1')}
                            icon={Activity}
                            label="第一表 (収入・控除)"
                        />
                        <TabButton
                            active={activeTab === 'table2'}
                            onClick={() => setActiveTab('table2')}
                            icon={CreditCard}
                            label="第二表 (内訳・詳細)"
                        />
                        <TabButton
                            active={activeTab === 'blue'}
                            onClick={() => setActiveTab('blue')}
                            icon={FileText}
                            label="青色申告決算書"
                        />
                    </div>
                </div>

                {/* フォームコンテンツ */}
                <div className="bg-surface rounded-xl shadow-sm border border-border p-6 animate-in fade-in duration-300">
                    {activeTab === 'table1' && (
                        <TaxReturnTable1Input data={data} onChange={handleDataChange} />
                    )}
                    {activeTab === 'table2' && (
                        <TaxReturnTable2Input data={data} onChange={handleDataChange} />
                    )}
                    {activeTab === 'blue' && (
                        <BlueReturnInput data={data} onChange={handleDataChange} />
                    )}
                </div>

                {/* フッターナビ */}
                <div className="mt-8 flex justify-between">
                    <p className="text-sm text-text-muted">
                        ※ ここで入力したデータはブラウザに保存され、PDF作成時に使用されます。
                    </p>
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${active
            ? 'border-primary text-primary bg-primary-light/10'
            : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-highlight'
            }`}
    >
        <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-text-muted'}`} />
        {label}
    </button>
);
