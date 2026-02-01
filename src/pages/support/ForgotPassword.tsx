import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound } from 'lucide-react';

const ForgotPassword: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">パスワードを忘れた場合</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            ログインパスワードをお忘れの場合は、以下の手順で再設定を行ってください。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">再設定の手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>ログイン画面にある「パスワードをお忘れの方」リンクをクリックします。</li>
                            <li>登録済みのメールアドレスを入力し、「リセットメールを送信」ボタンを押します。</li>
                            <li>受信したメール内のリンクをクリックし、新しいパスワードを設定してください。</li>
                        </ol>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-yellow-400">メールが届かない場合</h3>
                            <ul className="list-disc list-inside text-slate-300 text-sm space-y-2">
                                <li>迷惑メールフォルダをご確認ください。</li>
                                <li>「@ainance.com」からのメール受信を許可設定してください。</li>
                                <li>登録アドレスが正しいか再度ご確認ください。</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
