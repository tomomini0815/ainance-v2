import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Camera } from 'lucide-react';

const ReceiptTips: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>サポートトップに戻る</span>
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
                            <Camera className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">領収書の読み取り精度を上げるコツは？</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            AinanceのAI-OCRは高精度ですが、撮影環境や方法によって精度が大きく変わることがあります。以下のポイントを意識して撮影することで、より正確に読み取ることができます。
                        </p>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center text-emerald-400">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                良い撮影方法
                            </h2>
                            <ul className="space-y-3 text-slate-300">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>明るい場所で撮影する（影が入らないように注意）</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>背景は黒などの濃い色を選ぶと境界線が認識されやすくなります</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>レシートの四隅が画面に収まるようにする</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>シワを伸ばして平らな状態で撮影する</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-12">
                            <h2 className="text-xl font-bold mb-4 flex items-center text-rose-400">
                                <XCircle className="w-5 h-5 mr-2" />
                                避けるべき撮影方法
                            </h2>
                            <ul className="space-y-3 text-slate-300">
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>手ブレしている</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>レシートが極端に斜めになっている</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>白飛びしている、または暗すぎる</span>
                                </li>
                            </ul>
                        </div>

                        <h3 className="text-xl font-bold mb-4">それでも読み取れない場合</h3>
                        <p className="text-slate-400 mb-4">
                            手書きの領収書や、インクが薄れているレシート等は正しく読み取れない場合があります。その場合は、読み取り後に手動で修正するか、チャット機能を使って内容を入力してください。
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReceiptTips;
