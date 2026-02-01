import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2 } from 'lucide-react';

const SocialLogin: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Share2 className="w-6 h-6 text-purple-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">ソーシャルログインの設定</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            既存のAinanceアカウントにGoogleやAppleのアカウントを連携させることで、より簡単にログインできるようになります。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">連携の手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>Ainanceにログインし、「設定」＞「アカウント設定」を開きます。</li>
                            <li>「外部サービス連携」セクションを探します。</li>
                            <li>連携したいサービス（Googleなど）の「連携する」ボタンをクリックします。</li>
                            <li>各サービスの認証画面で許可を行うと、連携が完了します。</li>
                        </ol>

                        <h2 className="text-xl font-bold mb-4 text-white">連携の解除</h2>
                        <p className="text-slate-400 mb-4">
                            同じく「外部サービス連携」セクションから、いつでも連携を解除することができます。「解除」ボタンをクリックしてください。
                        </p>

                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-purple-400">注意点</h3>
                            <ul className="list-disc list-inside text-slate-300 text-sm space-y-2">
                                <li>メールアドレスで登録していない場合（ソーシャルログインのみでアカウント作成した場合）、すべての連携を解除することはできません。最低でも1つのログイン方法が必要です。</li>
                                <li>事前にメールアドレスとパスワードを設定することで、連携を解除できるようになります。</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SocialLogin;
