import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MousePointerClick } from 'lucide-react';

const ButtonNotResponding: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support/troubleshooting')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>トラブルシューティングに戻る</span>
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                            <MousePointerClick className="w-6 h-6 text-rose-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">連携ボタンが反応しない</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            ボタンをクリック/タップしても反応がない場合、以下をお試しください。
                        </p>

                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>ページを再読み込み（リロード）してください。</li>
                            <li>別のブラウザ（Chrome, Safari, Edgeなど）をお試しください。</li>
                            <li>広告ブロッカーやブラウザ拡張機能を一時的に無効化してください。</li>
                            <li>アプリをご利用の場合は、最新バージョンにアップデートしてから再度お試しください。</li>
                        </ol>

                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 mt-8">
                            <p className="text-slate-300 text-sm">
                                上記を試しても解決しない場合は、お使いのブラウザ名・バージョン、OSを添えてお問い合わせください。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ButtonNotResponding;
