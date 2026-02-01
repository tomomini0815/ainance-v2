import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Landmark } from 'lucide-react';

const BankLinkageError: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <Landmark className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">銀行口座との連携エラー</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            銀行口座やクレジットカードとの連携でエラーが出る場合の対処法です。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">よくある原因</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>金融機関側でパスワードを変更した</li>
                            <li>二段階認証が追加された</li>
                            <li>金融機関のメンテナンス中</li>
                        </ul>

                        <h2 className="text-xl font-bold mb-4 text-white">対処法</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「外部連携」から該当の口座を選択し、「再連携」をお試しください。</li>
                            <li>金融機関のWebサイトにログインし、パスワードや認証設定が変わっていないか確認してください。</li>
                            <li>金融機関のメンテナンス情報をご確認ください。</li>
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BankLinkageError;
