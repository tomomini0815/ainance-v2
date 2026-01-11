import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, FileText, Calculator, Calendar, AlertCircle } from 'lucide-react';

const CorporateTaxFilingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* ヘッダー */}
                <div className="flex items-center mb-8">
                    <Link to="/dashboard" className="mr-4 p-2 rounded-lg hover:bg-surface-highlight transition-colors">
                        <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                            <Building2 className="w-7 h-7 text-primary" />
                            法人税申告
                        </h1>
                        <p className="text-text-muted mt-1">法人向け税務申告サポート</p>
                    </div>
                </div>

                {/* コンテンツ */}
                <div className="space-y-6">
                    {/* 準備中メッセージ */}
                    <div className="bg-surface rounded-xl border border-border p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold text-text-main mb-2">法人税申告機能</h2>
                        <p className="text-text-muted mb-6">
                            法人向けの税務申告サポート機能は現在開発中です。
                        </p>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-left">
                                    <p className="text-sm text-amber-600 font-medium">Coming Soon</p>
                                    <p className="text-sm text-text-muted mt-1">
                                        法人決算・税務申告のサポート機能を準備しています。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 予定機能一覧 */}
                    <div className="bg-surface rounded-xl border border-border p-6">
                        <h3 className="text-lg font-semibold text-text-main mb-4">予定している機能</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 bg-surface-highlight rounded-lg">
                                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-text-main">決算書作成サポート</p>
                                    <p className="text-sm text-text-muted">貸借対照表・損益計算書の自動生成</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-surface-highlight rounded-lg">
                                <Calculator className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-text-main">法人税計算</p>
                                    <p className="text-sm text-text-muted">法人税・地方法人税の自動計算</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-surface-highlight rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-text-main">申告期限管理</p>
                                    <p className="text-sm text-text-muted">決算・申告スケジュールの管理</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-surface-highlight rounded-lg">
                                <Building2 className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-text-main">消費税申告</p>
                                    <p className="text-sm text-text-muted">消費税の集計と申告書作成</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 戻るボタン */}
                    <div className="text-center">
                        <Link
                            to="/tax-filing-wizard"
                            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            個人事業主向け確定申告へ
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CorporateTaxFilingPage;
