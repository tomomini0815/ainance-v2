import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, User, CreditCard, Settings, AlertCircle, MessageSquare, ExternalLink } from 'lucide-react';

const Support: React.FC = () => {
    const navigate = useNavigate();

    const categories = [
        {
            icon: User,
            title: 'アカウント・登録',
            description: '登録方法、パスワードリセット、アカウント設定など',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            path: '/support/account'
        },
        {
            icon: CreditCard,
            title: '料金・お支払い',
            description: 'プラン変更、請求書の確認、決済方法について',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            path: '/support/payment'
        },
        {
            icon: Settings,
            title: '機能・操作方法',
            description: 'レシート読取、チャット経理、確定申告機能の使い方',
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            path: '/support/features'
        },
        {
            icon: AlertCircle,
            title: 'トラブルシューティング',
            description: 'エラーが表示される場合や、動作が遅い場合の対処法',
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            path: '/support/troubleshooting'
        }
    ];

    const popularArticles = [
        { title: '領収書の読み取り精度を上げるコツは？', path: '/support/receipt-tips' },
        { title: 'インボイス制度への対応について', path: '/support/invoice-compliance' },
        { title: '退会方法とデータの取り扱いについて', path: '/support/account-deletion' },
        { title: '複数のデバイスで利用できますか？', path: '/support/multi-device' }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>ホームに戻る</span>
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-slate-900 border-b border-white/5 py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-6"
                    >
                        サポートセンター
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 mb-10"
                    >
                        困ったときは、まずこちらをご確認ください
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative max-w-xl mx-auto"
                    >
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder="キーワードで検索（例：パスワード、インボイス）"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Categories */}
                <h2 className="text-2xl font-bold mb-8">カテゴリーから探す</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(cat.path)}
                            className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-slate-900 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors">{cat.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{cat.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Popular Articles */}
                <h2 className="text-2xl font-bold mb-8">よく見られている記事</h2>
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 mb-20">
                    <ul className="divide-y divide-white/5">
                        {popularArticles.map((article, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => navigate(article.path)}
                                    className="w-full flex items-center justify-between py-4 text-left hover:text-indigo-400 transition-colors group"
                                >
                                    <span className="text-slate-300 group-hover:text-indigo-400">{article.title}</span>
                                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-400" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact CTA */}
                <div className="text-center bg-indigo-900/10 border border-indigo-500/20 rounded-3xl p-10 md:p-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 mb-6">
                        <MessageSquare className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">解決しない場合</h2>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                        専任のサポートチームにお問い合わせください。<br />
                        原則24時間以内にご返信いたします。
                    </p>
                    <button
                        onClick={() => navigate('/contact')}
                        className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25"
                    >
                        お問い合わせフォーム
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Support;
