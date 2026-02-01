import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell } from 'lucide-react';

const NotificationSettings: React.FC = () => {
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
                            <Bell className="w-6 h-6 text-orange-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">通知設定の変更</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            重要なお知らせや、レポートやお勧めの通知設定をカスタマイズできます。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">設定方法</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>「設定」＞「通知設定」を開きます。</li>
                            <li>各項目のオン/オフを切り替えてください。</li>
                        </ol>

                        <h2 className="text-xl font-bold mb-4 text-white">主な通知項目</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                            <li><strong>製品アップデート情報</strong>: 新機能やメンテナンスのお知らせ</li>
                            <li><strong>月次レポート</strong>: 月ごとの収支レポート作成完了の通知</li>
                            <li><strong>AIコーチング</strong>: AIによる経営アドバイスの通知</li>
                            <li><strong>セキュリティ通知</strong>: 新しい端末からのログインなど</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotificationSettings;
