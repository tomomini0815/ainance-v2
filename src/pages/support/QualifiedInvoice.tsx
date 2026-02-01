import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const QualifiedInvoice: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support/payment')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>料金・お支払いに戻る</span>
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
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">適格請求書（インボイス）の発行</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            株式会社Ainanceは、適格請求書発行事業者の登録を行っております。
                        </p>

                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-8">
                            <p className="text-white font-bold mb-2">登録番号</p>
                            <p className="text-2xl font-mono text-emerald-400">T1234567890123</p>
                        </div>

                        <p className="text-slate-400">
                            当社が発行する請求書および領収書には、上記の登録番号、税率ごとに区分した消費税額等が記載されており、インボイスとしてご利用いただけます。
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default QualifiedInvoice;
