import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserX, AlertTriangle } from 'lucide-react';

const AccountDeletion: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>サポートトップに戻る</span>
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                            <UserX className="w-6 h-6 text-rose-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">退会方法とデータの取り扱いについて</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">

                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 mb-10">
                            <div className="flex items-start">
                                <AlertTriangle className="w-6 h-6 text-rose-400 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold mb-2 text-rose-400">退会時のご注意</h3>
                                    <p className="text-slate-300 text-sm">
                                        退会処理を行うと、保存されているすべてのデータ（取引履歴、領収書画像、設定情報など）は完全に削除され、復元することはできません。必要なデータがある場合は、事前にエクスポートを行ってください。
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-4 text-white">退会の手順</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>Ainanceにログインします。</li>
                            <li>画面右上のアイコンをクリックし、「設定」メニューを開きます。</li>
                            <li>「アカウント設定」タブを選択します。</li>
                            <li>ページ最下部の「アカウントの削除」エリアにある「退会手続きへ進む」ボタンをクリックします。</li>
                            <li>注意事項をご確認の上、パスワードを入力し、削除を実行してください。</li>
                        </ol>

                        <h2 className="text-xl font-bold mb-4 text-white">データの取り扱いについて</h2>
                        <p className="text-slate-400 mb-4">
                            お客様の個人情報および会計データは、当社のプライバシーポリシーに基づき厳重に管理されます。
                        </p>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
                            <li>退会完了後、すべての個人データはサーバーから物理的に削除されます。</li>
                            <li>法令により保存が義務付けられている場合を除き、バックアップデータも含めて完全に消去されます。</li>
                            <li>第三者へのデータの提供や、目的外の利用は一切行いません。</li>
                        </ul>

                        <div className="mt-8">
                            <p className="text-slate-400">
                                詳しい内容については、
                                <button onClick={() => navigate('/privacy')} className="text-indigo-400 hover:underline mx-1">
                                    プライバシーポリシー
                                </button>
                                をご参照ください。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AccountDeletion;
