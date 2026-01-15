import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Receipt, MessageSquare, FileText, TrendingUp, Sparkles, Calculator, CheckCircle } from 'lucide-react';

const Features: React.FC = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Receipt,
            title: 'AIレシート読取',
            description: '最新のOCR技術とAIを組み合わせ、レシートを撮影するだけで高精度にデータ化。日付、金額、支払先はもちろん、インボイス登録番号も自動で検知します。手入力の手間を99%削減し、経理業務を劇的に効率化します。',
            details: [
                '99.8%の読取精度',
                '複数枚同時スキャン対応',
                'インボイス登録番号の自動照合',
                '電子帳簿保存法対応の保存形式'
            ],
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10'
        },
        {
            icon: MessageSquare,
            title: '音声・チャット経理',
            description: 'LINEのようなチャットインターフェースで、取引内容を送信するだけ。音声入力にも対応しており、移動中や作業中でもハンズフリーで記帳が可能です。「昨日のタクシー代 2000円」と話しかけるだけで、AIが自動で仕訳を作成します。',
            details: [
                '自然言語処理による自動仕訳',
                '音声入力対応',
                'レシート画像のチャット送信',
                '不明点のAI自動問い合わせ'
            ],
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10'
        },
        {
            icon: Calculator,
            title: '確定申告サポート',
            description: '日々の記帳データをもとに、確定申告に必要な書類を自動作成。青色申告決算書や収支内訳書など、複雑な書類もウィザード形式で数クリックで完成します。e-Taxへの連携もスムーズです。',
            details: [
                '青色・白色申告対応',
                '控除額の自動計算',
                '減価償却費の計算',
                'e-Tax用データ出力'
            ],
            color: 'text-purple-400',
            bg: 'bg-purple-500/10'
        },
        {
            icon: FileText,
            title: '請求書・見積書作成',
            description: '美しいデザインの請求書や見積書を簡単に作成。作成した書類はワンクリックでPDF化、メール送信が可能です。インボイス制度に対応したフォーマットで、適格請求書の発行も安心です。',
            details: [
                'インボイス対応フォーマット',
                'テンプレートカスタマイズ',
                '自動郵送代行（オプション）',
                '入金ステータス管理'
            ],
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
        },
        {
            icon: TrendingUp,
            title: '経営分析ダッシュボード',
            description: '売上、経費、利益の推移をリアルタイムで可視化。資金繰りの予測や、経費の削減ポイントをAIがアドバイス。直感的なグラフで、ビジネスの状況を一目で把握できます。',
            details: [
                'リアルタイムキャッシュフロー',
                '部門別・プロジェクト別損益',
                'AI経営アドバイス',
                '月次レポート自動生成'
            ],
            color: 'text-amber-400',
            bg: 'bg-amber-500/10'
        },
        {
            icon: Sparkles,
            title: '補助金マッチング',
            description: 'あなたの事業内容や規模に合わせて、申請可能な補助金・助成金をAIが自動でマッチング。受給の可能性がある制度を見逃しません。申請書のドラフト作成もAIがサポートします。',
            details: [
                'AIによる最適マッチング',
                '新着補助金のアラート',
                '申請書作成アシスト',
                '採択可能性診断'
            ],
            color: 'text-rose-400',
            bg: 'bg-rose-500/10'
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
                    Ainanceの<span className="text-indigo-400">パワフルな機能</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-slate-400 max-w-2xl mx-auto"
                >
                    個人事業主から中小企業まで、
                    <br />
                    経理業務を自動化し、経営を加速させる全ての機能がここに。
                </motion.p>
            </div>

            {/* Features List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="grid gap-8 md:gap-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 md:p-12"
                        >
                            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center`}>
                                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h2>
                                    <p className="text-lg text-slate-300 leading-relaxed mb-8">
                                        {feature.description}
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {feature.details.map((detail, idx) => (
                                            <div key={idx} className="flex items-center space-x-3 text-slate-400">
                                                <CheckCircle className={`w-5 h-5 flex-shrink-0 ${feature.color}`} />
                                                <span>{detail}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-indigo-900/20 to-emerald-900/20 py-20 border-y border-white/5">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-8">まずは無料でお試しください</h2>
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full font-bold text-lg text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                    >
                        無料でアカウント作成
                    </button>
                    <p className="mt-4 text-slate-500 text-sm">クレジットカード登録不要 • 1分で完了</p>
                </div>
            </div>
        </div>
    );
};

export default Features;
