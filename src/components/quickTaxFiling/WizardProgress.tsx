import React from 'react';
import { Check } from 'lucide-react';
import { WizardStep } from '../../types/quickTaxFiling';

interface WizardProgressProps {
    currentStep: WizardStep;
}

const steps = [
    { number: 1, title: '基本情報', description: '氏名・住所など' },
    { number: 2, title: '収入情報', description: '売上・収入源' },
    { number: 3, title: '経費情報', description: 'カテゴリ別経費' },
    { number: 4, title: '控除情報', description: '各種控除額' },
    { number: 5, title: '確認・生成', description: '内容確認とPDF生成' }
];

const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        <div className="flex flex-col items-center flex-1">
                            {/* ステップ番号 */}
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${step.number < currentStep
                                        ? 'bg-green-500 text-white'
                                        : step.number === currentStep
                                            ? 'bg-primary text-white ring-4 ring-primary/20'
                                            : 'bg-surface-elevated text-text-muted border-2 border-border'
                                    }`}
                            >
                                {step.number < currentStep ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    step.number
                                )}
                            </div>

                            {/* ステップタイトル */}
                            <div className="mt-2 text-center">
                                <div
                                    className={`text-sm font-medium ${step.number <= currentStep ? 'text-text-main' : 'text-text-muted'
                                        }`}
                                >
                                    {step.title}
                                </div>
                                <div className="text-xs text-text-muted mt-1">
                                    {step.description}
                                </div>
                            </div>
                        </div>

                        {/* 接続線 */}
                        {index < steps.length - 1 && (
                            <div
                                className={`h-1 flex-1 mx-2 mb-8 transition-all ${step.number < currentStep
                                        ? 'bg-green-500'
                                        : 'bg-border'
                                    }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default WizardProgress;
