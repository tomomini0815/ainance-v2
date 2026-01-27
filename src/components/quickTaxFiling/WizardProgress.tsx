import React, { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
// import { WizardStep } from '../../types/quickTaxFiling'; // Removed unused import

interface Step {
    number: number;
    title: string;
    description: string;
}

interface WizardProgressProps {
    currentStep: number;
    steps?: Step[];
}

const DEFAULT_STEPS = [
    { number: 1, title: '基本情報', description: '氏名・住所など' },
    { number: 2, title: '収入情報', description: '売上・収入源' },
    { number: 3, title: '経費情報', description: 'カテゴリ別経費' },
    { number: 4, title: '減価償却', description: '固定資産の償却' },
    { number: 5, title: '控除情報', description: '各種控除額' },
    { number: 6, title: '確認・生成', description: '内容確認とPDF生成' }
];

const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, steps = DEFAULT_STEPS }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const currentStepIndex = currentStep - 1;
        const currentElement = stepRefs.current[currentStepIndex];

        if (currentElement && scrollContainerRef.current) {
            currentElement.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }, [currentStep]);

    return (
        <div className="mb-8">
            <div
                ref={scrollContainerRef}
                className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible cursor-grab active:cursor-grabbing scrollbar-hide"
            >
                <div className="flex items-center min-w-max md:w-full md:justify-between px-1">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <div
                                ref={(el: HTMLDivElement | null) => { stepRefs.current[index] = el; }}
                                className="flex flex-col items-center px-0.5 md:px-0 md:flex-1"
                            >
                                {/* ステップ番号 */}
                                <div
                                    className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold text-sm md:text-lg transition-all ${step.number < currentStep
                                        ? 'bg-green-500 text-white'
                                        : step.number === currentStep
                                            ? 'bg-primary text-white ring-2 md:ring-4 ring-primary/20'
                                            : 'bg-surface-elevated text-text-muted border-2 border-border'
                                        }`}
                                >
                                    {step.number < currentStep ? (
                                        <Check className="w-4 h-4 md:w-6 md:h-6" />
                                    ) : (
                                        step.number
                                    )}
                                </div>

                                {/* ステップタイトル */}
                                <div className="mt-2 text-center whitespace-nowrap">
                                    <div
                                        className={`text-xs md:text-sm font-medium ${step.number <= currentStep ? 'text-text-main' : 'text-text-muted'
                                            }`}
                                    >
                                        {step.title}
                                    </div>
                                    <div className="text-[10px] md:text-xs text-text-muted mt-0.5 md:mt-1">
                                        {step.description}
                                    </div>
                                </div>
                            </div>

                            {/* 接続線 */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`h-0.5 md:h-1 w-2 md:w-auto md:flex-1 mx-0 md:mx-2 mb-5 md:mb-8 transition-all ${step.number < currentStep
                                        ? 'bg-green-500'
                                        : 'bg-border'
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WizardProgress;
