import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

const Privacy: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: Shield,
            title: '1. 個人情報の収集',
            content: [
                'Ainanceでは、サービスの提供および改善のために以下の個人情報を収集します：',
                '• 基本情報：氏名、メールアドレス、電話番号',
                '• 事業情報：会社名、事業形態、業種',
                '• 財務情報：取引データ、レシート画像、請求書データ',
                '• 技術情報：IPアドレス、ブラウザ情報、デバイス情報',
                '• 利用情報：サービスの利用履歴、アクセスログ'
            ]
        },
        {
            icon: Database,
            title: '2. 個人情報の利用目的',
            content: [
                '収集した個人情報は、以下の目的で利用します：',
                '• サービスの提供、維持、改善',
                '• ユーザーサポートおよびカスタマーサービス',
                '• 新機能や更新情報のお知らせ',
                '• サービスの不正利用の防止',
                '• 統計データの作成および分析',
                '• 法令に基づく対応'
            ]
        },
        {
            icon: Lock,
            title: '3. 個人情報の保護',
            content: [
                'お客様の個人情報を保護するため、以下のセキュリティ対策を実施しています：',
                '• 256ビットSSL/TLS暗号化通信',
                '• データベースの暗号化保存',
                '• 多要素認証（MFA）の実装',
                '• 定期的なセキュリティ監査',
                '• アクセス制御および権限管理',
                '• 24時間365日のセキュリティモニタリング'
            ]
        },
        {
            icon: Eye,
            title: '4. 第三者への提供',
            content: [
                '以下の場合を除き、お客様の同意なく第三者に個人情報を提供することはありません：',
                '• 法令に基づく場合',
                '• 人の生命、身体または財産の保護のために必要な場合',
                '• サービス提供に必要な範囲で、業務委託先に提供する場合',
                '',
                '【業務委託先】',
                '• クラウドストレージサービス（AWS、Google Cloud）',
                '• 決済サービスプロバイダー',
                '• カスタマーサポートツール',
                '',
                '※委託先には適切な管理・監督を行います。'
            ]
        },
        {
            icon: UserCheck,
            title: '5. お客様の権利',
            content: [
                'お客様は、ご自身の個人情報について以下の権利を有します：',
                '• 開示請求：保有する個人情報の開示を請求できます',
                '• 訂正請求：個人情報の内容が事実でない場合、訂正を請求できます',
                '• 利用停止請求：個人情報の利用停止または削除を請求できます',
                '• 同意の撤回：同意に基づく処理について、いつでも撤回できます',
                '',
                'これらの権利を行使される場合は、お問い合わせフォームよりご連絡ください。'
            ]
        },
        {
            icon: FileText,
            title: '6. Cookie（クッキー）の使用',
            content: [
                'Ainanceでは、サービスの利便性向上のためにCookieを使用しています：',
                '',
                '【使用目的】',
                '• ログイン状態の維持',
                '• ユーザー設定の保存',
                '• サービス利用状況の分析',
                '• 広告の最適化',
                '',
                'ブラウザの設定でCookieを無効にすることも可能ですが、一部機能が制限される場合があります。'
            ]
        }
    ];

    const additionalSections = [
        {
            title: '7. データの保存期間',
            content: '個人情報は、利用目的の達成に必要な期間、または法令で定められた期間保存します。アカウント削除後は、法令で保存が義務付けられているものを除き、速やかに削除します。'
        },
        {
            title: '8. 国際的なデータ転送',
            content: 'サービスの提供にあたり、お客様の個人情報を日本国外のサーバーに保存する場合があります。その際は、適切なデータ保護措置を講じます。'
        },
        {
            title: '9. 未成年者の個人情報',
            content: 'Ainanceは、原則として18歳未満の方を対象としたサービスではありません。18歳未満の方が利用される場合は、保護者の同意が必要です。'
        },
        {
            title: '10. プライバシーポリシーの変更',
            content: '本プライバシーポリシーは、法令の変更やサービス内容の変更に伴い、予告なく変更する場合があります。重要な変更がある場合は、サービス内またはメールでお知らせします。'
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
                        <Shield className="w-10 h-10 text-blue-400" />
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
                        プライバシーポリシー
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Ainanceは、お客様の個人情報の保護を最優先に考えています。
                        <br />
                        本ポリシーでは、個人情報の取り扱いについて説明します。
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

                {/* Additional Sections */}
                <div className="space-y-6 mb-16">
                    {additionalSections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: (sections.length + index) * 0.1 }}
                            className="bg-[#0f172a]/30 backdrop-blur-sm border border-white/5 rounded-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-3">{section.title}</h3>
                            <p className="text-gray-300 leading-relaxed">{section.content}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: (sections.length + additionalSections.length) * 0.1 }}
                    className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center"
                >
                    <h3 className="text-2xl font-bold mb-4">お問い合わせ</h3>
                    <p className="text-gray-300 mb-6">
                        プライバシーポリシーに関するご質問やご不明な点がございましたら、
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
                    <p>株式会社Ainance</p>
                    <p className="mt-2">〒100-0001 東京都千代田区千代田1-1-1</p>
                    <p className="mt-2">個人情報保護管理者：プライバシー保護室</p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
