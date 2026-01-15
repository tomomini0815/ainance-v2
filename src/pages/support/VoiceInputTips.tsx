import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic } from 'lucide-react';

const VoiceInputTips: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                            <Mic className="w-6 h-6 text-pink-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">音声入力のコツ</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            移動中や作業中でも、声だけで経費精算が完了します。AIが音声を認識し、自動でテキスト化・仕訳を行います。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">マイクボタンの使い方</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>チャット画面のマイクアイコンをタップします。</li>
                            <li>「消耗品費、3000円、アスクルで購入」のように話しかけます。</li>
                            <li>もう一度アイコンをタップして録音を終了します。</li>
                        </ol>

                        <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-pink-400">認識精度を上げるポイント</h3>
                            <ul className="list-disc list-inside text-slate-300 text-sm space-y-2">
                                <li>「日付」「金額」「内容」の3つを明確に話すと正確に記録されます。</li>
                                <li>騒音の少ない環境で話すことをお勧めします。</li>
                                <li>ゆっくり、はっきりと発音してください。</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VoiceInputTips;
