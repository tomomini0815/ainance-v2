import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';

const EmailChange: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-teal-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">メールアドレスの変更</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            ログインおよび通知受信用に使用するメールアドレスの変更手順は以下の通りです。
                        </p>

                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「アカウント設定」を開きます。</li>
                            <li>「メールアドレス」項目の横にある「変更」ボタンをクリックします。</li>
                            <li>新しいメールアドレスと、現在のパスワードを入力します。</li>
                            <li>新しいメールアドレス宛に確認メールが送信されます。</li>
                            <li>メール内の認証リンクをクリックすると、変更が完了します。</li>
                        </ol>

                        <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-teal-400">注意</h3>
                            <p className="text-slate-300 text-sm">
                                認証リンクをクリックするまでは、古いメールアドレスが有効なままとなります。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EmailChange;
