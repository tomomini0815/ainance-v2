import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Camera, BarChart3, FileText, ChevronRight } from 'lucide-react';

const HowToUse: React.FC = () => {
    const navigate = useNavigate();

    const steps = [
        {
            icon: UserPlus,
            title: 'STEP 1: アカウント作成',
            description: 'まずは無料アカウントを作成します。メールアドレスまたはGoogleアカウントがあれば、わずか1分で登録完了。クレジットカード情報の入力は不要です。',
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10'
        },
        {
            icon: Camera,
            title: 'STEP 2: 取引の記録',
            description: 'スマホでレシートを撮影するか、チャットで「ランチ代 1000円」と送信するだけ。もちろん、銀行口座やクレジットカードとの連携も可能です。',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10'
        },
        {
            icon: BarChart3,
            title: 'STEP 3: 経営状況の確認',
            description: 'ダッシュボードで売上や経費の推移をリアルタイムに確認。AIが自動で分析し、無駄な経費の削減案や資金繰りのアドバイスを提供します。',
            color: 'text-amber-400',
            bg: 'bg-amber-500/10'
        },
        {
            icon: FileText,
            title: 'STEP 4: 書類作成・申告',
            description: '請求書の発行もワンクリック。確定申告の時期には、蓄積されたデータから必要な書類を自動生成し、e-Taxでそのまま申告できます。',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
                >
                    Ainanceの<span className="text-emerald-400">使い方</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-slate-400 max-w-2xl mx-auto"
                >
                    直感的な操作で、誰でも簡単に。
                    <br />
                    専門知識がなくても、今日からDXが始まります。
                </motion.p>
            </div>

            {/* Steps */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 via-emerald-500/50 to-blue-500/50 -translate-x-1/2 rounded-full" />

                    <div className="space-y-12 md:space-y-24">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                                className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Center Node (Desktop) */}
                                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-950 border-4 border-slate-800 rounded-full z-10 items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                </div>

                                {/* Content Card */}
                                <div className="w-full md:w-[calc(50%-40px)] bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors">
                                    <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mb-6`}>
                                        <step.icon className={`w-7 h-7 ${step.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Empty Space for alternate side */}
                                <div className="hidden md:block w-[calc(50%-40px)]" />

                                {/* Mobile Arrow */}
                                {index !== steps.length - 1 && (
                                    <div className="md:hidden flex justify-center py-2 text-slate-600">
                                        <ChevronRight className="w-6 h-6 rotate-90" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-emerald-900/20 to-blue-900/20 py-20 border-y border-white/5">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-8">さあ、あなたのビジネスもAIで効率化</h2>
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full font-bold text-lg text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                    >
                        今すぐ始める
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HowToUse;
