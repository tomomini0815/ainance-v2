import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpCircle } from 'lucide-react';

const PlanUpgrade: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <ArrowUpCircle className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">プランの変更・アップグレード</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            プランの変更はいつでも即座に行うことができます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">変更手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「プラン管理」を開きます。</li>
                            <li>「プランを変更する」ボタンをクリックします。</li>
                            <li>希望するプランを選択し、「申し込む」をクリックします。</li>
                            <li>お支払い情報を確認（または入力）し、確定します。</li>
                        </ol>

                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-indigo-400">料金の計算について</h3>
                            <p className="text-slate-300 text-sm">
                                月の途中でアップグレードした場合、残りの日数分の日割り計算で差額が請求されます。ダウングレードの場合は、次回の請求日から新しい料金が適用されます。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PlanUpgrade;
