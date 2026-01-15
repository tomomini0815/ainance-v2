import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Phone, Mail, MapPin, User, FileText, CreditCard } from 'lucide-react';

const LegalNotice: React.FC = () => {
    const navigate = useNavigate();

    const items = [
        {
            icon: Building2,
            label: '販売業者',
            value: ''
        },
        {
            icon: User,
            label: '運営統括責任者',
            value: ''
        },
        {
            icon: MapPin,
            label: '所在地',
            value: ''
        },
        {
            icon: Phone,
            label: '電話番号',
            value: '03-1234-5678',
            note: '※受付時間 10:00-18:00（土日祝を除く）'
        },
        {
            icon: Mail,
            label: 'メールアドレス',
            value: 'support@ainance.jp'
        },
        {
            icon: CreditCard,
            label: '販売価格',
            value: '各プランの申込みページに表示されます。'
        },
        {
            icon: FileText,
            label: '商品代金以外の必要料金',
            value: '消費税、インターネット接続料金、通信料金等はお客様の負担となります。'
        },
        {
            icon: FileText,
            label: 'お支払い方法',
            value: 'クレジットカード決済（Visa, Mastercard, JCB, American Express, Diners Club）'
        },
        {
            icon: FileText,
            label: '代金の支払時期',
            value: '初回お申込み時、翌月以降は毎月更新日に決済されます。'
        },
        {
            icon: FileText,
            label: '商品の引渡時期',
            value: '決済完了後、直ちにご利用いただけます。'
        },
        {
            icon: FileText,
            label: '返品・キャンセル',
            value: '商品の性質上、原則として返品・返金はお受けしておりません。解約はいつでもマイページより行っていただけます。次回更新日の前日までに解約手続きを行っていただければ、次回以降の請求は発生しません。'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#030712] to-[#0f172a] text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>ホームに戻る</span>
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/20 mb-6">
                        <FileText className="w-10 h-10 text-blue-400" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
                        特定商取引法に基づく表記
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        特定商取引法に基づく表示を記載しています。
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden mb-16">
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className={`flex flex-col sm:flex-row p-6 ${index !== items.length - 1 ? 'border-b border-white/5' : ''
                                } hover:bg-white/5 transition-colors`}
                        >
                            <div className="flex items-center sm:w-1/3 mb-2 sm:mb-0">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4 flex-shrink-0">
                                    <item.icon className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="font-bold text-gray-200">{item.label}</span>
                            </div>
                            <div className="sm:w-2/3 pl-14 sm:pl-0 flex flex-col justify-center">
                                <p className="text-gray-300 leading-relaxed">{item.value}</p>
                                {item.note && <p className="text-sm text-gray-500 mt-1">{item.note}</p>}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center"
                >
                    <h3 className="text-2xl font-bold mb-4">お問い合わせ</h3>
                    <p className="text-gray-300 mb-6">
                        サービスに関するご質問やご不明な点がございましたら、
                        <br />
                        お気軽にお問い合わせください。
                    </p>
                    <button
                        onClick={() => navigate('/contact')}
                        className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
                    >
                        お問い合わせフォームへ
                    </button>
                </motion.div>

                {/* Footer Info */}
                <div className="mt-16 pt-8 border-t border-white/5 text-center text-sm text-gray-500">

                </div>
            </div>
        </div>
    );
};

export default LegalNotice;
