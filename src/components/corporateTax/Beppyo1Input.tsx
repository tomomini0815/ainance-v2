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

    const finalNationalTax = data.beppyo1.corporateTaxAmount - data.beppyo1.specialTaxCredit - data.beppyo1.nationalInterimPayment;

    return (
        <div className="space-y-8">
            {/* National Tax Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    国税（法人税・地方法人税）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-slate-800 text-white rounded font-bold text-xs">1</span>
                            <label className="block text-xs font-bold text-text-main">法人税 課税標準額</label>
                        </div>
                        <MoneyInput
                            value={data.beppyo1.taxableIncome}
                            onChange={(val) => handleChange('taxableIncome', val)}
                            className="input-base w-full font-mono text-base"
                        />
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-slate-800 text-white rounded font-bold text-xs">2</span>
                            <label className="block text-xs font-bold text-text-main">法人税 算出税額</label>
                        </div>
                        <MoneyInput
                            value={data.beppyo1.corporateTaxAmount}
                            onChange={(val) => handleChange('corporateTaxAmount', val)}
                            className="input-base w-full font-mono text-base"
                        />
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-slate-800 text-white rounded font-bold text-xs">10</span>
                            <label className="block text-xs font-bold text-text-main">法人税 税額控除額</label>
                        </div>
                        <MoneyInput
                            value={data.beppyo1.specialTaxCredit}
                            onChange={(val) => handleChange('specialTaxCredit', val)}
                            className="input-base w-full font-mono text-base"
                        />
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded font-bold text-xs">12</span>
                            <label className="block text-xs font-bold text-text-main font-bold text-blue-600">法人税 中間納付額</label>
                        </div>
                        <MoneyInput
                            value={data.beppyo1.nationalInterimPayment}
                            onChange={(val) => handleChange('nationalInterimPayment', val)}
                            className="input-base w-full font-mono text-base border-blue-200 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm bg-slate-50/50">
                        <label className="block text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">地方法人税 算出税額 (法人税×10.3%)</label>
                        <MoneyInput
                            value={data.beppyo1.localCorporateTaxAmount}
                            onChange={(val) => handleChange('localCorporateTaxAmount', val)}
                            className="input-base w-full font-mono text-base bg-transparent"
                        />
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm border-l-4 border-l-blue-500">
                        <label className="block text-xs font-bold text-blue-600 mb-3 uppercase tracking-wider">地方法人税 中間納付額</label>
                        <MoneyInput
                            value={data.beppyo1.localInterimPayment}
                            onChange={(val) => handleChange('localInterimPayment', val)}
                            className="input-base w-full font-mono text-base border-blue-200 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Inhabitant & Enterprise Tax Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    地方税（住民税・事業税）
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <label className="block text-xs font-bold text-text-main mb-3">法人住民税（都道府県・市区町村）</label>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-text-muted w-12">県民税:</span>
                                <MoneyInput
                                    value={data.beppyo1.prefecturalTax}
                                    onChange={(val) => handleChange('prefecturalTax', val)}
                                    className="input-base flex-1 font-mono text-sm py-1"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-text-muted w-12">市民税:</span>
                                <MoneyInput
                                    value={data.beppyo1.municipalTax}
                                    onChange={(val) => handleChange('municipalTax', val)}
                                    className="input-base flex-1 font-mono text-sm py-1"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <label className="block text-xs font-bold text-text-main mb-3">法人事業税</label>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-text-muted w-12">事業税:</span>
                                <MoneyInput
                                    value={data.beppyo1.enterpriseTax}
                                    onChange={(val) => handleChange('enterpriseTax', val)}
                                    className="input-base flex-1 font-mono text-sm py-1"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-text-muted w-12">特例分:</span>
                                <MoneyInput
                                    value={data.beppyo1.specialLocalEnterpriseTax}
                                    onChange={(val) => handleChange('specialLocalEnterpriseTax', val)}
                                    className="input-base flex-1 font-mono text-sm py-1"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm border-l-4 border-l-blue-500">
                        <label className="block text-xs font-bold text-blue-600 mb-3">地方税 中間納付合計</label>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-text-muted w-12">住民税:</span>
                                <MoneyInput
                                    value={data.beppyo1.inhabitantInterimPayment}
                                    onChange={(val) => handleChange('inhabitantInterimPayment', val)}
                                    className="input-base flex-1 font-mono text-sm py-1 border-blue-100"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-text-muted w-12">事業税:</span>
                                <MoneyInput
                                    value={data.beppyo1.enterpriseInterimPayment}
                                    onChange={(val) => handleChange('enterpriseInterimPayment', val)}
                                    className="input-base flex-1 font-mono text-sm py-1 border-blue-100"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 確定税額 (法人税のみ) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <Calculator size={120} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg font-bold text-lg shadow-lg shadow-primary/30">13</span>
                            <h3 className="text-2xl font-black text-white tracking-tight">差引所得に対する法人税額</h3>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                            (2 - 10 - 12)<br />
                            税額控除および中間納付額を差し引いた、国に納めるべき確定申告額です。
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <div className="text-sm font-bold text-primary mb-1 uppercase tracking-widest">Final National Tax Due</div>
                        <div className="text-5xl md:text-6xl font-mono font-black text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]">
                            ¥{Math.max(0, finalNationalTax).toLocaleString()}
                        </div>
                        {finalNationalTax < 0 && (
                            <div className="mt-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-bold text-sm backdrop-blur-sm">
                                確定還付税額: ¥{Math.abs(finalNationalTax).toLocaleString()}
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
                                min="-100"
                                max="100"
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
                                min="-100"
                                max="100"
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
