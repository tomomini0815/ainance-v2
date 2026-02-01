import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserMinus } from 'lucide-react';

const Cancellation: React.FC = () => {
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
                            <UserMinus className="w-6 h-6 text-slate-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">解約について</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            有料プランの解約（フリープランへのダウングレード）は、いつでも手続き可能です。解約金などは一切かかりません。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">解約手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「プラン管理」を開きます。</li>
                            <li>ページ下部にある「プランを解約する」リンクをクリックします。</li>
                            <li>アンケートにお答えいただき、「解約する」ボタンをクリックします。</li>
                        </ol>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-white">解約後のご利用について</h3>
                            <ul className="list-disc list-inside text-slate-300 text-sm space-y-2">
                                <li>解約手続き後も、現在の契約期間終了日までは有料機能をご利用いただけます。</li>
                                <li>期間終了後は自動的にフリープランへ移行します。</li>
                                <li>保存期間を超過したデータは、フリープラン移行後に削除される可能性がありますのでご注意ください。</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Cancellation;
