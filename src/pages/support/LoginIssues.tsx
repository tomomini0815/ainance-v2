import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const LoginIssues: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-orange-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">ログインできない場合</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            ログインができない原因として、いくつかの可能性が考えられます。以下の項目を順にご確認ください。
                        </p>

                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-white">1. メールアドレス・パスワードの誤入力</h2>
                                <p className="text-slate-400 mb-2">全角・半角の違いや、大文字・小文字の区別（CapsLockがオンになっていないか）をご確認ください。</p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold mb-4 text-white">2. パスワードをお忘れの場合</h2>
                                <p className="text-slate-400 mb-2">
                                    ログイン画面の「パスワードをお忘れの方」リンクから、パスワードの再設定を行ってください。登録メールアドレス宛に再設定用のリンクが送信されます。
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold mb-4 text-white">3. ソーシャルログインで登録した場合</h2>
                                <p className="text-slate-400 mb-2">
                                    GoogleやAppleでアカウントを作成された場合、メールアドレスとパスワードによるログインはできません。登録時と同じソーシャルボタンからログインしてください。
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold mb-4 text-white">4. アカウントがロックされている場合</h2>
                                <p className="text-slate-400 mb-2">
                                    セキュリティ保護のため、ログインの試行に複数回失敗すると、一時的にアカウントがロックされる場合があります。しばらく時間を置いてから再度お試しください。
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mt-8">
                            <p className="text-slate-300">
                                上記を確認しても解決しない場合は、
                                <button onClick={() => navigate('/contact')} className="text-indigo-400 hover:underline mx-1">
                                    お問い合わせフォーム
                                </button>
                                より詳細な状況をご連絡ください。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginIssues;
