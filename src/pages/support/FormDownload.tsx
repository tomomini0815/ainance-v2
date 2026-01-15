import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';

const FormDownload: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                            <Download className="w-6 h-6 text-slate-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">各種帳票のダウンロード</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            総勘定元帳や仕訳帳など、保存義務のある各種帳票を出力できます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">出力可能な帳票</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>総勘定元帳</li>
                            <li>仕訳帳</li>
                            <li>残高試算表</li>
                            <li>貸借対照表 / 損益計算書</li>
                        </ul>

                        <h2 className="text-xl font-bold mb-4 text-white">ダウンロード手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「データ出力」または各レポート画面の「エクスポート」を選択します。</li>
                            <li>対象期間と出力形式（PDF / CSV / Excel）を選択します。</li>
                            <li>「ダウンロード」ボタンをクリックします。</li>
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FormDownload;
