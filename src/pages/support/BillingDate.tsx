import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';

const BillingDate: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-orange-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">お支払い日の確認</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Ainanceの利用料金は、有料プランに申し込んだ日が毎月の「更新日（請求日）」となります。
                        </p>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-8">
                            <h3 className="font-bold mb-2">例：1月15日に申し込んだ場合</h3>
                            <p className="text-slate-300 text-sm">
                                初回決済日：1月15日<br />
                                次回決済日：2月15日<br />
                                以降、毎月15日に自動決済されます。
                            </p>
                        </div>

                        <p className="text-slate-400 mb-4">
                            ※31日など、翌月に同日が存在しない場合は、その月の末日が請求日となります。
                        </p>
                        <p className="text-slate-400">
                            次回の請求日は、「設定」＞「プラン管理」画面にてご確認いただけます。
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BillingDate;
