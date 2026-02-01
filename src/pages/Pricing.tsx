import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Zap, Shield, HelpCircle } from 'lucide-react';

const Pricing: React.FC = () => {
    const navigate = useNavigate();

    const plans = [
        {
            name: 'フリー',
            price: '0',
            description: '個人利用や始めたばかりの方に',
            features: [
                '月間仕訳数 50件まで',
                'AIレシート読取 (月10枚)',
                '基本的な経営分析',
                'チャットサポート',
                'スマホアプリ利用'
            ],
            cta: '無料で始める',
            highlight: false
        },
        {
            name: 'スタンダード',
            price: '1,980',
            description: '本格的にビジネスを成長させたい方に',
            features: [
                '月間仕訳数 無制限',
                'AIレシート読取 (無制限)',
                '確定申告書類 自動作成',
                'インボイス制度対応',
                '優先チャットサポート',
                '銀行口座・カード連携',
                '請求書・見積書作成 (無制限)'
            ],
            cta: 'スタンダードを試す',
            highlight: true,
            badge: 'おすすめ'
        },
        {
            name: 'プロ',
            price: '4,980',
            description: '複数の事業や法人での利用に',
            features: [
                'スタンダードの全機能',
                '複数事業所管理',
                '部門別損益管理',
                '補助金申請ドラフト作成',
                '電話・Zoomサポート',
                'API連携',
                'カスタムレポート作成'
            ],
            cta: 'プロプランを試す',
            highlight: false
        }
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold mb-6 tracking-tight font-sans"
                >
                    ビジネスの規模に合わせて選べる<br className="hidden sm:block" /><span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">シンプルな料金プラン</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-slate-400 max-w-2xl mx-auto"
                >
                    まずは無料で全ての機能をお試しください。
                    <br />
                    いつでもアップグレード・ダウングレードが可能です。
                </motion.p>
            </div>

            {/* Pricing Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative rounded-3xl p-8 flex flex-col h-full ${plan.highlight
                                    ? 'bg-indigo-600/10 border-indigo-500/30'
                                    : 'bg-slate-900 border-white/5'
                                } border transition-all hover:border-white/20`}
                        >
                            {plan.badge && (
                                <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 bg-indigo-500 text-white text-xs font-bold rounded-full">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline mb-4">
                                    <span className="text-4xl font-bold">¥{plan.price}</span>
                                    <span className="ml-1 text-slate-500 text-sm">/月（税込）</span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-slate-300">
                                        <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => navigate('/signup')}
                                className={`w-full py-4 px-6 rounded-2xl font-bold transition-all shadow-xl ${plan.highlight
                                        ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white hover:opacity-90 hover:scale-[1.02]'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Snippet or Extras */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
                            <Shield className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h4 className="font-bold mb-3">安全なデータ管理</h4>
                        <p className="text-sm text-slate-400">最新の暗号化技術により、あなたの財務データは常に安全に守られています。</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h4 className="font-bold mb-3">最速の導入</h4>
                        <p className="text-sm text-slate-400">アカウント作成後、すぐに記帳や分析を開始できます。初期設定はAIがサポート。</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                            <HelpCircle className="w-6 h-6 text-amber-400" />
                        </div>
                        <h4 className="font-bold mb-3">充実のサポート</h4>
                        <p className="text-sm text-slate-400">不明な点はAIまたはスタッフへ。あなたのビジネスの成功を全力で支援します。</p>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-slate-900 border-t border-white/5 py-24 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-8" />
                    <h2 className="text-3xl font-bold mb-4 tracking-tight font-sans">まずは無料でAinanceを体験</h2>
                    <p className="text-slate-400 mb-10 text-lg">
                        クレジットカードの登録は不要です。
                        <br />
                        すべての機能を30日間、安心してお試しいただけます。
                    </p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-10 py-5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full font-bold text-lg text-white shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all"
                    >
                        無料でアカウント作成
                    </button>
                    <p className="mt-6 text-slate-500 text-sm">
                        導入のご相談もお気軽にどうぞ。
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
