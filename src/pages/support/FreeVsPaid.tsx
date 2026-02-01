import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X } from 'lucide-react';

const FreeVsPaid: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support/payment')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>料金・お支払いに戻る</span>
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold mb-8">無料プランと有料プランの違い</h1>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="py-4 px-4 font-normal text-slate-400">機能</th>
                                    <th className="py-4 px-4 font-bold text-center">フリー</th>
                                    <th className="py-4 px-4 font-bold text-center text-indigo-400">スタンダード</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr>
                                    <td className="py-4 px-4 text-slate-300">月額料金</td>
                                    <td className="py-4 px-4 text-center font-bold">¥0</td>
                                    <td className="py-4 px-4 text-center font-bold text-indigo-400">¥980</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-slate-300">AIレシート読取</td>
                                    <td className="py-4 px-4 text-center">10枚 / 月</td>
                                    <td className="py-4 px-4 text-center font-bold text-emerald-400">無制限</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-slate-300">データ保存期間</td>
                                    <td className="py-4 px-4 text-center">3ヶ月</td>
                                    <td className="py-4 px-4 text-center font-bold text-emerald-400">無制限</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-slate-300">確定申告機能</td>
                                    <td className="py-4 px-4 text-center"><X className="w-5 h-5 mx-auto text-slate-600" /></td>
                                    <td className="py-4 px-4 text-center"><Check className="w-5 h-5 mx-auto text-emerald-400" /></td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-slate-300">インボイス対応請求書</td>
                                    <td className="py-4 px-4 text-center"><Check className="w-5 h-5 mx-auto text-emerald-400" /></td>
                                    <td className="py-4 px-4 text-center"><Check className="w-5 h-5 mx-auto text-emerald-400" /></td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-slate-300">サポート</td>
                                    <td className="py-4 px-4 text-center">メール</td>
                                    <td className="py-4 px-4 text-center">優先チャット</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FreeVsPaid;
