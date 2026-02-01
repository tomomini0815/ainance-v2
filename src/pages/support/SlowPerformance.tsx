import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gauge } from 'lucide-react';

const SlowPerformance: React.FC = () => {
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
                            <Gauge className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">動作が遅い・重い</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            アプリやWebサイトの動作が遅い場合の対処法です。
                        </p>

                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>インターネット接続の速度を確認してください。</li>
                            <li>ブラウザの不要なタブを閉じてください。</li>
                            <li>ブラウザのキャッシュをクリアしてください。</li>
                            <li>アプリをご利用の場合は、最新バージョンに更新してください。</li>
                            <li>デバイスを再起動してみてください。</li>
                        </ol>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-white">推奨環境</h3>
                            <p className="text-slate-300 text-sm">
                                Chrome, Safari, Firefoxの最新バージョンを推奨しています。Internet Explorerではご利用いただけません。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SlowPerformance;
