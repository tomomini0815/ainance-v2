import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    DollarSign,
    TrendingUp,
    FileText,
    Download,
    Sparkles,
    AlertCircle,
    CheckCircle,
    Clock,
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
    type Subsidy,
    type SubsidyMatch,
    type BusinessProfile,
    type ApplicationDraft,
} from '../services/subsidyMatchingService';

const SubsidyMatching: React.FC = () => {
    const { user } = useAuth();
    const { currentBusinessType } = useBusinessType(user?.id);
    const { transactions } = useTransactions(user?.id, currentBusinessType?.business_type);

    const [matches, setMatches] = useState<SubsidyMatch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSubsidy, setSelectedSubsidy] = useState<SubsidyMatch | null>(null);
    const [applicationDraft, setApplicationDraft] = useState<ApplicationDraft | null>(null);
    const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

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
        loadSubsidies();
    }, []);

    const loadSubsidies = async () => {
        setIsLoading(true);
        try {
            const subsidyData = await fetchSubsidies();

            // マッチング実行
            const profile = generateBusinessProfile();
            const matchedSubsidies = await matchSubsidies(profile, subsidyData);
            setMatches(matchedSubsidies);
        } catch (error) {
            console.error('補助金データ読み込みエラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateDraft = async (match: SubsidyMatch) => {
        setIsGeneratingDraft(true);
        try {
            const profile = generateBusinessProfile();
            const draft = await generateApplicationDraft(match.subsidy, profile);
            setApplicationDraft(draft);
            setSelectedSubsidy(match);
        } catch (error) {
            console.error('申請書下書き生成エラー:', error);
        } finally {
            setIsGeneratingDraft(false);
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
        <div className="min-h-screen bg-background">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* ヘッダー */}
                <div className="flex items-center mb-6">
                    <Link to="/dashboard" className="mr-4">
                        <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-text-main">補助金マッチング</h1>
                        <p className="text-text-muted mt-1">あなたに最適な補助金をAIが提案</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-text-muted">マッチした補助金</span>
                                    <Search className="w-5 h-5 text-blue-500" />
                                </div>
                                <p className="text-3xl font-bold text-text-main">{matches.length}</p>
                                <p className="text-xs text-text-muted mt-1">件</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-text-muted">推定受給額</span>
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-3xl font-bold text-text-main">
                                    ¥{matches.reduce((sum, m) => sum + m.estimatedAmount, 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-text-muted mt-1">合計</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-text-muted">高マッチ度</span>
                                    <TrendingUp className="w-5 h-5 text-purple-500" />
                                </div>
                                <p className="text-3xl font-bold text-text-main">
                                    {matches.filter(m => m.matchScore >= 70).length}
                                </p>
                                <p className="text-xs text-text-muted mt-1">件（70%以上）</p>
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
                                        className="bg-surface rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all"
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
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleGenerateDraft(match)}
                                                disabled={isGeneratingDraft}
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                AI申請書下書き生成
                                            </button>
                                            <a
                                                href={match.subsidy.applicationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-ghost flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                公式サイト
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 申請書下書きモーダル */}
                        {applicationDraft && selectedSubsidy && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                                <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-text-main">AI申請書下書き</h2>
                                                <p className="text-text-muted mt-1">{applicationDraft.subsidyName}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setApplicationDraft(null);
                                                    setSelectedSubsidy(null);
                                                }}
                                                className="p-2 rounded-lg hover:bg-surface-highlight transition-colors"
                                            >
                                                <AlertCircle className="w-5 h-5 text-text-muted" />
                                            </button>
                                        </div>

                                        {/* 所要時間 */}
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-blue-500" />
                                                <span className="text-sm font-medium text-text-main">
                                                    推定作成時間: {applicationDraft.estimatedCompletionTime}
                                                </span>
                                            </div>
                                        </div>

                                        {/* セクション */}
                                        <div className="space-y-6 mb-6">
                                            {applicationDraft.sections.map((section, index) => (
                                                <div key={index} className="border border-border rounded-lg p-4">
                                                    <h3 className="text-lg font-bold text-text-main mb-3">{section.title}</h3>
                                                    <div className="bg-surface-highlight rounded-lg p-4 mb-3">
                                                        <p className="text-sm text-text-main whitespace-pre-wrap">{section.content}</p>
                                                    </div>
                                                    {section.tips.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-medium text-text-muted">💡 記入のコツ:</p>
                                                            <ul className="space-y-1">
                                                                {section.tips.map((tip, idx) => (
                                                                    <li key={idx} className="text-xs text-text-muted flex items-start gap-2">
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
                                                onClick={() => {
                                                    // TODO: PDFダウンロード機能
                                                    alert('PDF出力機能は開発中です');
                                                }}
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
                    </>
                )}
            </main>
        </div>
    );
};

export default SubsidyMatching;
