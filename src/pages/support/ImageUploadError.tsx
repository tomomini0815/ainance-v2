import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ImageOff } from 'lucide-react';

const ImageUploadError: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                            <ImageOff className="w-6 h-6 text-rose-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">画像のアップロードに失敗する</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <h2 className="text-xl font-bold mb-4 text-white">確認事項</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>ファイルサイズが10MBを超えていませんか？</li>
                            <li>対応形式（JPEG, PNG, HEIC）で保存されていますか？</li>
                            <li>安定したインターネット接続がありますか？</li>
                        </ul>

                        <h2 className="text-xl font-bold mb-4 text-white">対処法</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>画像のファイルサイズを確認し、大きすぎる場合はリサイズしてください。</li>
                            <li>Wi-Fi環境など、安定したネットワーク接続下で再試行してください。</li>
                            <li>ブラウザやアプリを再起動してお試しください。</li>
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ImageUploadError;
