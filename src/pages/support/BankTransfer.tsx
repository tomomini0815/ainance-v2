import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Landmark } from 'lucide-react';

const BankTransfer: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                            <Landmark className="w-6 h-6 text-slate-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">銀行振込での支払い</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            現在、銀行振込（請求書払い）は<strong>チームプランを年間契約でご利用の法人様</strong>に限り対応しております。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">利用条件</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>チームプランのご契約</li>
                            <li>年間契約（12ヶ月分一括払い）</li>
                            <li>法人契約であること</li>
                        </ul>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mt-8">
                            <p className="text-slate-300">
                                銀行振込をご希望の場合は、
                                <button onClick={() => navigate('/contact')} className="text-indigo-400 hover:underline mx-1">
                                    お問い合わせフォーム
                                </button>
                                より「銀行振込希望」と記載の上、ご連絡ください。担当よりお見積書と申込書を送付いたします。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BankTransfer;
