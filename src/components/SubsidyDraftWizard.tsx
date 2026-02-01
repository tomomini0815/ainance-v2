import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    type SubsidyMatch,
    type BusinessProfile,
    type WizardStep,
    type ApplicationDraft,
    generateWizardSteps,
    generateDraftFromWizard,
} from '../services/subsidyMatchingService';

interface SubsidyDraftWizardProps {
    match: SubsidyMatch;
    profile: BusinessProfile;
    onClose: () => void;
    onComplete: (draft: ApplicationDraft) => void;
}

const SubsidyDraftWizard: React.FC<SubsidyDraftWizardProps> = ({
    match,
    profile,
    onClose,
    onComplete,
}) => {
    const [steps, setSteps] = useState<WizardStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    // 各ステップで生成された下書きを保持
    const [generatedSections, setGeneratedSections] = useState<Record<string, { title: string, content: string }>>({});
    // 現在の表示モード: 'question' | 'draft_preview'
    const [viewMode, setViewMode] = useState<'question' | 'draft_preview'>('question');
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const loadSteps = async () => {
            setIsLoading(true);
            const generatedSteps = await generateWizardSteps(match.subsidy, profile);
            setSteps(generatedSteps);
            setIsLoading(false);
        };
        loadSteps();
    }, [match, profile]);

    const handleOptionSelect = (stepId: string, optionLabel: string) => {
        setAnswers(prev => ({ ...prev, [stepId]: optionLabel }));
    };

    const handleCreateSectionDraft = async () => {
        const currentStep = steps[currentStepIndex];
        const answer = answers[currentStep.id];
        if (!answer) return;

        setIsGenerating(true);
        try {
            const { generateSectionDraft } = await import('../services/subsidyMatchingService');
            // 既存の下書きがあればそれを使う（再生成しない）※ユーザーが「再生成」ボタンを押した場合は別
            if (generatedSections[currentStep.id]) {
                setViewMode('draft_preview');
                setIsGenerating(false);
                return;
            }

            const content = await generateSectionDraft(match.subsidy, profile, currentStep, answer);
            setGeneratedSections(prev => ({
                ...prev,
                [currentStep.id]: {
                    title: currentStep.sectionTitle || currentStep.title,
                    content: content
                }
            }));
            setViewMode('draft_preview');
        } catch (error) {
            console.error('セクション生成エラー:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setViewMode('question'); // 次のステップは質問からスタート
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (viewMode === 'draft_preview') {
            setViewMode('question');
            return;
        }

        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
            // 戻ったときは、そのステップの下書きがすでにあるはずなのでプレビューを表示するか？
            // いや、修正したい場合もあるので質問画面に戻るのが自然か。
            // UX向上のため、戻った場合は常に「質問」モードにする
            setViewMode('question');
        }
    };

    const handleComplete = async () => {
        setIsGenerating(true);
        // すでに全セクション生成済みなので、それを結合するだけ
        // 後方互換性のため generateDraftFromWizard を呼ぶが、引数に生成済みコンテンツを渡す
        const finalDraft = await generateDraftFromWizard(match.subsidy, profile, answers, generatedSections);
        setIsGenerating(false);
        onComplete(finalDraft);
    };

    const currentStep = steps[currentStepIndex];
    const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-surface border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-surface-highlight/30">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-text-main">AI申請ガイド</h2>
                        </div>
                        <p className="text-sm text-text-muted">{match.subsidy.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface-highlight transition-colors text-text-muted"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-border w-full">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>

                <div className="p-8">
                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-text-muted">あなたに合わせた質問を作成中...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStepIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="min-h-[300px]"
                            >
                                {steps.length > 0 ? (
                                    <>
                                        <div className="mb-6">
                                            <span className="text-xs font-bold text-primary tracking-wider uppercase mb-2 block">
                                                Step {currentStepIndex + 1} / {steps.length}
                                            </span>
                                            <h3 className="text-2xl font-bold text-text-main">
                                                {viewMode === 'question' ? currentStep.question : (currentStep.sectionTitle || currentStep.title)}
                                            </h3>
                                        </div>

                                        {viewMode === 'question' ? (
                                            <div className="space-y-3">
                                                {currentStep.options.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => handleOptionSelect(currentStep.id, option.label)}
                                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 group ${answers[currentStep.id] === option.label
                                                            ? 'border-primary bg-primary/5 shadow-md'
                                                            : 'border-border hover:border-primary/50 hover:bg-surface-highlight'
                                                            }`}
                                                    >
                                                        <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 border ${answers[currentStep.id] === option.label
                                                            ? 'bg-primary border-primary text-white'
                                                            : 'bg-background border-border text-transparent group-hover:border-primary/50'
                                                            }`}>
                                                            <Check className="w-3 h-3" strokeWidth={3} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-text-main mb-1 group-hover:text-primary transition-colors">
                                                                {option.label}
                                                            </div>
                                                            {option.description && (
                                                                <p className="text-sm text-text-muted leading-relaxed">
                                                                    {option.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}

                                                {currentStep.allowCustom && (
                                                    <div className="mt-4 pt-4 border-t border-border">
                                                        <label className="block text-sm font-medium text-text-muted mb-2">その他（自由入力）</label>
                                                        <textarea
                                                            className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-text-main text-sm"
                                                            placeholder="具体的な内容を記入してください"
                                                            rows={2}
                                                            value={answers[currentStep.id]?.startsWith('CUSTOM:') ? answers[currentStep.id].replace('CUSTOM:', '') : ''}
                                                            onChange={(e) => handleOptionSelect(currentStep.id, `CUSTOM:${e.target.value}`)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-surface-highlight rounded-xl p-4 border border-border animate-in fade-in slide-in-from-bottom-2">
                                                <div className="flex items-center justify-between mb-3 text-sm text-text-muted">
                                                    <span>AI生成ドラフト</span>
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">編集可能</span>
                                                </div>
                                                <textarea
                                                    className="w-full bg-transparent border-none p-0 text-text-main leading-relaxed focus:ring-0 resize-none min-h-[200px]"
                                                    value={generatedSections[currentStep.id]?.content || ''}
                                                    onChange={(e) => {
                                                        const newContent = e.target.value;
                                                        setGeneratedSections(prev => ({
                                                            ...prev,
                                                            [currentStep.id]: {
                                                                ...prev[currentStep.id],
                                                                content: newContent
                                                            }
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-20 text-center">
                                        <p className="text-text-muted">質問を読み込めませんでした。もう一度お試しください。</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-surface-highlight/30 border-t border-border flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStepIndex === 0 || isGenerating}
                        className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-text-main disabled:opacity-30 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        戻る
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-1.5 text-text-muted">
                            <Info className="w-4 h-4" />
                            <span className="text-xs">
                                {viewMode === 'question' ? '回答を選ぶと下書きが生成されます' : '内容は自由に編集できます'}
                            </span>
                        </div>

                        {viewMode === 'question' ? (
                            <button
                                onClick={handleCreateSectionDraft}
                                disabled={!answers[currentStep?.id] || isGenerating}
                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        生成中...
                                    </>
                                ) : (
                                    <>
                                        ドラフトを作成
                                        <Sparkles className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={isGenerating}
                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        処理中...
                                    </>
                                ) : currentStepIndex === steps.length - 1 ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        完了する
                                    </>
                                ) : (
                                    <>
                                        次の項目へ
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SubsidyDraftWizard;
