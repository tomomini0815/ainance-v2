import React from 'react';
import { CorporateTaxInputData } from '../../types/corporateTaxInput';
import { MoneyInput } from '../common/MoneyInput';
import { Calculator, RotateCcw, MousePointer2, Info } from 'lucide-react';

interface Props {
    data: CorporateTaxInputData;
    onChange: (updates: Partial<CorporateTaxInputData>) => void;
}

export const Beppyo1Input: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof typeof data.beppyo1, value: number) => {
        onChange({
            beppyo1: {
                ...data.beppyo1,
                [field]: value
            }
        });
    };
    const handleCalibrationChange = (field: 'globalShiftX' | 'globalShiftY', value: number) => {
        onChange({
            calibration: {
                globalShiftX: data.calibration?.globalShiftX || 0,
                globalShiftY: data.calibration?.globalShiftY || 0,
                [field]: value
            }
        });
    };

    const resetCalibration = () => {
        onChange({
            calibration: {
                globalShiftX: 0,
                globalShiftY: 0
            }
        });
    };

    const finalTaxAmount = data.beppyo1.corporateTaxAmount - data.beppyo1.specialTaxCredit - data.beppyo1.interimPayment;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 課税標準額 */}
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded font-bold text-sm">1</span>
                        <label className="block text-sm font-bold text-text-main">課税標準額（所得金額）</label>
                    </div>
                    <MoneyInput
                        value={data.beppyo1.taxableIncome}
                        onChange={(val) => handleChange('taxableIncome', val)}
                        className="input-base w-full font-mono text-lg bg-surface-highlight/20"
                    />
                    <p className="text-[10px] text-text-muted mt-2">※ 別表四の「48」の金額を転記します</p>
                </div>

                {/* 法人税額 */}
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded font-bold text-sm">2</span>
                        <label className="block text-sm font-bold text-text-main">法人税額（算出）</label>
                    </div>
                    <MoneyInput
                        value={data.beppyo1.corporateTaxAmount}
                        onChange={(val) => handleChange('corporateTaxAmount', val)}
                        className="input-base w-full font-mono text-lg"
                    />
                    <p className="text-[10px] text-text-muted mt-2">※ 課税標準額に税率を乗じて計算します</p>
                </div>

                {/* 税額控除 */}
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded font-bold text-sm">10</span>
                        <label className="block text-sm font-bold text-text-main">特別控除額</label>
                    </div>
                    <MoneyInput
                        value={data.beppyo1.specialTaxCredit}
                        onChange={(val) => handleChange('specialTaxCredit', val)}
                        className="input-base w-full font-mono text-lg"
                    />
                </div>

                {/* 中間納付 */}
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded font-bold text-sm">12</span>
                        <label className="block text-sm font-bold text-text-main">中間納付額</label>
                    </div>
                    <MoneyInput
                        value={data.beppyo1.interimPayment}
                        onChange={(val) => handleChange('interimPayment', val)}
                        className="input-base w-full font-mono text-lg"
                    />
                </div>
            </div>

            {/* 確定税額 */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
                {/* ... existing content ... */}
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Calculator size={120} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg font-bold text-lg shadow-lg shadow-primary/30">13</span>
                            <h3 className="text-2xl font-black text-white tracking-tight">差引確定法人税額</h3>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                            (2 - 10 - 12)<br />
                            税額控除および中間納付額を差し引いた、この事業年度の最終的な法人税の納付額です。
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <div className="text-sm font-bold text-primary mb-1 uppercase tracking-widest">Final Tax Due</div>
                        <div className="text-5xl md:text-6xl font-mono font-black text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]">
                            ¥{Math.max(0, finalTaxAmount).toLocaleString()}
                        </div>
                        {finalTaxAmount < 0 && (
                            <div className="mt-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-bold text-sm backdrop-blur-sm">
                                還付金額: ¥{Math.abs(finalTaxAmount).toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 高精度キャリブレーション（印字位置微調整） */}
            <div className="mt-8 bg-surface-highlight/10 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <MousePointer2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                                印字位置の微調整 (PDF Precision Calibration)
                            </h3>
                            <p className="text-xs text-text-muted">
                                公式PDFの個体差によるズレを0.1単位で補正します（一度設定すれば保存されます）
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={resetCalibration}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface-highlight rounded-lg transition-colors border border-border"
                    >
                        <RotateCcw className="w-3 h-3" />
                        リセット
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* 左右調整 (X軸) */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">左右方向 (X-Shift)</label>
                            <span className="text-sm font-mono font-bold text-primary">{(data.calibration?.globalShiftX || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-text-muted">左に移動</span>
                            <input
                                type="range"
                                min="-20"
                                max="20"
                                step="0.5"
                                value={data.calibration?.globalShiftX || 0}
                                onChange={(e) => handleCalibrationChange('globalShiftX', parseFloat(e.target.value))}
                                className="flex-1 accent-primary h-1.5 rounded-lg appearance-none bg-border cursor-pointer"
                            />
                            <span className="text-[10px] text-text-muted">右に移動</span>
                        </div>
                    </div>

                    {/* 上下調整 (Y軸) */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">上下方向 (Y-Shift)</label>
                            <span className="text-sm font-mono font-bold text-primary">{(data.calibration?.globalShiftY || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-text-muted">上に移動</span>
                            <input
                                type="range"
                                min="-20"
                                max="20"
                                step="0.5"
                                value={data.calibration?.globalShiftY || 0}
                                onChange={(e) => handleCalibrationChange('globalShiftY', parseFloat(e.target.value))}
                                className="flex-1 accent-primary h-1.5 rounded-lg appearance-none bg-border cursor-pointer"
                            />
                            <span className="text-[10px] text-text-muted">下に移動</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-start gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-600/80 leading-relaxed">
                        印字が枠のあとに続く場合は「右方向・下方向」に、枠の前に来る場合は「左方向・上方向」にスライダーを動かしてください。
                        一度調整してPDFを出力し、結果を確認しながら微調整を行うのが最も確実です。
                    </p>
                </div>
            </div>
        </div>
    );
};
