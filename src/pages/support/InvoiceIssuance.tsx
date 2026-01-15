import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';

const InvoiceIssuance: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support/payment')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>料金・お支払いに戻る</span>
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
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">利用料金の請求書発行</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Ainanceのご利用料金に関する請求書は、以下の手順で発行・ダウンロードできます。
                        </p>

                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「お支払い履歴」を開きます。</li>
                            <li>該当する月の「請求書」ボタンをクリックします。</li>
                            <li>PDF形式でダウンロードが開始されます。</li>
                        </ol>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-blue-400">宛名の変更について</h3>
                            <p className="text-slate-300 text-sm">
                                請求書の宛名はデフォルトで「アカウント名」になっています。「設定」＞「事業所設定」から会社名等を登録することで、請求書の宛名に反映させることができます。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default InvoiceIssuance;
