import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    JapaneseYen,
    TrendingUp,
    FileText,
    Download,
    Sparkles,
    CheckCircle,
    Clock,
    X,
    Info,
    Trophy,
    Lightbulb,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBusinessType } from '../hooks/useBusinessType';
import { useTransactions } from '../hooks/useTransactions';
import {
    fetchSubsidies,
    matchSubsidies,
    generateApplicationDraft,
    getDaysUntilDeadline,
    getDeadlineUrgency,
    type SubsidyMatch,
    type BusinessProfile,
    type ApplicationDraft,
} from '../services/subsidyMatchingService';
import { generateSubsidyApplicationPDF } from '../services/pdfJapaneseService';
import SubsidyDraftWizard from '../components/SubsidyDraftWizard';

const SubsidyMatching: React.FC = () => {
    const { user } = useAuth();
    const userId = user?.id; // 固定のアクセスのために
    const { currentBusinessType } = useBusinessType(user?.id);
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);

    const [matches, setMatches] = useState<SubsidyMatch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSubsidy, setSelectedSubsidy] = useState<SubsidyMatch | null>(null);
    const [applicationDraft, setApplicationDraft] = useState<ApplicationDraft | null>(null);
    const [showDraftWizard, setShowDraftWizard] = useState(false);
    const [selectedSubsidyForWizard, setSelectedSubsidyForWizard] = useState<SubsidyMatch | null>(null);
    const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
    const [isDraftCompleted, setIsDraftCompleted] = useState(false);

    // 事業プロフィールを生成
    const generateBusinessProfile = (): BusinessProfile => {
        const totalRevenue = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);

        return {
            businessType: currentBusinessType?.business_type === 'corporation' ? 'corporation' : 'sole_proprietor',
            industry: 'IT', // TODO: ユーザー設定から取得
            revenue: totalRevenue,
            employeeCount: 5, // TODO: ユーザー設定から取得
            region: '東京都', // TODO: ユーザー設定から取得
            establishedYear: 2020, // TODO: ユーザー設定から取得
        };
    };

    // 初期データ読み込み
    useEffect(() => {
        if (currentBusinessType) {
            loadSubsidies();
        }
    }, [currentBusinessType?.business_type, userId]);

    const loadSubsidies = async () => {
        if (isLoading) return;
        setIsLoading(true);
        console.log('SubsidyMatching: 補助金データの読み込みを開始します...');
        try {
            const subsidyData = await fetchSubsidies();
            console.log('SubsidyMatching: 取得した補助金データ:', subsidyData.length, '件');

            // マッチング実行
            const profile = generateBusinessProfile();
            console.log('SubsidyMatching: 生成したビジネスプロフィール:', profile);

            const matchedSubsidies = await matchSubsidies(profile, subsidyData);
            console.log('SubsidyMatching: マッチング結果:', matchedSubsidies.length, '件');
            setMatches(matchedSubsidies);
        } catch (error) {
            console.error('SubsidyMatching: 補助金データ読み込みエラー:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleGenerateGuide = async (match: SubsidyMatch) => {
        setIsGeneratingGuide(true);
        setSelectedSubsidy(match);
        setIsDraftCompleted(false);
        try {
            const guide = await generateApplicationDraft(match.subsidy, generateBusinessProfile());
            setApplicationDraft(guide);
        } catch (error) {
            console.error('ガイド生成エラー:', error);
        } finally {
            setIsGeneratingGuide(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!applicationDraft) return;

        try {
            const pdfBytes = await generateSubsidyApplicationPDF(applicationDraft);
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `補助金申請書_${applicationDraft.subsidyName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF生成エラー:', error);
            alert('PDFの生成中にエラーが発生しました。');
        }
    };

    const getUrgencyColor = (urgency: 'urgent' | 'soon' | 'normal') => {
        switch (urgency) {
            case 'urgent':
                return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'soon':
                return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            default:
                return 'text-green-500 bg-green-500/10 border-green-500/20';
        }
    };

    const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
        switch (difficulty) {
            case 'easy':
                return 'text-green-500 bg-green-500/10';
            case 'medium':
                return 'text-yellow-500 bg-yellow-500/10';
            case 'hard':
                return 'text-red-500 bg-red-500/10';
        }
    };

    return (
        <div className="bg-background min-h-full p-4 sm:p-0">
            <div className="mx-auto">
                {/* ヘッダー */}
                <div className="flex items-center mb-6">
                    <Link to="/dashboard" className="mr-4">
                        <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-text-main">補助金マッチング</h1>
                        <p className="text-text-muted">あなたに最適な補助金をAIが提案</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-text-muted">補助金を検索中...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* サマリーカード */}
                        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-2.5 sm:p-4 border border-blue-500/20">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] sm:text-xs font-medium text-text-muted">マッチ</span>
                                    <Search className="w-3.5 h-3.5 sm:w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-lg sm:text-2xl font-bold text-text-main">{matches.length}</p>
                                    <span className="text-[9px] sm:text-xs text-text-muted">件</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-2.5 sm:p-4 border border-green-500/20">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] sm:text-xs font-medium text-text-muted">推定総額</span>
                                    <JapaneseYen className="w-3.5 h-3.5 sm:w-4 h-4 text-green-500" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-lg sm:text-2xl font-bold text-text-main">
                                        ¥{Math.round(matches.reduce((sum, m) => sum + m.estimatedAmount, 0) / 10000).toLocaleString()}
                                    </p>
                                    <span className="text-[9px] sm:text-xs text-text-muted">万円相当</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-2.5 sm:p-4 border border-purple-500/20">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] sm:text-xs font-medium text-text-muted">高マッチ</span>
                                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 h-4 text-purple-500" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-lg sm:text-2xl font-bold text-text-main">
                                        {matches.filter(m => m.matchScore >= 70).length}
                                    </p>
                                    <span className="text-[9px] sm:text-xs text-text-muted">件</span>
                                </div>
                            </div>
                        </div>

                        {/* 補助金一覧 */}
                        <div className="space-y-4">
                            {matches.map((match) => {
                                const daysUntil = getDaysUntilDeadline(match.subsidy.deadline);
                                const urgency = getDeadlineUrgency(match.subsidy.deadline);

                                return (
                                    <div
                                        key={match.subsidy.id}
                                        className="bg-surface rounded-xl shadow-sm border border-border p-3 sm:p-6 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-text-main">{match.subsidy.name}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${match.matchScore >= 80 ? 'bg-green-500/20 text-green-500' :
                                                        match.matchScore >= 60 ? 'bg-blue-500/20 text-blue-500' :
                                                            'bg-gray-500/20 text-gray-500'
                                                        }`}>
                                                        マッチ度 {match.matchScore}%
                                                    </span>
                                                </div>
                                                <p className="text-sm text-text-muted mb-3">{match.subsidy.description}</p>

                                                {/* マッチ理由 */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {match.matchReasons.map((reason, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg"
                                                        >
                                                            ✓ {reason}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* 詳細情報 */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs text-text-muted mb-1">推定受給額</p>
                                                        <p className="text-sm font-bold text-green-500">
                                                            ¥{match.estimatedAmount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-text-muted mb-1">申請難易度</p>
                                                        <p className={`text-sm font-bold px-2 py-1 rounded inline-block ${getDifficultyColor(match.applicationDifficulty)}`}>
                                                            {match.applicationDifficulty === 'easy' ? '易' :
                                                                match.applicationDifficulty === 'medium' ? '中' : '難'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-text-muted mb-1">採択確率</p>
                                                        <p className="text-sm font-bold text-purple-500">
                                                            {match.adoptionProbability.toFixed(0)}%
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-text-muted mb-1">申請期限</p>
                                                        <p className={`text-sm font-bold px-2 py-1 rounded inline-block border ${getUrgencyColor(urgency)}`}>
                                                            残り{daysUntil}日
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* 必要書類 */}
                                                <div className="mb-4">
                                                    <p className="text-xs text-text-muted mb-2">必要書類:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {match.subsidy.requiredDocuments.map((doc, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-surface-highlight text-text-main text-xs rounded border border-border"
                                                            >
                                                                <FileText className="w-3 h-3 inline mr-1" />
                                                                {doc}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* アクションボタン */}
                                        <div className="flex flex-wrap gap-2 sm:gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedSubsidyForWizard(match);
                                                    setShowDraftWizard(true);
                                                }}
                                                className="btn-primary flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm py-1.5 sm:py-2.5 whitespace-nowrap"
                                            >
                                                <Sparkles className="w-3 h-3 sm:w-4 h-4" />
                                                申請書作成
                                            </button>
                                            <button
                                                onClick={() => handleGenerateGuide(match)}
                                                disabled={isGeneratingGuide}
                                                className="btn-ghost flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm py-1.5 sm:py-2.5 whitespace-nowrap border-primary/30 text-primary hover:bg-primary/5"
                                            >
                                                {isGeneratingGuide && selectedSubsidy?.subsidy.id === match.subsidy.id ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                                ) : (
                                                    <Info className="w-3 h-3 sm:w-4 h-4" />
                                                )}
                                                申請ガイド
                                            </button>
                                            <a
                                                href={match.subsidy.applicationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-ghost flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm py-1.5 sm:py-2.5 whitespace-nowrap border-border text-text-muted hover:text-text-main border"
                                            >
                                                <Download className="w-3 h-3 sm:w-4 h-4" />
                                                公式サイト
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}

                            {matches.length === 0 && !isLoading && (
                                <div className="text-center py-20 bg-surface rounded-2xl border border-border border-dashed">
                                    <div className="bg-surface-highlight w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-text-muted opacity-20" />
                                    </div>
                                    <h3 className="text-lg font-bold text-text-main mb-2">該当する補助金が見つかりませんでした</h3>
                                    <p className="text-sm text-text-muted">条件を変更して再度お試しください</p>
                                </div>
                            )}
                        </div>

                        {/* 申請書下書きモーダル */}
                        {applicationDraft && selectedSubsidy && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                                <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-text-main">
                                                    {isDraftCompleted ? 'AI申請書下書き' : 'AI申請概要ガイド'}
                                                </h2>
                                                <p className="text-text-muted mt-1">{applicationDraft.subsidyName}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setApplicationDraft(null);
                                                    setSelectedSubsidy(null);
                                                }}
                                                className="p-2 rounded-lg hover:bg-surface-highlight transition-colors text-text-muted"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* 所要時間 */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-5 h-5 text-blue-500" />
                                                    <span className="text-sm font-medium text-text-main">
                                                        推定作成時間: {applicationDraft.estimatedCompletionTime}
                                                    </span>
                                                </div>
                                            </div>

                                            {applicationDraft.strategicSummary && (
                                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Trophy className="w-5 h-5 text-amber-500" />
                                                        <span className="text-sm font-bold text-amber-700">
                                                            採択率向上の戦略ポイント
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-amber-800 leading-tight">
                                                        {applicationDraft.strategicSummary}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {applicationDraft.strategicAdvice && applicationDraft.strategicAdvice.length > 0 && (
                                            <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-4 mb-6">
                                                <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1">
                                                    <Lightbulb className="w-3 h-3" />
                                                    さらに採択率を上げるためのアドバイス
                                                </h4>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                                                    {applicationDraft.strategicAdvice.map((advice, idx) => (
                                                        <li key={idx} className="text-[11px] text-amber-800 flex items-start gap-2">
                                                            <span className="text-amber-500 mt-1">★</span>
                                                            <span>{advice}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* セクション */}
                                        <div className="space-y-6 mb-6">
                                            {applicationDraft.sections.map((section, index) => (
                                                <div key={index} className="border border-border rounded-lg p-4 bg-background">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-lg font-bold text-text-main">{section.title}</h3>
                                                        <Sparkles className={`w-4 h-4 ${isDraftCompleted ? 'text-primary' : 'text-blue-500'} opacity-50`} />
                                                    </div>
                                                    <div className={`rounded-lg p-4 mb-3 border ${isDraftCompleted ? 'bg-surface-highlight border-border/50' : 'bg-blue-500/5 border-blue-500/10'}`}>
                                                        {isDraftCompleted ? (
                                                            <textarea
                                                                className="w-full bg-transparent text-sm text-text-main leading-relaxed border-none focus:ring-0 p-0 resize-none overflow-hidden"
                                                                value={section.content}
                                                                rows={Math.max(3, section.content.split('\n').length)}
                                                                onChange={(e) => {
                                                                    if (!applicationDraft) return;
                                                                    const newSections = [...applicationDraft.sections];
                                                                    newSections[index] = { ...section, content: e.target.value };
                                                                    setApplicationDraft({ ...applicationDraft, sections: newSections });
                                                                }}
                                                            />
                                                        ) : (
                                                            <p className="text-sm text-text-main whitespace-pre-wrap leading-relaxed">
                                                                {section.content}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {section.tips.length > 0 && (
                                                        <div className="space-y-2 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                                                            <p className="text-xs font-medium text-blue-500 flex items-center gap-1">
                                                                <Info className="w-3 h-3" />
                                                                記入のアドバイス:
                                                            </p>
                                                            <ul className="space-y-1">
                                                                {section.tips.map((tip, idx) => (
                                                                    <li key={idx} className="text-[11px] text-text-muted flex items-start gap-2">
                                                                        <span className="text-primary mt-1">•</span>
                                                                        <span>{tip}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* チェックリスト */}
                                        <div className="border border-border rounded-lg p-4 mb-6">
                                            <h3 className="text-lg font-bold text-text-main mb-3">提出前チェックリスト</h3>
                                            <ul className="space-y-2">
                                                {applicationDraft.checklist.map((item, index) => (
                                                    <li key={index} className="flex items-start gap-2 text-sm text-text-muted">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* アクション */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleDownloadPDF}
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                PDFで保存
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setApplicationDraft(null);
                                                    setSelectedSubsidy(null);
                                                }}
                                                className="btn-ghost"
                                            >
                                                閉じる
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 下書きウィザード */}
                        {showDraftWizard && selectedSubsidyForWizard && (
                            <SubsidyDraftWizard
                                match={selectedSubsidyForWizard}
                                profile={generateBusinessProfile()}
                                onClose={() => {
                                    setShowDraftWizard(false);
                                    setSelectedSubsidyForWizard(null);
                                }}
                                onComplete={(draft) => {
                                    setApplicationDraft(draft);
                                    setSelectedSubsidy(selectedSubsidyForWizard);
                                    setIsDraftCompleted(true);
                                    setShowDraftWizard(false);
                                    setSelectedSubsidyForWizard(null);
                                }}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SubsidyMatching;
