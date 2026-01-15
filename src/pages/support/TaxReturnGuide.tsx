import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';

const TaxReturnGuide: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">確定申告書の作成手順</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            日々の取引データを元に、簡単に確定申告書（青色申告決算書など）を作成できます。
                        </p>

                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>メニューから「確定申告」を選択します。</li>
                            <li>「ステップ1：基本情報」で、住所や家族構成などを入力・確認します。</li>
                            <li>「ステップ2：収支内訳」で、1年間の取引内容に漏れや間違いがないか確認します。AIが異常値をチェックしてくれます。</li>
                            <li>「ステップ3：控除入力」で、生命保険料控除や医療費控除などを入力します。</li>
                            <li>「作成」ボタンを押すと、PDF形式で申告書が生成されます。</li>
                        </ol>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mt-8">
                            <p className="text-slate-300 text-sm">
                                ※作成された書類は、そのままe-Taxで送信するか、印刷して税務署に提出することができます。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TaxReturnGuide;
