import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Smartphone } from 'lucide-react';

const LineIntegration: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-green-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">LINE連携の設定</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Ainance公式LINEアカウントと連携すると、LINEからレシート画像を送るだけで経費登録ができるようになります。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">連携手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「アカウント設定」＞「外部連携」を開きます。</li>
                            <li>「LINE連携」ボタンをクリックします。</li>
                            <li>表示されるQRコードをLINEアプリで読み取るか、認証画面へ進みます。</li>
                            <li>AinanceのアカウントとLINEを紐付けます。</li>
                        </ol>

                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-green-400">LINEでできること</h3>
                            <ul className="list-disc list-inside text-slate-300 text-sm space-y-2">
                                <li>レシート画像の送信・自動記帳</li>
                                <li>チャットでの簡単入力</li>
                                <li>レポート通知の受け取り</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LineIntegration;
