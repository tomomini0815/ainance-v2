import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

const DashboardGuide: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support/features')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>機能・操作方法に戻る</span>
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <LayoutDashboard className="w-6 h-6 text-purple-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">ダッシュボードの見方</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            ログイン直後に表示されるダッシュボードでは、現在の経営状況が一目で把握できます。
                        </p>

                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <h3 className="font-bold mb-2 text-white">1. 今月の収支サマリー</h3>
                                <p className="text-slate-400">今月の売上、経費、利益を表示します。前月比も確認できます。</p>
                            </div>

                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <h3 className="font-bold mb-2 text-white">2. キャッシュフローグラフ</h3>
                                <p className="text-slate-400">過去6ヶ月間の資金推移をグラフで表示します。</p>
                            </div>

                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <h3 className="font-bold mb-2 text-white">3. 直近のタスク・通知</h3>
                                <p className="text-slate-400">未処理のレシートや、支払期日が近い請求書などのアラートが表示されます。</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardGuide;
