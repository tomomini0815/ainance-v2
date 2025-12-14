import React from 'react';
import { Brain, Sparkles, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { isAIEnabled, getAIStatus } from '../services/geminiAIService';

interface AIStatusBadgeProps {
    showDetails?: boolean;
    className?: string;
}

/**
 * AI機能の有効/無効状態を表示するバッジ
 */
export const AIStatusBadge: React.FC<AIStatusBadgeProps> = ({
    showDetails = false,
    className = ''
}) => {
    const status = getAIStatus();
    const enabled = isAIEnabled();

    if (!showDetails) {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${enabled
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                } ${className}`}>
                {enabled ? (
                    <>
                        <Sparkles className="w-3 h-3" />
                        <span>AI有効</span>
                    </>
                ) : (
                    <>
                        <Brain className="w-3 h-3" />
                        <span>ルールベース</span>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-xl border ${enabled
                ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30'
                : 'bg-gray-800/50 border-gray-700'
            } ${className}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${enabled ? 'bg-purple-500/20' : 'bg-gray-700'}`}>
                    {enabled ? (
                        <Sparkles className="w-5 h-5 text-purple-400" />
                    ) : (
                        <Brain className="w-5 h-5 text-gray-400" />
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">
                        {enabled ? 'AI分析 有効' : 'ルールベース分析'}
                    </h3>
                    <p className="text-xs text-gray-400">
                        {enabled ? `${status.provider} (${status.model})` : 'キーワードマッチング'}
                    </p>
                </div>
                {enabled ? (
                    <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-400 ml-auto" />
                )}
            </div>

            {enabled && (
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-300">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span>高精度レシート分析</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span>自動勘定科目分類</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span>異常検知・アドバイス</span>
                    </div>
                </div>
            )}

            {!enabled && (
                <p className="text-xs text-gray-400 mt-2">
                    AIを有効にするには、.envにGemini API Keyを設定してください
                </p>
            )}
        </div>
    );
};

/**
 * AI処理中のローディング表示
 */
export const AIProcessingIndicator: React.FC<{ message?: string }> = ({
    message = 'AI分析中...'
}) => {
    return (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/30">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/50 border-t-transparent animate-spin" />
            </div>
            <div>
                <p className="text-sm font-medium text-white">{message}</p>
                <p className="text-xs text-gray-400">Gemini AIが処理しています</p>
            </div>
        </div>
    );
};

/**
 * AI分析結果の表示
 */
export const AIAnalysisResult: React.FC<{
    category: string;
    accountTitle: string;
    confidence: number;
    reasoning: string;
    taxDeductible: boolean;
    suggestions?: string[];
    usedAI: boolean;
}> = ({ category, accountTitle, confidence, reasoning, taxDeductible, suggestions, usedAI }) => {
    const confidenceColor = confidence >= 0.8 ? 'text-green-400' :
        confidence >= 0.6 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className={`p-4 rounded-xl border ${usedAI
                ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30'
                : 'bg-gray-800/50 border-gray-700'
            }`}>
            <div className="flex items-center gap-2 mb-3">
                {usedAI ? (
                    <Sparkles className="w-4 h-4 text-purple-400" />
                ) : (
                    <Brain className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs font-medium text-gray-400">
                    {usedAI ? 'Gemini AI分析' : 'ルールベース分析'}
                </span>
                <span className={`ml-auto text-xs font-bold ${confidenceColor}`}>
                    信頼度: {(confidence * 100).toFixed(0)}%
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <p className="text-xs text-gray-400">カテゴリ</p>
                    <p className="text-sm font-semibold text-white">{category}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">勘定科目</p>
                    <p className="text-sm font-semibold text-white">{accountTitle}</p>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">分析理由</p>
                <p className="text-sm text-gray-300">{reasoning}</p>
            </div>

            <div className="flex items-center gap-2">
                {taxDeductible ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        経費計上可
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        <XCircle className="w-3 h-3" />
                        経費計上不可
                    </span>
                )}
            </div>

            {suggestions && suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">💡 アドバイス</p>
                    <ul className="space-y-1">
                        {suggestions.map((suggestion, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-purple-400">•</span>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AIStatusBadge;
