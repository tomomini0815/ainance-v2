import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import WizardProgress from '../components/quickTaxFiling/WizardProgress';
import Step1BasicInfo from '../components/quickTaxFiling/Step1BasicInfo';
import Step2Income from '../components/quickTaxFiling/Step2Income';
import Step3Expenses from '../components/quickTaxFiling/Step3Expenses';
import StepDepreciation from '../components/quickTaxFiling/StepDepreciation';
import Step4Deductions from '../components/quickTaxFiling/Step4Deductions';
import Step5Confirmation from '../components/quickTaxFiling/Step5Confirmation';
import {
    QuickTaxFilingData,
    WizardStep,
    BasicInfo,
    IncomeInfo,
    ExpensesInfo,
    DeductionsInfo
} from '../types/quickTaxFiling';
import {
    saveQuickTaxFilingData,
    loadQuickTaxFilingData,
    clearQuickTaxFilingData
} from '../services/quickTaxFilingService';

const QuickTaxFilingPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);
    const [data, setData] = useState<QuickTaxFilingData>({
        basicInfo: {
            name: '',
            address: '',
            myNumber: '',
            businessType: '',
            filingType: 'blue'
        },
        income: {
            totalRevenue: 0,
            sources: []
        },
        expenses: {
            supplies: 0,
            communication: 0,
            transportation: 0,
            entertainment: 0,
            rent: 0,
            utilities: 0,
            other: 0
        },
        depreciation: 0,
        deductions: {
            socialInsurance: 0,
            lifeInsurance: 0,
            earthquakeInsurance: 0,
            medicalExpenses: 0,
            donations: 0,
            dependents: 0
        }
    });

    // ユーザーIDがない場合はログインページにリダイレクト
    useEffect(() => {
        if (!user?.id) {
            navigate('/login');
        }
    }, [user, navigate]);

    // 保存されたデータを読み込み
    useEffect(() => {
        if (user?.id) {
            const savedData = loadQuickTaxFilingData(user.id);
            if (savedData) {
                setData(savedData);
            }
        }
    }, [user]);

    // データ変更時に自動保存
    useEffect(() => {
        if (user?.id) {
            saveQuickTaxFilingData(user.id, data);
        }
    }, [data, user]);

    const handleBasicInfoChange = (basicInfo: BasicInfo) => {
        setData({ ...data, basicInfo });
    };

    const handleIncomeChange = (income: IncomeInfo) => {
        setData({ ...data, income });
    };

    const handleExpensesChange = (expenses: ExpensesInfo) => {
        setData({ ...data, expenses });
    };

    const handleDepreciationChange = (depreciation: number) => {
        setData({ ...data, depreciation });
    };

    const handleDeductionsChange = (deductions: DeductionsInfo) => {
        setData({ ...data, deductions });
    };

    const handleNext = () => {
        setCurrentStep((prev) => Math.min(6, prev + 1) as WizardStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1) as WizardStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleComplete = () => {
        if (user?.id) {
            clearQuickTaxFilingData(user.id);
        }
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {/* ヘッダー */}
                <div className="flex items-center mb-6">
                    <Link to="/dashboard" className="mr-3 sm:mr-4">
                        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-text-muted hover:text-text-main" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Zap className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-text-main">駆け込み確定申告</h1>
                                <p className="text-xs sm:text-sm text-text-muted mt-0.5">質問に答えるだけで、1日で確定申告書類を完成</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 進捗バー */}
                <WizardProgress currentStep={currentStep} />

                {/* ステップコンテンツ */}
                <div className="bg-surface rounded-xl shadow-sm border border-border p-4 sm:p-8 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentStep === 1 && (
                                <Step1BasicInfo
                                    data={data.basicInfo}
                                    onChange={handleBasicInfoChange}
                                    onNext={handleNext}
                                />
                            )}
                            {currentStep === 2 && (
                                <Step2Income
                                    data={data.income}
                                    onChange={handleIncomeChange}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                />
                            )}
                            {currentStep === 3 && (
                                <Step3Expenses
                                    data={data.expenses}
                                    businessType={data.basicInfo.businessType}
                                    totalRevenue={data.income.totalRevenue}
                                    onChange={handleExpensesChange}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                />
                            )}
                            {currentStep === 4 && (
                                <StepDepreciation
                                    onChange={handleDepreciationChange}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                />
                            )}
                            {currentStep === 5 && (
                                <Step4Deductions
                                    data={data.deductions}
                                    onChange={handleDeductionsChange}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                />
                            )}
                            {currentStep === 6 && (
                                <Step5Confirmation
                                    data={data}
                                    onBack={handleBack}
                                    onComplete={handleComplete}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* フッター情報 */}
                <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-text-muted">
                    <p>入力内容は自動的に保存されます。いつでも中断・再開できます。</p>
                </div>
            </main>
        </div>
    );
};

export default QuickTaxFilingPage;
