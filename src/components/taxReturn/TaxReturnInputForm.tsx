import React, { useState, useEffect } from 'react';
import { TaxReturnInputData, initialTaxReturnInputData } from '../../types/taxReturnInput';
import { TaxReturnInputService } from '../../services/TaxReturnInputService';
import { TaxReturnTable1Input } from './TaxReturnTable1Input';
import { TaxReturnTable2Input } from './TaxReturnTable2Input';
import { BlueReturnInput } from './BlueReturnInput';
import { Save, RefreshCw, FileText, Activity, CreditCard } from 'lucide-react';

export const TaxReturnInputForm: React.FC = () => {
    const [data, setData] = useState<TaxReturnInputData>(initialTaxReturnInputData);
    const [activeTab, setActiveTab] = useState<'table1' | 'table2' | 'blue'>('table1');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-main">申告書入力エディタ</h1>
                        <p className="text-text-muted mt-1">
                            申告書に記載する詳細情報を手動で入力・編集します
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (window.confirm('入力内容をすべてリセットしますか？')) {
                                    TaxReturnInputService.resetData();
                                    setData(initialTaxReturnInputData);
                                    setHasUnsavedChanges(true); // リセットも変更とみなす
                                }
                            }}
                            className="btn-ghost"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            リセット
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasUnsavedChanges && saveStatus !== 'saved'}
                            className={`btn-primary min-w-[140px] ${saveStatus === 'saved' ? 'bg-success hover:bg-success' : ''}`}
                        >
                            {saveStatus === 'saving' ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    保存中...
                                </>
                            ) : saveStatus === 'saved' ? (
                                <>保存しました</>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
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
