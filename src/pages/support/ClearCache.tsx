import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';

const ClearCache: React.FC = () => {
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
                            <Trash2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">キャッシュのクリア方法</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            画面が正しく表示されない場合や、古い情報が表示される場合は、ブラウザのキャッシュをクリアしてください。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">Chromeの場合</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>「設定」＞「プライバシーとセキュリティ」を開きます。</li>
                            <li>「閲覧履歴データの削除」をクリックします。</li>
                            <li>「キャッシュされた画像とファイル」にチェックを入れ、「データを削除」します。</li>
                        </ol>

                        <h2 className="text-xl font-bold mb-4 text-white">Safariの場合</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>「Safari」メニュー＞「設定」＞「プライバシー」を開きます。</li>
                            <li>「Webサイトデータを管理」をクリックします。</li>
                            <li>「すべてを削除」をクリックします。</li>
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ClearCache;
