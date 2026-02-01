import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCcw } from 'lucide-react';

const SyncError: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <RefreshCcw className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">データが同期されない</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            スマートフォンとパソコンでデータが同期されない場合、以下をご確認ください。
                        </p>

                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>両方のデバイスで同じアカウントにログインしていますか？</li>
                            <li>手動同期ボタン（画面右上の更新アイコン）を押してみてください。</li>
                            <li>アプリやブラウザを再起動してください。</li>
                            <li>しばらく時間をおいてから確認してください（同期には数分かかることがあります）。</li>
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SyncError;
