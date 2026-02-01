import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard } from 'lucide-react';

const PaymentMethods: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-violet-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">利用可能なクレジットカード</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Ainanceでは、以下のクレジットカードブランドをご利用いただけます。
                        </p>

                        <div className="bg-white/5 rounded-2xl p-8 mb-8">
                            <div className="flex flex-wrap gap-4 justify-center">
                                {['Visa', 'Mastercard', 'American Express', 'JCB', 'Diners Club', 'Discover'].map((brand) => (
                                    <span key={brand} className="px-4 py-2 bg-slate-800 rounded-lg text-slate-200 font-medium">
                                        {brand}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <p className="text-slate-400 mb-4">
                            デビットカードやプリペイドカードも、上記の国際ブランドが付帯していればご利用いただけますが、一部カード会社によってはご利用いただけない場合がございます。
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentMethods;
