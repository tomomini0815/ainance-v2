import React from 'react';
import { Calculator, ArrowRight, ArrowLeft } from 'lucide-react';
import DepreciationCalculator from '../DepreciationCalculator';

interface StepDepreciationProps {
    onNext: () => void;
    onBack: () => void;
    onChange: (amount: number) => void;
}

const StepDepreciation: React.FC<StepDepreciationProps> = ({
    onNext,
    onBack,
    onChange
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-text-main">減価償却の入力</h2>
                    <p className="text-sm text-text-muted">10万円〜30万円以上の資産がある場合はこちらに入力してください</p>
                </div>
            </div>

            <div className="border border-border rounded-xl p-6 bg-surface-highlight/20">
                <DepreciationCalculator
                    onCalculate={(total) => onChange(total)}
                    initialAssets={[]} // TODO: Handle persistence if needed
                />
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 text-text-muted hover:text-text-main transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    前のステップへ
                </button>
                <button
                    onClick={onNext}
                    className="btn-primary"
                >
                    次へ進む
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default StepDepreciation;
