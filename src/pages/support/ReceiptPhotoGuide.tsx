import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera } from 'lucide-react';

const ReceiptPhotoGuide: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Camera className="w-6 h-6 text-orange-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">レシートの撮影方法</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            AinanceのAI-OCR機能を使って、レシートや領収書を正確に読み取るための撮影手順をご案内します。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">基本の撮影手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>トップページの「レシート読取」ボタンをクリックします。</li>
                            <li>カメラが起動したら、レシート全体が画面に収まるように合わせます。</li>
                            <li>ピントが合っていることを確認し、撮影ボタンを押します。</li>
                            <li>撮影された画像を確認し、問題なければ「解析する」ボタンを押します。</li>
                        </ol>

                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-orange-400">うまく読み取れない場合</h3>
                            <p className="text-slate-300 text-sm">
                                暗い場所での撮影や、レシートにシワ・折り目がある場合、正しく認識されないことがあります。
                                詳しくは<button onClick={() => navigate('/support/receipt-tips')} className="text-orange-400 hover:underline mx-1">読み取り精度の向上について</button>をご覧ください。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReceiptPhotoGuide;
