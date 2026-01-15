import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';

const LoginHistory: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">ログイン履歴の確認</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            アカウントへの不正アクセスを防ぐため、ご自身のログイン履歴を確認することができます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">確認方法</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「セキュリティ」を開きます。</li>
                            <li>「ログイン履歴」または「アクティビティ」セクションを確認します。</li>
                            <li>過去のログイン日時、IPアドレス、使用されたデバイス・ブラウザの情報が表示されます。</li>
                        </ol>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mt-8">
                            <p className="text-slate-300 mb-2">
                                身に覚えのないログイン履歴（知らない場所、デバイスからのアクセスなど）を発見した場合は、直ちにパスワードを変更し、サポートまでご連絡ください。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginHistory;
