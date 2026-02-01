import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const TwoFactorAuth: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">二段階認証の設定方法</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            アカウントのセキュリティを強化するため、二段階認証（2FA）の設定を強く推奨しています。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">設定手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「セキュリティ」を開きます。</li>
                            <li>「二段階認証」の項目にある「設定する」ボタンをクリックします。</li>
                            <li>認証アプリ（Google Authenticator, Authyなど）でお手持ちのスマホからQRコードを読み取ります。</li>
                            <li>アプリに表示された6桁のコードを入力し、設定を完了します。</li>
                        </ol>

                        <h2 className="text-xl font-bold mb-4 text-white">バックアップコードについて</h2>
                        <p className="text-slate-400 mb-4">
                            設定完了時に表示されるバックアップコードは、スマホを紛失した際などにログインするために必要となります。必ず安全な場所に保管してください。
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TwoFactorAuth;
