import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Camera, MessageSquare, FileText, PieChart, ChevronDown, ChevronRight } from 'lucide-react';

const FeatureHelp: React.FC = () => {
    const navigate = useNavigate();
    const [openSections, setOpenSections] = useState<number[]>([0]);
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleSection = (index: number) => {
        setOpenSections(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const toggleItem = (key: string) => {
        setOpenItems(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const sections = [
        {
            icon: Camera,
            title: 'レシート読取・入力',
            items: [
                {
                    title: 'レシートの撮影方法',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400 leading-relaxed">スマホカメラでレシートを撮影するだけで、AIが自動的に内容を読み取り、仕訳データを作成します。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>ホーム画面の「レシート読取」ボタンをタップします。</li>
                                <li>カメラが起動したら、レシート全体が画面内に収まるようにフレーミングします。</li>
                                <li>ピントが合っていることを確認し、シャッターボタンをタップします。</li>
                                <li>プレビューで問題なければ「解析する」をタップします。</li>
                                <li>AIが処理を行い、数秒で仕訳候補が表示されます。</li>
                            </ol>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
                                <h4 className="font-bold mb-2 text-blue-400">精度向上のコツ</h4>
                                <ul className="text-slate-300 text-sm space-y-1">
                                    <li>• 明るい場所で撮影する</li>
                                    <li>• レシートを平らに置く</li>
                                    <li>• シワや折り目は伸ばす</li>
                                    <li>• 手の影が入らないようにする</li>
                                </ul>
                            </div>
                        </div>
                    )
                },
                {
                    title: '読み取り精度の向上について',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">読み取り精度を最大限に引き出すためのポイントをご紹介します。</p>
                            <div className="space-y-4">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <h4 className="font-bold mb-2 text-white">📸 撮影環境</h4>
                                    <ul className="text-slate-300 text-sm space-y-1">
                                        <li>• 自然光または明るい照明の下で撮影</li>
                                        <li>• フラッシュは反射するため避ける</li>
                                        <li>• 白い背景の上にレシートを置く</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <h4 className="font-bold mb-2 text-white">📄 レシートの状態</h4>
                                    <ul className="text-slate-300 text-sm space-y-1">
                                        <li>• シワ・折り目・破れを可能な限り直す</li>
                                        <li>• 感熱紙の退色したレシートは早めに読み取る</li>
                                        <li>• 濡れたレシートは乾かしてから撮影</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: '手動での入力方法',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">レシートがない場合や、読み取りがうまくいかない場合は手動入力が可能です。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>ホーム画面の「＋」ボタンをタップします。</li>
                                <li>「手動入力」を選択します。</li>
                                <li>日付、金額、勘定科目を入力します。</li>
                                <li>必要に応じて、取引先やメモを追加します。</li>
                                <li>「保存」をタップして完了です。</li>
                            </ol>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mt-4">
                                <p className="text-emerald-400 text-sm">💡 よく使う取引は「テンプレート」として保存すると、次回から素早く入力できます。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'CSVデータのインポート',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">他の会計ソフトや銀行明細からデータを一括取り込みできます。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>「設定」→「データ管理」→「インポート」を開きます。</li>
                                <li>「テンプレートをダウンロード」でCSVテンプレートを入手します。</li>
                                <li>テンプレートに従ってデータを入力します。</li>
                                <li>「ファイルを選択」からCSVをアップロードします。</li>
                                <li>プレビューで確認し、「インポート実行」をクリックします。</li>
                            </ol>
                            <p className="text-slate-500 text-sm mt-4">※一度に最大500件まで取り込み可能です。</p>
                        </div>
                    )
                }
            ]
        },
        {
            icon: MessageSquare,
            title: 'チャット経理',
            items: [
                {
                    title: 'チャット機能の使い方',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">自然な日本語で話しかけるだけで、AIが仕訳を自動作成します。</p>
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <p className="text-slate-300 mb-2">入力例:</p>
                                <p className="text-white font-mono bg-slate-900 p-2 rounded">「今日カフェで1,200円払った」</p>
                                <div className="mt-3 text-sm text-slate-400">
                                    <p>↓ AIが解析</p>
                                    <div className="mt-2 bg-indigo-900/30 p-2 rounded border border-indigo-500/20">
                                        <p>勘定科目: 会議費</p>
                                        <p>金額: ¥1,200</p>
                                        <p>適用: カフェ</p>
                                    </div>
                                </div>
                            </div>
                            <ul className="text-slate-300 text-sm space-y-1 mt-4">
                                <li>• 「昨日の交通費800円」のように日付も認識します</li>
                                <li>• 「◯◯社への外注費5万円」のように取引先も入力できます</li>
                            </ul>
                        </div>
                    )
                },
                {
                    title: '音声入力のコツ',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">マイクアイコンをタップして話しかけるだけで入力できます。</p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
                                <li>静かな環境で、ゆっくり話す</li>
                                <li>「日付」「金額」「内容」を明確に伝える</li>
                                <li>例: 「きょう タクシーだい にせんえん」</li>
                            </ul>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-4">
                                <p className="text-amber-400 text-sm">認識がうまくいかない場合は、数字をゆっくり区切って発音してください。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'LINE連携の設定',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">LINEからレシート画像を送信するだけで自動記帳できます。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>「設定」→「外部連携」→「LINE連携」を開きます。</li>
                                <li>表示されたQRコードをLINEで読み取ります。</li>
                                <li>Ainance公式アカウントを友だち追加します。</li>
                                <li>LINEトーク画面からレシート画像を送信できるようになります。</li>
                            </ol>
                        </div>
                    )
                },
                {
                    title: '不明な仕訳の質問方法',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">経理処理で迷ったときは、チャットで質問できます。</p>
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <p className="text-slate-300 text-sm">質問例:</p>
                                <ul className="text-white text-sm space-y-2 mt-2">
                                    <li>「この領収書は経費になる？」</li>
                                    <li>「接待の勘定科目は何？」</li>
                                    <li>「家事按分の計算方法を教えて」</li>
                                </ul>
                            </div>
                            <p className="text-slate-400 text-sm mt-4">AIが税務知識に基づいて回答します。ただし、複雑なケースは税理士にご相談ください。</p>
                        </div>
                    )
                }
            ]
        },
        {
            icon: FileText,
            title: '確定申告・書類作成',
            items: [
                {
                    title: '確定申告書の作成手順',
                    content: (
                        <div className="space-y-4">
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>メニューから「確定申告」を選択します。</li>
                                <li>申告年度を選択し、基本情報を確認・入力します。</li>
                                <li>収支内訳（売上・経費）を確認します。</li>
                                <li>各種控除（医療費、寄付金等）を入力します。</li>
                                <li>「申告書作成」をクリックしてPDFを生成します。</li>
                            </ol>
                            <div className="bg-slate-800/50 rounded-xl p-4 mt-4">
                                <p className="text-slate-300 text-sm">生成されたPDFは税務署への提出や、e-Taxでのアップロードに使用できます。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'e-Taxへの連携方法',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">作成した申告書をe-Taxで電子申告できます。</p>
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <h4 className="font-bold mb-2 text-white">必要なもの</h4>
                                <ul className="text-slate-300 text-sm space-y-1">
                                    <li>• マイナンバーカード</li>
                                    <li>• 対応スマートフォン（NFCリーダー機能付き）</li>
                                    <li>• e-Tax利用者識別番号</li>
                                </ul>
                            </div>
                            <ol className="list-decimal list-inside text-slate-300 space-y-2 ml-2 mt-4">
                                <li>確定申告画面で「e-Tax連携」をクリック</li>
                                <li>マイナンバーカードで本人認証</li>
                                <li>申告データを送信</li>
                            </ol>
                        </div>
                    )
                },
                {
                    title: 'インボイス対応請求書の作成',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">適格請求書（インボイス）の要件を満たした請求書を作成できます。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>「請求書作成」メニューから「新規作成」を選択します。</li>
                                <li>取引先を選択または新規登録します。</li>
                                <li>品目、数量、税率、金額を入力します。</li>
                                <li>登録番号は設定から自動反映されます。</li>
                                <li>「発行」をクリックでPDFまたはメール送信できます。</li>
                            </ol>
                        </div>
                    )
                },
                {
                    title: '各種帳票のダウンロード',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">会計処理に必要な帳票を出力できます。</p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
                                <li>総勘定元帳</li>
                                <li>仕訳帳</li>
                                <li>残高試算表</li>
                                <li>貸借対照表</li>
                                <li>損益計算書</li>
                            </ul>
                            <p className="text-slate-500 text-sm mt-4">「レポート」→「帳票出力」から期間を選択し、PDFまたはCSV形式でダウンロードできます。</p>
                        </div>
                    )
                }
            ]
        },
        {
            icon: PieChart,
            title: '分析・レポート',
            items: [
                {
                    title: 'ダッシュボードの見方',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">ダッシュボードでは、経営状況を一目で把握できます。</p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
                                <li><strong>今月の収支サマリー</strong> - 売上、経費、利益を表示</li>
                                <li><strong>キャッシュフローグラフ</strong> - 月次の入金・出金推移</li>
                                <li><strong>直近のタスク</strong> - 未処理の仕訳、期限間近の請求書</li>
                                <li><strong>通知</strong> - お知らせ、アラート</li>
                            </ul>
                        </div>
                    )
                },
                {
                    title: '経営レポートの活用',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">AIが自動生成する経営レポートで、ビジネスを分析できます。</p>
                            <div className="space-y-3">
                                <div className="bg-slate-800/50 rounded-xl p-3">
                                    <h4 className="font-bold text-white text-sm">月次推移表</h4>
                                    <p className="text-slate-400 text-sm">売上・経費の月別推移を確認</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3">
                                    <h4 className="font-bold text-white text-sm">経費内訳分析</h4>
                                    <p className="text-slate-400 text-sm">カテゴリ別の支出割合を可視化</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3">
                                    <h4 className="font-bold text-white text-sm">得意先別売上</h4>
                                    <p className="text-slate-400 text-sm">顧客ごとの売上貢献度を分析</p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: '資金繰り予測について',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">入金予定・支払予定から、将来のキャッシュフローを予測します。</p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
                                <li>3ヶ月先までの残高推移を予測</li>
                                <li>資金不足リスクをアラートで通知</li>
                                <li>大きな支払いがある月を事前に把握</li>
                            </ul>
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mt-4">
                                <p className="text-rose-400 text-sm">⚠️ 予測残高がマイナスになる可能性がある場合、ダッシュボードに警告が表示されます。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'カスタムレポートの作成',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">独自の分析軸でレポートを作成できます。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>「レポート」→「カスタム作成」を開きます。</li>
                                <li>分析軸（期間、勘定科目、取引先等）を選択します。</li>
                                <li>表示する指標（金額、件数、平均等）を選択します。</li>
                                <li>グラフの種類（棒、線、円等）を選択します。</li>
                                <li>「保存」で定期的に確認できるようになります。</li>
                            </ol>
                        </div>
                    )
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>サポートトップに戻る</span>
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                            <Settings className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">機能・操作方法</h1>
                            <p className="text-slate-400">レシート読取、チャット経理、確定申告機能の使い方</p>
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    {sections.map((section, sectionIndex) => (
                        <motion.div
                            key={sectionIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: sectionIndex * 0.1 + 0.2 }}
                            className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden"
                        >
                            <button
                                onClick={() => toggleSection(sectionIndex)}
                                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <section.icon className="w-6 h-6 text-indigo-400" />
                                    <h2 className="text-xl font-bold">{section.title}</h2>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSections.includes(sectionIndex) ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <AnimatePresence>
                                {openSections.includes(sectionIndex) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 space-y-3">
                                            {section.items.map((item, itemIndex) => {
                                                const itemKey = `${sectionIndex}-${itemIndex}`;
                                                const isOpen = openItems.includes(itemKey);
                                                return (
                                                    <div key={itemIndex} className="border border-white/5 rounded-xl overflow-hidden">
                                                        <button
                                                            onClick={() => toggleItem(itemKey)}
                                                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <ChevronRight
                                                                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                                                                />
                                                                <span className="text-slate-200">{item.title}</span>
                                                            </div>
                                                        </button>
                                                        <AnimatePresence>
                                                            {isOpen && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="px-4 pb-4 pt-2 text-slate-300 text-sm border-t border-white/5 bg-white/[0.02]">
                                                                        {item.content}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeatureHelp;
