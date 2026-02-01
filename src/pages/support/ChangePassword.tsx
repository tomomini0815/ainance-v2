import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';

const ChangePassword: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support/account')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>アカウント・登録に戻る</span>
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
                            <Lock className="w-6 h-6 text-slate-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">パスワードの変更方法</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            セキュリティのため、定期的なパスワードの変更をお勧めします。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">変更手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>ログインした状態で、「設定」＞「セキュリティ」を開きます。</li>
                            <li>「パスワード変更」をクリックします。</li>
                            <li>現在のパスワードと、新しいパスワード（確認用含め2回）を入力します。</li>
                            <li>「変更を保存」ボタンをクリックして完了です。</li>
                        </ol>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-white">パスワード要件</h3>
                            <ul className="list-disc list-inside text-slate-300 text-sm space-y-2">
                                <li>8文字以上であること</li>
                                <li>半角英字、数字、記号をそれぞれ1文字以上含むこと</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ChangePassword;
