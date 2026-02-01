import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Scale, AlertTriangle, ShieldCheck, UserX, Gavel } from 'lucide-react';

const TermsOfService: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: FileText,
            title: '1. はじめに',
            content: [
                '本利用規約（以下「本規約」といいます。）は、株式会社Ainance（以下「当社」といいます。）が提供するサービス「Ainance」（以下「本サービス」といいます。）の利用条件を定めるものです。',
                '登録ユーザーの皆様（以下「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。'
            ]
        },
        {
            icon: UserX,
            title: '2. 登録',
            content: [
                '1. 登録希望者は、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。',
                '2. 当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。',
                '• 虚偽の事項を届け出た場合',
                '• 本規約に違反したことがある者からの申請である場合',
                '• その他、当社が利用登録を相当でないと判断した場合'
            ]
        },
        {
            icon: AlertTriangle,
            title: '3. 禁止事項',
            content: [
                'ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。',
                '• 法令または公序良俗に違反する行為',
                '• 犯罪行為に関連する行為',
                '• 本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為',
                '• 当社、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為',
                '• 本サービスによって得られた情報を商業的に利用する行為',
                '• 当社のサービスの運営を妨害するおそれのある行為',
                '• 不正アクセスをし、またはこれを試みる行為',
                '• 他のユーザーに関する個人情報等を収集または蓄積する行為',
                '• 不正な目的を持って本サービスを利用する行為'
            ]
        },
        {
            icon: ShieldCheck,
            title: '4. 本サービスの提供の停止等',
            content: [
                '当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。',
                '• 本サービスにかかるコンピュータシステムの保守点検または更新を行う場合',
                '• 地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合',
                '• コンピュータまたは通信回線等が事故により停止した場合',
                '• その他、当社が本サービスの提供が困難と判断した場合'
            ]
        },
        {
            icon: Scale,
            title: '5. 免責事項',
            content: [
                '1. 当社の債務不履行責任は、当社の故意または重過失によらない場合には免責されるものとします。',
                '2. 当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。'
            ]
        },
        {
            icon: Gavel,
            title: '6. 準拠法・裁判管轄',
            content: [
                '1. 本規約の解釈にあたっては、日本法を準拠法とします。',
                '2. 本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。'
            ]
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
                    <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
                        利用規約
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Ainanceをご利用いただく際のルールを定めています。
                        <br />
                        本サービスをご利用になる前に、必ずお読みください。
                    </p>
                    <div className="mt-8 text-sm text-gray-500">
                        最終更新日：2024年12月1日
                    </div>
                </motion.div>

                {/* Main Sections */}
                <div className="space-y-8 mb-16">
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-[#0f172a]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <section.icon className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                                    <div className="space-y-2 text-gray-300 leading-relaxed">
                                        {section.content.map((line, i) => (
                                            <p key={i} className={line === '' ? 'h-2' : ''}>
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: sections.length * 0.1 }}
                    className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center"
                >
                    <h3 className="text-2xl font-bold mb-4">お問い合わせ</h3>
                    <p className="text-gray-300 mb-6">
                        本規約に関するご質問やご不明な点がございましたら、
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

export default TermsOfService;
