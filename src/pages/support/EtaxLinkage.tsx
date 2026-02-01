import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';

const EtaxLinkage: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <Send className="w-6 h-6 text-teal-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">e-Taxへの連携方法</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Ainanceで作成した確定申告データは、e-Tax（国税電子申告・納税システム）へ直接送信することができます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">必要なもの</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>マイナンバーカード</li>
                            <li>マイナンバーカード対応のスマートフォン（またはICカードリーダー）</li>
                            <li>e-Taxの利用者識別番号（お持ちでない場合は取得手続きが必要です）</li>
                        </ul>

                        <h2 className="text-xl font-bold mb-4 text-white">連携手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>確定申告書の作成完了後、「e-Taxで送信」を選択します。</li>
                            <li>画面の指示に従い、スマートフォンでマイナンバーカードを読み取ります。</li>
                            <li>電子署名を行い、送信ボタンをクリックします。</li>
                            <li>送信完了メッセージが表示されれば手続き完了です。</li>
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EtaxLinkage;
