import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle } from 'lucide-react';

const UnknownEntry: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">不明な仕訳の質問方法</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            「この領収書、どの勘定科目だろう？」と迷ったときは、AIチャットに相談するか、「不明金」として登録しておくことができます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">AIへの相談</h2>
                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-8">
                            <p className="text-slate-300">
                                チャットで<br />
                                <span className="text-indigo-400">「友人の結婚式のご祝儀は経費になる？」</span><br />
                                のように質問すると、AIが税務知識に基づいて回答します。
                            </p>
                        </div>

                        <h2 className="text-xl font-bold mb-4 text-white">とりあえず登録する場合</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>勘定科目を「不明金」または「未確定」として登録します。</li>
                            <li>後で税理士や詳しい人に確認してから、正しい科目に修正することができます。</li>
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UnknownEntry;
