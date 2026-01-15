import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, WifiOff } from 'lucide-react';

const OfflineMode: React.FC = () => {
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
                            <WifiOff className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">オフラインモードと表示される</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            「オフラインモード」と表示される場合、インターネット接続が切断されている可能性があります。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">確認すること</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>Wi-Fiまたはモバイルデータ通信がオンになっていますか？</li>
                            <li>機内モードがオフになっていますか？</li>
                            <li>他のWebサイト（例: google.com）にはアクセスできますか？</li>
                        </ul>

                        <p className="text-slate-400">
                            インターネット接続が確認できたら、ページを再読み込みしてください。それでもオフラインモードが表示される場合は、アプリを再起動してください。
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OfflineMode;
