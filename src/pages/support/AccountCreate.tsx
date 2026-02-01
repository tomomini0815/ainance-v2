import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus } from 'lucide-react';

const AccountCreate: React.FC = () => {
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
                            <UserPlus className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">アカウントの作成方法</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Ainanceへの登録は非常にシンプルです。メールアドレス、またはGoogle/Appleアカウントを使用して、数分で完了します。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">手順（メールアドレスで登録）</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>トップページの「無料で始める」または「新規登録」ボタンをクリックします。</li>
                            <li>「メールアドレスで登録」を選択します。</li>
                            <li>メールアドレスと、希望するパスワードを入力します。</li>
                            <li>「登録する」ボタンをクリックすると、入力したメールアドレス宛に確認メールが送信されます。</li>
                            <li>メール内のリンクをクリックし、メールアドレスの認証を完了してください。</li>
                        </ol>

                        <h2 className="text-xl font-bold mb-4 text-white">手順（ソーシャルアカウントで登録）</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>登録画面で「Googleで登録」または「Appleで登録」ボタンをクリックします。</li>
                            <li>各プラットフォームの認証画面が表示されるので、指示に従ってログイン・許可を行ってください。</li>
                            <li>自動的にAinanceのダッシュボードへリダイレクトされ、登録が完了します。</li>
                        </ol>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mt-8">
                            <h3 className="text-lg font-bold mb-2 text-blue-400">注意点</h3>
                            <ul className="list-disc list-inside text-slate-300 text-sm space-y-2">
                                <li>1つのメールアドレスにつき、作成できるアカウントは1つまでです。</li>
                                <li>確認メールが届かない場合は、迷惑メールフォルダをご確認いただくか、入力したアドレスにお間違いがないかをご確認ください。</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AccountCreate;
