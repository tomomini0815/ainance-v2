import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FilePlus } from 'lucide-react';

const InvoiceCreationGuide: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <FilePlus className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">インボイス対応請求書の作成</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            インボイス制度（適格請求書等保存方式）の要件を満たした請求書を簡単に作成できます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">作成手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>メニューから「請求書作成」を選択します。</li>
                            <li>「新規作成」をクリックします。</li>
                            <li>取引先、請求日、支払い期限を入力します。</li>
                            <li>品目、単価、数量、税率を入力します（税率は自動計算されます）。</li>
                            <li>「保存してプレビュー」をクリックし、内容を確認します。</li>
                            <li>PDFダウンロードやメール送信が可能です。</li>
                        </ol>

                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-indigo-400">登録番号の設定</h3>
                            <p className="text-slate-300 text-sm">
                                請求書に登録番号（T+13桁）を表示するには、事前に「設定」＞「事業所設定」にてご自身の登録番号を入力しておく必要があります。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default InvoiceCreationGuide;
