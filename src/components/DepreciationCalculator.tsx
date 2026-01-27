import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, AlertCircle, HelpCircle } from 'lucide-react';
import {
    DepreciationAsset,
    calculateDepreciation,
    formatCurrency
} from '../services/CorporateTaxService';

interface DepreciationCalculatorProps {
    onCalculate: (totalDepreciation: number, assets: DepreciationAsset[]) => void;
    initialAssets?: DepreciationAsset[];
}

const DepreciationCalculator: React.FC<DepreciationCalculatorProps> = ({
    onCalculate,
    initialAssets = []
}) => {
    const [assets, setAssets] = useState<DepreciationAsset[]>(initialAssets);
    const [isAdding, setIsAdding] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // 減価償却方法の説明データ
    const methodExplanations = [
        { name: '定額法', desc: '取得価額に一定の償却率を乗じて、毎年一定額を償却する方法です。' },
        { name: '定率法', desc: '未償却残高に一定の償却率を乗じて、当初ほど多く、年々少なく償却する方法です。' },
        { name: '一括償却', desc: '20万円未満の資産を、耐用年数に関わらず3年間で均等に償却（各年1/3）する方法です。' },
        { name: '生産高比例法', desc: '自動車や鉱業用資産など、利用実績（走行距離等）に比例して償却する方法です。' },
        { name: 'リース期間定額法', desc: '所有権移転外ファイナンス・リース資産を、リース期間を耐用年数として償却する方法です。' },
        { name: '少額特例', desc: '中小企業の特例として、30万円未満の資産を取得時に全額経費（即時償却）できる制度です。' },
    ];

    // 新規追加用のフォーム状態
    const [newAsset, setNewAsset] = useState<Omit<DepreciationAsset, 'id'>>(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 0-indexed

        // 確定申告時期（1〜3月）は、前年末をデフォルトにする（2025年などが見えるように）
        let defaultDate = now.toISOString().slice(0, 7);
        if (month <= 3) {
            defaultDate = `${year - 1}-12`;
        }

        return {
            name: '',
            quantity: 1,
            unit: '台',
            acquisitionDate: defaultDate,
            acquisitionCost: 0,
            depreciationMethod: 'straightLine',
            usefulLife: 5,
            businessRatio: 100,
            currentYearMonths: 12,
        };
    });

    // 資産ごとの計算結果
    const results = assets.map(asset => calculateDepreciation(asset));
    const totalDepreciation = results.reduce((sum, res) => sum + res.currentDepreciation, 0);

    // 親コンポーネントへ通知
    useEffect(() => {
        onCalculate(totalDepreciation, assets);
    }, [totalDepreciation, assets]);

    const handleAddAsset = () => {
        if (!newAsset.name || newAsset.acquisitionCost <= 0) return;

        const asset: DepreciationAsset = {
            ...newAsset,
            id: Math.random().toString(36).substr(2, 9),
        };

        setAssets([...assets, asset]);
        setNewAsset(prev => ({
            ...prev,
            name: '',
            acquisitionCost: 0,
            // acquisitionDate は前回の入力を引き継ぐか、初期化ロジックに合わせる
            // ここではリセットするが、計算ロジックと同様のデフォルトを適用
        }));
        setIsAdding(false);
    };

    const removeAsset = (id: string) => {
        setAssets(assets.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 relative">
                    <h3 className="text-lg font-semibold text-text-main">減価償却費の計算</h3>

                    {/* ヘルプアイコンとツールチップ */}
                    <div
                        className="group relative"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        onClick={() => setShowTooltip(!showTooltip)}
                    >
                        <HelpCircle className="w-5 h-5 text-text-muted cursor-help hover:text-primary transition-colors" />

                        {showTooltip && (
                            <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-surface border border-border rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-1">
                                <h4 className="font-bold text-text-main mb-3 pb-2 border-b border-border text-sm flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-primary" />
                                    償却方法の解説
                                </h4>
                                <div className="space-y-3">
                                    {methodExplanations.map((m, i) => (
                                        <div key={i}>
                                            <span className="text-xs font-bold text-primary block mb-0.5">【{m.name}】</span>
                                            <p className="text-xs text-text-muted leading-relaxed">{m.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* モバイル向けに閉じる案内 */}
                                <p className="mt-3 pt-3 border-t border-border text-[10px] text-text-muted text-center sm:hidden">
                                    タップで閉じます
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-lg">
                    <span className="text-sm text-primary font-medium mr-2">減価償却費合計</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(totalDepreciation)}</span>
                </div>
            </div>

            {/* 資産リスト（PC表示：テーブル形式） */}
            <div className="hidden md:block overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-highlight text-text-muted font-medium border-b border-border">
                        <tr>
                            <th className="p-3 min-w-[150px]">資産名称</th>
                            <th className="p-3 min-w-[100px]">面積/数量</th>
                            <th className="p-3 min-w-[120px]">取得年月</th>
                            <th className="p-3 min-w-[120px]">取得価額</th>
                            <th className="p-3 min-w-[100px]">償却方法</th>
                            <th className="p-3 min-w-[80px]">耐用年数</th>
                            <th className="p-3 min-w-[80px]">償却率</th>
                            <th className="p-3 min-w-[80px]">使用月数</th>
                            <th className="p-3 min-w-[120px] bg-primary/5">本年分普通<br />償却費</th>
                            <th className="p-3 min-w-[80px]">事業専用<br />割合(%)</th>
                            <th className="p-3 min-w-[120px]">本年分必要<br />経費算入額</th>
                            <th className="p-3 min-w-[120px]">期末残高<br />(未償却残高)</th>
                            <th className="p-3 w-[50px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                        {assets.map((asset, index) => {
                            const res = results[index];
                            return (
                                <tr key={asset.id} className="hover:bg-surface-highlight/50 transition-colors">
                                    <td className="p-3 font-medium text-text-main">{asset.name}</td>
                                    <td className="p-3 text-text-main">{asset.quantity}{asset.unit}</td>
                                    <td className="p-3 text-text-muted">{asset.acquisitionDate}</td>
                                    <td className="p-3 text-text-main font-mono">{formatCurrency(asset.acquisitionCost)}</td>
                                    <td className="p-3 text-text-main">
                                        {asset.depreciationMethod === 'straightLine' ? '定額法' :
                                            asset.depreciationMethod === 'decliningBalance' ? '定率法' :
                                                asset.depreciationMethod === 'lumpSum' ? '一括' :
                                                    asset.depreciationMethod === 'unitsOfProduction' ? '生産高比例' :
                                                        asset.depreciationMethod === 'leasePeriod' ? 'リース期間' : '少額特例'}
                                    </td>
                                    <td className="p-3 text-center text-text-main">
                                        {asset.depreciationMethod === 'unitsOfProduction' ? '-' :
                                            asset.depreciationMethod === 'immediateSME' ? '即時' :
                                                asset.depreciationMethod === 'lumpSum' ? '3年' : `${asset.usefulLife}年`}
                                    </td>
                                    <td className="p-3 text-center text-text-muted">
                                        {asset.depreciationMethod === 'unitsOfProduction' ?
                                            `${asset.currentYearUnits}/${asset.totalEstimatedUnits}` :
                                            asset.depreciationMethod === 'immediateSME' ? '-' :
                                                res.depreciationRate.toFixed(3)}
                                    </td>
                                    <td className="p-3 text-center text-text-main">
                                        {asset.depreciationMethod === 'immediateSME' || asset.depreciationMethod === 'unitsOfProduction' ? '-' : `${asset.currentYearMonths}ヶ月`}
                                    </td>
                                    <td className="p-3 text-right font-medium text-text-main bg-primary/5">
                                        {formatCurrency(res.currentDepreciation)}
                                    </td>
                                    <td className="p-3 text-center text-text-main">{asset.businessRatio}%</td>
                                    <td className="p-3 text-right font-bold text-primary">
                                        {formatCurrency(res.currentDepreciation)}
                                    </td>
                                    <td className="p-3 text-right text-text-muted">
                                        {formatCurrency(res.bookValue)}
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => removeAsset(asset.id)}
                                            className="text-text-muted hover:text-error transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {assets.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan={13} className="p-8 text-center text-text-muted">
                                    資産が登録されていません。「資産を追加」ボタンから登録してください。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 資産リスト（モバイル表示：カード形式・2カラム） */}
            <div className="md:hidden space-y-4">
                {assets.map((asset, index) => {
                    const res = results[index];
                    return (
                        <div key={asset.id} className="bg-surface border border-border rounded-xl p-3 shadow-sm relative">
                            {/* 削除ボタン（右上） */}
                            <button
                                onClick={() => removeAsset(asset.id)}
                                className="absolute top-4 right-4 text-text-muted hover:text-error transition-colors p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <h4 className="font-bold text-text-main mb-3 pr-8 text-lg">{asset.name}</h4>

                            <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                                <div>
                                    <div className="text-xs text-text-muted mb-0.5">取得価額</div>
                                    <div className="font-medium text-text-main">{formatCurrency(asset.acquisitionCost)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-text-muted mb-0.5">取得年月</div>
                                    <div className="font-medium text-text-main">{asset.acquisitionDate}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-text-muted mb-0.5">償却方法</div>
                                    <div className="font-medium text-text-main">
                                        {asset.depreciationMethod === 'straightLine' ? '定額法' :
                                            asset.depreciationMethod === 'decliningBalance' ? '定率法' :
                                                asset.depreciationMethod === 'lumpSum' ? '一括' :
                                                    asset.depreciationMethod === 'unitsOfProduction' ? '生産高比例' :
                                                        asset.depreciationMethod === 'leasePeriod' ? 'リース期間' : '少額特例'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-text-muted mb-0.5">耐用年数</div>
                                    <div className="font-medium text-text-main">
                                        {asset.depreciationMethod === 'immediateSME' ? '即時' :
                                            asset.depreciationMethod === 'lumpSum' ? '3年' : `${asset.usefulLife}年`}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-text-muted mb-0.5">償却率</div>
                                    <div className="font-medium text-text-main">
                                        {asset.depreciationMethod === 'unitsOfProduction' || asset.depreciationMethod === 'immediateSME' ? '-' : res.depreciationRate.toFixed(3)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-text-muted mb-0.5">本年償却額</div>
                                    <div className="font-bold text-primary">{formatCurrency(res.currentDepreciation)}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-text-muted mb-0.5">事業割合</div>
                                    <div className="font-medium text-text-main">{asset.businessRatio}%</div>
                                </div>
                                <div>
                                    <div className="text-xs text-text-muted mb-0.5">未償却残高</div>
                                    <div className="font-medium text-text-muted">{formatCurrency(res.bookValue)}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {assets.length === 0 && !isAdding && (
                    <div className="p-8 text-center text-text-muted border border-dashed border-border rounded-xl">
                        資産が登録されていません。<br />「資産を追加する」ボタンから登録してください。
                    </div>
                )}
            </div>

            {/* 追加フォーム */}
            {isAdding ? (
                <div className="bg-surface border border-primary/30 rounded-xl p-3 shadow-sm">
                    <h4 className="font-medium text-text-main mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-primary" />
                        新規資産の登録
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                            <label className="text-xs text-text-muted block mb-1">資産名称 *</label>
                            <input
                                type="text"
                                value={newAsset.name}
                                onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                                className="input-base w-full"
                                placeholder="例: パソコン、営業車"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-text-muted block mb-1">取得価額 *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">¥</span>
                                <input
                                    type="number"
                                    value={newAsset.acquisitionCost || ''}
                                    onChange={e => setNewAsset({ ...newAsset, acquisitionCost: Number(e.target.value) })}
                                    className="input-base w-full pl-6"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-text-muted block mb-1">取得年月</label>
                            <input
                                type="month"
                                value={newAsset.acquisitionDate}
                                onChange={e => setNewAsset({ ...newAsset, acquisitionDate: e.target.value })}
                                className="input-base w-full"
                                min={`${new Date().getFullYear() - 10}-01`}
                                max={`${new Date().getFullYear() + 1}-12`}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-text-muted block mb-1">償却方法</label>
                            <select
                                value={newAsset.depreciationMethod}
                                onChange={e => setNewAsset({ ...newAsset, depreciationMethod: e.target.value as any })}
                                className="input-base w-full"
                            >
                                <option value="straightLine">定額法</option>
                                <option value="decliningBalance">定率法</option>
                                <option value="lumpSum">一括償却（3年）</option>
                                <option value="unitsOfProduction">生産高比例法</option>
                                <option value="leasePeriod">リース期間定額法</option>
                                <option value="immediateSME">少額減価償却資産（特例）</option>
                            </select>
                        </div>
                        {newAsset.depreciationMethod === 'unitsOfProduction' ? (
                            <>
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">推定総利用量</label>
                                    <input
                                        type="number"
                                        value={newAsset.totalEstimatedUnits || ''}
                                        onChange={e => setNewAsset({ ...newAsset, totalEstimatedUnits: Number(e.target.value) })}
                                        className="input-base w-full"
                                        placeholder="例: 100000"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">本年利用量</label>
                                    <input
                                        type="number"
                                        value={newAsset.currentYearUnits || ''}
                                        onChange={e => setNewAsset({ ...newAsset, currentYearUnits: Number(e.target.value) })}
                                        className="input-base w-full"
                                        placeholder="例: 1000"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {newAsset.depreciationMethod !== 'immediateSME' && newAsset.depreciationMethod !== 'lumpSum' && (
                                    <div>
                                        <label className="text-xs text-text-muted block mb-1">耐用年数 (年)</label>
                                        <input
                                            type="number"
                                            value={newAsset.usefulLife}
                                            onChange={e => setNewAsset({ ...newAsset, usefulLife: Number(e.target.value) })}
                                            className="input-base w-full"
                                            min="1"
                                        />
                                    </div>
                                )}
                                {newAsset.depreciationMethod === 'lumpSum' && (
                                    <div>
                                        <label className="text-xs text-text-muted block mb-1">耐用年数 (年)</label>
                                        <input
                                            type="text"
                                            value="3"
                                            disabled
                                            className="input-base w-full bg-surface-highlight cursor-not-allowed"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        {newAsset.depreciationMethod !== 'immediateSME' &&
                            newAsset.depreciationMethod !== 'lumpSum' &&
                            newAsset.depreciationMethod !== 'unitsOfProduction' && (
                                <div>
                                    <label className="text-xs text-text-muted block mb-1">本年中の償却期間 (月)</label>
                                    <input
                                        type="number"
                                        value={newAsset.currentYearMonths}
                                        onChange={e => setNewAsset({ ...newAsset, currentYearMonths: Math.min(12, Math.max(1, Number(e.target.value))) })}
                                        className="input-base w-full"
                                        min="1" max="12"
                                    />
                                </div>
                            )}
                        <div>
                            <label className="text-xs text-text-muted block mb-1">事業専用割合 (%)</label>
                            <input
                                type="number"
                                value={newAsset.businessRatio}
                                onChange={e => setNewAsset({ ...newAsset, businessRatio: Math.min(100, Math.max(0, Number(e.target.value))) })}
                                className="input-base w-full"
                                min="0" max="100"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="btn-secondary py-2 px-4"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleAddAsset}
                            disabled={!newAsset.name || newAsset.acquisitionCost <= 0}
                            className="btn-primary py-2 px-4 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            追加する
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full md:w-auto md:mx-auto md:px-12 py-3 md:py-2.5 border-2 border-dashed border-primary rounded-xl text-primary bg-primary-light transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    資産を追加する
                </button>
            )}

            <div className="bg-info-light border border-info/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-text-main font-medium">減価償却の記帳について</p>
                    <p className="text-sm text-text-muted mt-1">
                        ここで計算された償却費の合計額は、自動的に損益計算書の「減価償却費」として計上されます。
                        10万円未満の資産は消耗品費として処理できます（青色申告の場合は30万円未満を少額減価償却資産として即時償却できる特例もあります）。
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DepreciationCalculator;
