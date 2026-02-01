import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Wallet, Receipt, ChevronDown, ChevronRight } from 'lucide-react';

const PaymentHelp: React.FC = () => {
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
            icon: Wallet,
            title: 'プラン・料金',
            items: [
                {
                    title: '料金プラン一覧',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400 mb-4">Ainanceでは、個人事業主から中小企業まで幅広くご利用いただける3つのプランをご用意しています。</p>
                            <div className="grid gap-4">
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-white">フリープラン</h4>
                                        <span className="text-emerald-400 font-bold">¥0/月</span>
                                    </div>
                                    <ul className="text-slate-400 text-sm space-y-1">
                                        <li>• 月10枚までのレシート読取</li>
                                        <li>• 3ヶ月のデータ保存</li>
                                        <li>• 基本的な経費管理機能</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-indigo-900/30 rounded-xl border border-indigo-500/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white">スタンダード</h4>
                                            <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded">人気</span>
                                        </div>
                                        <span className="text-indigo-400 font-bold">¥980/月</span>
                                    </div>
                                    <ul className="text-slate-300 text-sm space-y-1">
                                        <li>• 無制限のレシート読取</li>
                                        <li>• 無制限のデータ保存</li>
                                        <li>• 確定申告書類の自動生成</li>
                                        <li>• 経営分析レポート</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-white">チームプラン</h4>
                                        <span className="text-amber-400 font-bold">¥2,980/月</span>
                                    </div>
                                    <ul className="text-slate-400 text-sm space-y-1">
                                        <li>• スタンダードの全機能</li>
                                        <li>• 最大3ユーザーまで利用可能</li>
                                        <li>• 権限管理機能</li>
                                        <li>• 優先サポート</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: '無料プランと有料プランの違い',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">主な違いを比較表でご確認ください。</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-2 text-slate-400">機能</th>
                                            <th className="text-center py-2 text-slate-400">フリー</th>
                                            <th className="text-center py-2 text-indigo-400">スタンダード</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-300">
                                        <tr className="border-b border-white/5">
                                            <td className="py-2">レシート読取</td>
                                            <td className="text-center">10枚/月</td>
                                            <td className="text-center text-indigo-400">無制限</td>
                                        </tr>
                                        <tr className="border-b border-white/5">
                                            <td className="py-2">データ保存</td>
                                            <td className="text-center">3ヶ月</td>
                                            <td className="text-center text-indigo-400">無制限</td>
                                        </tr>
                                        <tr className="border-b border-white/5">
                                            <td className="py-2">確定申告</td>
                                            <td className="text-center">-</td>
                                            <td className="text-center text-indigo-400">✓</td>
                                        </tr>
                                        <tr className="border-b border-white/5">
                                            <td className="py-2">経営分析</td>
                                            <td className="text-center">-</td>
                                            <td className="text-center text-indigo-400">✓</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2">サポート</td>
                                            <td className="text-center">メール</td>
                                            <td className="text-center text-indigo-400">優先チャット</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'プランの変更・アップグレード',
                    content: (
                        <div className="space-y-4">
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>「設定」→「プラン管理」を開きます。</li>
                                <li>「プランを変更する」ボタンをクリックします。</li>
                                <li>希望するプランを選択し、「このプランに変更」をクリックします。</li>
                                <li>決済情報を確認して完了します。</li>
                            </ol>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
                                <h4 className="font-bold mb-2 text-blue-400">日割り計算について</h4>
                                <p className="text-slate-300 text-sm">月途中でアップグレードした場合、その月の残り日数分のみ請求されます。ダウングレードの場合は次の請求日から適用されます。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: '解約について',
                    content: (
                        <div className="space-y-4">
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>「設定」→「プラン管理」を開きます。</li>
                                <li>「プランを解約する」リンクをクリックします。</li>
                                <li>簡単なアンケートにお答えください。</li>
                                <li>確認画面で「解約する」をクリックして完了です。</li>
                            </ol>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-4">
                                <h4 className="font-bold mb-2 text-amber-400">注意事項</h4>
                                <ul className="text-slate-300 text-sm space-y-1">
                                    <li>• 解約後も契約期間終了までは有料機能をご利用いただけます。</li>
                                    <li>• フリープランに移行後、3ヶ月を超えたデータは削除されます。</li>
                                    <li>• データのエクスポートは解約前に行ってください。</li>
                                </ul>
                            </div>
                        </div>
                    )
                }
            ]
        },
        {
            icon: CreditCard,
            title: 'お支払い方法',
            items: [
                {
                    title: '利用可能なクレジットカード',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">以下のクレジットカードブランドがご利用いただけます。</p>
                            <div className="flex flex-wrap gap-3">
                                {['Visa', 'Mastercard', 'American Express', 'JCB', 'Diners Club'].map(card => (
                                    <span key={card} className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-medium">{card}</span>
                                ))}
                            </div>
                            <p className="text-slate-500 text-sm">※デビットカード、プリペイドカードも利用可能です。</p>
                        </div>
                    )
                },
                {
                    title: 'カード情報の変更',
                    content: (
                        <div className="space-y-4">
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>「設定」→「お支払い設定」を開きます。</li>
                                <li>「カード情報を編集」をクリックします。</li>
                                <li>新しいカード番号、有効期限、セキュリティコードを入力します。</li>
                                <li>「更新する」をクリックして完了です。</li>
                            </ol>
                            <p className="text-slate-500 text-sm mt-4">次回の請求から新しいカードに変更されます。</p>
                        </div>
                    )
                },
                {
                    title: '銀行振込での支払い',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">チームプランの年間契約をご希望の法人様に限り、銀行振込でのお支払いに対応しております。</p>
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <h4 className="font-bold mb-2 text-white">お申し込み方法</h4>
                                <p className="text-slate-300 text-sm">お問い合わせフォームより「銀行振込での支払い希望」とご連絡ください。担当者よりご案内いたします。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'お支払い日の確認',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">有料プランを申し込んだ日が毎月の更新日・お支払い日となります。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-2 ml-2">
                                <li>「設定」→「プラン管理」を開きます。</li>
                                <li>「次回請求日」欄で確認できます。</li>
                            </ol>
                            <p className="text-slate-500 text-sm mt-4">例：1月15日に申し込んだ場合、毎月15日がお支払い日となります。</p>
                        </div>
                    )
                }
            ]
        },
        {
            icon: Receipt,
            title: '請求書・領収書',
            items: [
                {
                    title: '利用料金の請求書発行',
                    content: (
                        <div className="space-y-4">
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>「設定」→「お支払い履歴」を開きます。</li>
                                <li>請求書を発行したい月の行を探します。</li>
                                <li>「請求書」アイコンをクリックします。</li>
                                <li>PDFがダウンロードされます。</li>
                            </ol>
                            <p className="text-slate-500 text-sm mt-4">宛名の変更が必要な場合は、事前に「請求先情報」を更新してください。</p>
                        </div>
                    )
                },
                {
                    title: '領収書のダウンロード',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">「設定」→「お支払い履歴」から該当取引の「領収書」アイコンをクリックしてダウンロードできます。</p>
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <p className="text-slate-300 text-sm">領収書は決済完了後にダウンロード可能になります。クレジットカード決済の場合、通常1〜2営業日でステータスが「完了」に変わります。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: '適格請求書（インボイス）の発行',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">当社は適格請求書発行事業者として登録されています。</p>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                <p className="text-emerald-400 font-mono text-lg">登録番号: T1234567890123</p>
                            </div>
                            <p className="text-slate-300 text-sm">発行される請求書・領収書には自動的に登録番号が記載されます。仕入税額控除の適用要件を満たす書類としてご利用いただけます。</p>
                        </div>
                    )
                },
                {
                    title: '過去の請求履歴の確認',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">「設定」→「お支払い設定」→「お支払い履歴」で過去の請求履歴を一覧で確認できます。</p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
                                <li>請求日</li>
                                <li>請求金額</li>
                                <li>ステータス（完了/保留/失敗）</li>
                                <li>請求書・領収書ダウンロード</li>
                            </ul>
                            <p className="text-slate-500 text-sm mt-4">履歴は過去24ヶ月分まで保存されています。</p>
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
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">料金・お支払い</h1>
                            <p className="text-slate-400">プラン、お支払い方法、請求書・領収書について</p>
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
                                    <section.icon className="w-6 h-6 text-emerald-400" />
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

export default PaymentHelp;
