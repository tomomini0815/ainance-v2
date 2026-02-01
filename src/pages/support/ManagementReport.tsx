import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, PieChart } from 'lucide-react';

const ManagementReport: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <PieChart className="w-6 h-6 text-orange-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">経営レポートの活用</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            月次・年次の経営レポートを自動生成し、分析に役立てることができます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">レポートの種類</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li><strong>月次推移表</strong>: 月ごとの売上・経費の推移</li>
                            <li><strong>経費内訳分析</strong>: どの科目にどれくらい経費を使っているかの円グラフ</li>
                            <li><strong>得意先別売上</strong>: 取引先ごとの売上構成比</li>
                        </ul>

                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-orange-400">AIアドバイス</h3>
                            <p className="text-slate-300 text-sm">
                                各レポートにはAIによるコメントが付きます。「前年同月比で交際費が増加傾向にあります」など、気付きにくいポイントを指摘します。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ManagementReport;
