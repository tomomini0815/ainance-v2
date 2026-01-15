import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const SuspiciousActivity: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">不審なアクセスへの対処</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            アカウントへの不正アクセスや乗っ取りの疑いがある場合は、速やかに以下の対策を行ってください。
                        </p>

                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-3 text-white">1. パスワードの変更</h2>
                                <p className="text-slate-300">
                                    まだログインができる場合は、直ちにパスワードを変更してください。推測されにくい複雑なパスワードを設定してください。
                                </p>
                            </div>

                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-3 text-white">2. セッションの切断</h2>
                                <p className="text-slate-300">
                                    「セキュリティ」設定から、他のすべてのデバイスからのログアウト（セッションの強制終了）を行ってください。これにより、犯人がログイン状態を維持できなくなります。
                                </p>
                            </div>

                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-3 text-white">3. サポートへの連絡</h2>
                                <p className="text-slate-300">
                                    ログインできない場合や、既にデータが改ざんされている恐れがある場合は、直ちにサポートまでお問い合わせください。アカウントの一時停止等の措置を行います。
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SuspiciousActivity;
