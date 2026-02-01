import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings2 } from 'lucide-react';

const CustomReport: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                            <Settings2 className="w-6 h-6 text-slate-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">カスタムレポートの作成</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            特定の条件や指標に絞った独自のレポートを作成・保存できます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">作成手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「レポート」＞「カスタム作成」を開きます。</li>
                            <li>分析したい軸（部門別、商品別など）と指標（売上、粗利など）を選択します。</li>
                            <li>期間やグラフの種類を指定し、「レポートを表示」をクリックします。</li>
                            <li>「設定を保存」をクリックし、名前を付けて保存すると、次回から簡単に呼び出せます。</li>
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CustomReport;
