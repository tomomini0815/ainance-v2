import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertCircle, WifiOff, RefreshCw, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

const Troubleshooting: React.FC = () => {
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
            icon: AlertTriangle,
            title: 'よくあるエラー',
            items: [
                {
                    title: '「ログインに失敗しました」と表示される',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">以下の原因が考えられます。順番に確認してください。</p>
                            <div className="space-y-3">
                                <div className="bg-slate-800/50 rounded-xl p-3">
                                    <h4 className="font-bold text-white text-sm mb-1">1. メールアドレス・パスワードの確認</h4>
                                    <p className="text-slate-400 text-sm">入力ミス、全角/半角、大文字/小文字を確認してください。</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3">
                                    <h4 className="font-bold text-white text-sm mb-1">2. Caps Lockの確認</h4>
                                    <p className="text-slate-400 text-sm">Caps Lockがオンになっていないか確認してください。</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3">
                                    <h4 className="font-bold text-white text-sm mb-1">3. パスワードの再設定</h4>
                                    <p className="text-slate-400 text-sm">忘れた場合は「パスワードを忘れた」から再設定できます。</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3">
                                    <h4 className="font-bold text-white text-sm mb-1">4. アカウントロック</h4>
                                    <p className="text-slate-400 text-sm">5回連続失敗で一時ロック。30分後に再試行してください。</p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: '画像のアップロードに失敗する',
                    content: (
                        <div className="space-y-4">
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
                                <li><strong>ファイルサイズ:</strong> 10MB以下かご確認ください</li>
                                <li><strong>対応形式:</strong> JPEG, PNG, HEIC のみ対応しています</li>
                                <li><strong>ネット環境:</strong> 安定した接続環境で再試行してください</li>
                                <li><strong>アプリ再起動:</strong> アプリを完全に終了し、再度起動してみてください</li>
                            </ul>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
                                <p className="text-blue-400 text-sm">💡 大きな画像は自動圧縮されますが、極端に高解像度な画像は事前にリサイズすることをお勧めします。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: '連携ボタンが反応しない',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">外部サービスとの連携ボタンが動作しない場合の対処法です。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>ページを再読み込み（Ctrl+R / Cmd+R）してください</li>
                                <li>別のブラウザ（Chrome, Safari, Edge）で試してください</li>
                                <li>広告ブロッカーを一時的に無効化してください</li>
                                <li>ブラウザのキャッシュとCookieをクリアしてください</li>
                                <li>アプリの場合は最新版にアップデートしてください</li>
                            </ol>
                        </div>
                    )
                },
                {
                    title: '画面が真っ白になる',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">画面が真っ白、または読み込みが止まる場合の対処法です。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li><strong>再読み込み:</strong> Ctrl+R（Mac: Cmd+R）を押す</li>
                                <li><strong>キャッシュクリア:</strong> Ctrl+Shift+Delete でキャッシュを削除</li>
                                <li><strong>JavaScript確認:</strong> ブラウザでJavaScriptが有効か確認</li>
                                <li><strong>別ブラウザ:</strong> 他のブラウザで試してください</li>
                            </ol>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-4">
                                <p className="text-amber-400 text-sm">それでも改善しない場合は、サポートまでご連絡ください。</p>
                            </div>
                        </div>
                    )
                }
            ]
        },
        {
            icon: WifiOff,
            title: '接続・同期の問題',
            items: [
                {
                    title: 'オフラインモードと表示される',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">「オフラインモード」と表示される場合は、インターネット接続を確認してください。</p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
                                <li>Wi-Fiまたはモバイルデータがオンになっているか確認</li>
                                <li>機内モードがオフになっているか確認</li>
                                <li>他のサイト（google.com等）にアクセスできるか確認</li>
                                <li>ルーターを再起動してみる</li>
                            </ul>
                            <p className="text-slate-500 text-sm mt-4">オフラインモードで入力したデータは、接続回復後に自動的に同期されます。</p>
                        </div>
                    )
                },
                {
                    title: 'データが同期されない',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">複数デバイス間でデータが反映されない場合の確認事項です。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>両方のデバイスで同じアカウントにログインしているか確認</li>
                                <li>画面右上の「更新」ボタン（回転矢印）を押してみる</li>
                                <li>アプリやブラウザを一度終了して再起動する</li>
                                <li>インターネット接続を確認する</li>
                            </ol>
                        </div>
                    )
                },
                {
                    title: '銀行口座との連携エラー',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">銀行連携でエラーが発生する場合の原因と対処法です。</p>
                            <div className="space-y-3">
                                <div className="bg-slate-800/50 rounded-xl p-3">
                                    <h4 className="font-bold text-white text-sm mb-1">パスワード変更</h4>
                                    <p className="text-slate-400 text-sm">金融機関でパスワードを変更した場合は、再連携が必要です。</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3">
                                    <h4 className="font-bold text-white text-sm mb-1">二段階認証の追加</h4>
                                    <p className="text-slate-400 text-sm">金融機関で2FAを追加した場合も再連携が必要です。</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3">
                                    <h4 className="font-bold text-white text-sm mb-1">対処方法</h4>
                                    <p className="text-slate-400 text-sm">「設定」→「外部連携」→該当の銀行で「再連携」をお試しください。</p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: '動作が遅い・重い',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">アプリやサイトの動作が遅い場合の改善方法です。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                <li>インターネット接続速度を確認（10Mbps以上推奨）</li>
                                <li>不要なブラウザタブを閉じる</li>
                                <li>ブラウザのキャッシュをクリアする</li>
                                <li>アプリを最新版にアップデートする</li>
                                <li>デバイスを再起動する</li>
                            </ol>
                            <p className="text-slate-500 text-sm mt-4">大量のデータがある場合、初回読み込みに時間がかかることがあります。</p>
                        </div>
                    )
                }
            ]
        },
        {
            icon: RefreshCw,
            title: 'アプリ・システム',
            items: [
                {
                    title: 'アプリのアップデート方法',
                    content: (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <h4 className="font-bold text-white text-sm mb-2">iOSの場合</h4>
                                    <ol className="list-decimal list-inside text-slate-400 text-sm space-y-1">
                                        <li>App Storeを開く</li>
                                        <li>右上のプロフィールアイコンをタップ</li>
                                        <li>Ainanceを探して「アップデート」をタップ</li>
                                    </ol>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <h4 className="font-bold text-white text-sm mb-2">Androidの場合</h4>
                                    <ol className="list-decimal list-inside text-slate-400 text-sm space-y-1">
                                        <li>Google Playストアを開く</li>
                                        <li>Ainanceを検索</li>
                                        <li>「更新」をタップ</li>
                                    </ol>
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                <p className="text-emerald-400 text-sm">💡 自動更新を有効にすると、常に最新版を利用できます。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: '推奨環境について',
                    content: (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <h4 className="font-bold text-white text-sm mb-2">ブラウザ</h4>
                                    <ul className="text-slate-400 text-sm space-y-1">
                                        <li>• Google Chrome（最新版）</li>
                                        <li>• Safari（最新版）</li>
                                        <li>• Microsoft Edge（最新版）</li>
                                        <li>• Firefox（最新版）</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <h4 className="font-bold text-white text-sm mb-2">スマートフォン</h4>
                                    <ul className="text-slate-400 text-sm space-y-1">
                                        <li>• iOS 15.0 以降</li>
                                        <li>• Android 10.0 以降</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                                <p className="text-rose-400 text-sm">⚠️ Internet Explorerは非対応です。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'キャッシュのクリア方法',
                    content: (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <h4 className="font-bold text-white text-sm mb-2">Chrome</h4>
                                    <p className="text-slate-400 text-sm">設定 → プライバシーとセキュリティ → 閲覧履歴データの削除</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <h4 className="font-bold text-white text-sm mb-2">Safari</h4>
                                    <p className="text-slate-400 text-sm">Safari → 設定 → プライバシー → Webサイトデータを管理</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <h4 className="font-bold text-white text-sm mb-2">Edge</h4>
                                    <p className="text-slate-400 text-sm">設定 → プライバシー → 閲覧データをクリア</p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'バグの報告',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">バグを発見された場合は、以下の情報を添えてお問い合わせください。</p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
                                <li>発生日時</li>
                                <li>どの画面で発生したか</li>
                                <li>どのような操作をしたか</li>
                                <li>表示されたエラーメッセージ（あれば）</li>
                                <li>お使いの端末・ブラウザ情報</li>
                            </ul>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
                                <p className="text-blue-400 text-sm">📸 スクリーンショットや画面録画があると、より迅速に対応できます。</p>
                            </div>
                            <button
                                onClick={() => navigate('/contact')}
                                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                お問い合わせフォームへ
                            </button>
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
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-rose-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">トラブルシューティング</h1>
                            <p className="text-slate-400">よくある問題と解決方法</p>
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
                                    <section.icon className="w-6 h-6 text-rose-400" />
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

export default Troubleshooting;
