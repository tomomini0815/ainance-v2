import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCog } from 'lucide-react';

const ProfileEdit: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <UserCog className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">プロフィール情報の変更</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            名前やアイコン、事業所情報などのプロフィール情報は以下の手順で変更できます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">基本情報の変更</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「プロフィール」を開きます。</li>
                            <li>名前、アイコン画像などの項目を編集します。</li>
                            <li>「保存」ボタンをクリックして反映させます。</li>
                        </ol>

                        <h2 className="text-xl font-bold mb-4 text-white">事業所情報の変更</h2>
                        <p className="text-slate-400 mb-4">
                            請求書や領収書に印字される会社名や住所などは、「設定」＞「事業所設定」から変更してください。<br />
                            インボイス登録番号の更新もこちらから行えます。
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfileEdit;
