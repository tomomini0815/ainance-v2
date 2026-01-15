import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard } from 'lucide-react';

const PaymentPlans: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support/payment')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>料金・お支払いに戻る</span>
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">料金プラン一覧</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Ainanceでは、規模や用途に合わせて3つのプランをご用意しています。
                        </p>

                        <div className="grid gap-6">
                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-2">フリープラン</h2>
                                <p className="text-2xl font-bold text-white mb-4">¥0 <span className="text-sm font-normal text-slate-400">/月</span></p>
                                <p className="text-slate-300 text-sm mb-4">
                                    個人で手軽に始めたい方向け。
                                </p>
                                <ul className="list-disc list-inside text-slate-400 text-sm">
                                    <li>月間レシート読取 10枚まで</li>
                                    <li>データ保存期間 3ヶ月</li>
                                    <li>メールサポート</li>
                                </ul>
                            </div>

                            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-4 right-4 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">人気</div>
                                <h2 className="text-xl font-bold mb-2 text-indigo-300">スタンダードプラン</h2>
                                <p className="text-2xl font-bold text-white mb-4">¥980 <span className="text-sm font-normal text-slate-400">/月</span></p>
                                <p className="text-slate-300 text-sm mb-4">
                                    個人事業主や小規模法人向け。
                                </p>
                                <ul className="list-disc list-inside text-slate-400 text-sm">
                                    <li>レシート読取 無制限</li>
                                    <li>データ保存期間 無制限</li>
                                    <li>チャットボット・優先サポート</li>
                                    <li>確定申告書類作成</li>
                                </ul>
                            </div>

                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-2">チームプラン</h2>
                                <p className="text-2xl font-bold text-white mb-4">¥2,980 <span className="text-sm font-normal text-slate-400">/月</span></p>
                                <p className="text-slate-300 text-sm mb-4">
                                    税理士との連携や複数人での管理に。
                                </p>
                                <ul className="list-disc list-inside text-slate-400 text-sm">
                                    <li>3ユーザーまで利用可能</li>
                                    <li>権限管理機能</li>
                                    <li>API連携</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentPlans;
