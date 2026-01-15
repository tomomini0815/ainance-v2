import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';

const AppUpdate: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Download className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">アプリのアップデート方法</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <h2 className="text-xl font-bold mb-4 text-white">iOSの場合</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>App Storeを開きます。</li>
                            <li>右上のプロフィールアイコンをタップします。</li>
                            <li>「Ainance」の横に「アップデート」ボタンがあればタップします。</li>
                        </ol>

                        <h2 className="text-xl font-bold mb-4 text-white">Androidの場合</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>Google Play ストアを開きます。</li>
                            <li>「Ainance」を検索して開きます。</li>
                            <li>「更新」ボタンが表示されていればタップします。</li>
                        </ol>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mt-8">
                            <p className="text-slate-300 text-sm">
                                自動アップデートを有効にしておくと、常に最新バージョンをご利用いただけます。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AppUpdate;
