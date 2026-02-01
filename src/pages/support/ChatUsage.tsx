import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare } from 'lucide-react';

const ChatUsage: React.FC = () => {
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
                            <MessageSquare className="w-6 h-6 text-purple-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">チャット機能の使い方</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Ainanceの「チャット経理」機能を使うと、AIとの対話形式で簡単に記帳が行えます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">使い方の例</h2>
                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-8">
                            <p className="text-slate-300 font-mono text-sm mb-4 bg-slate-800 p-4 rounded-lg">
                                「今日カフェで打ち合わせして1,200円払ったよ」
                            </p>
                            <p className="text-slate-400 mb-4">
                                と送信すると、AIが以下のように自動で仕訳を提案します。
                            </p>
                            <div className="bg-slate-800 p-4 rounded-lg text-sm text-slate-200">
                                勘定科目：会議費<br />
                                金額：1,200円<br />
                                日付：今日<br />
                                適用：カフェで打ち合わせ
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-4 text-white">できること</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                            <li><strong>経費の入力</strong>: 「タクシー代 3000円」など</li>
                            <li><strong>売上の入力</strong>: 「A社からデザイン料 5万円 入金」など</li>
                            <li><strong>質問</strong>: 「この領収書は経費になりますか？」といった相談</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ChatUsage;
