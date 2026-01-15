import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Lock, Settings, UserPlus, ChevronDown, ChevronRight } from 'lucide-react';

const AccountHelp: React.FC = () => {
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
            icon: UserPlus,
            title: '登録・ログイン',
            items: [
                {
                    title: 'アカウントの作成方法',
                    content: (
                        <div className="space-y-6">
                            <p className="text-slate-400 leading-relaxed">
                                Ainanceへの登録は非常にシンプルです。メールアドレス、またはGoogle/Appleアカウントを使用して、数分で完了します。
                            </p>
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-white">手順（メールアドレスで登録）</h3>
                                <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                    <li>トップページの「無料で始める」または「新規登録」ボタンをクリックします。</li>
                                    <li>「メールアドレスで登録」を選択します。</li>
                                    <li>メールアドレスと、希望するパスワードを入力します。</li>
                                    <li>「登録する」ボタンをクリックすると、入力したメールアドレス宛に確認メールが送信されます。</li>
                                    <li>メール内のリンクをクリックし、メールアドレスの認証を完了してください。</li>
                                </ol>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-white">手順（ソーシャルアカウントで登録）</h3>
                                <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                    <li>登録画面で「Googleで登録」または「Appleで登録」ボタンをクリックします。</li>
                                    <li>各プラットフォームの認証画面が表示されるので、指示に従ってログイン・許可を行ってください。</li>
                                    <li>自動的にAinanceのダッシュボードへリダイレクトされ、登録が完了します。</li>
                                </ol>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                <h4 className="font-bold mb-2 text-blue-400">注意点</h4>
                                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                                    <li>1つのメールアドレスにつき、作成できるアカウントは1つまでです。</li>
                                    <li>確認メールが届かない場合は、迷惑メールフォルダをご確認ください。</li>
                                </ul>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'ログインできない場合',
                    content: (
                        <div className="space-y-6">
                            <p className="text-slate-400 leading-relaxed">
                                ログインができない原因として、いくつかの可能性が考えられます。以下の項目を順にご確認ください。
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold mb-2 text-white">1. メールアドレス・パスワードの誤入力</h3>
                                    <p className="text-slate-400">全角・半角の違いや、大文字・小文字の区別（CapsLockがオンになっていないか）をご確認ください。</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2 text-white">2. パスワードをお忘れの場合</h3>
                                    <p className="text-slate-400">ログイン画面の「パスワードをお忘れの方」リンクから、パスワードの再設定を行ってください。</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2 text-white">3. ソーシャルログインで登録した場合</h3>
                                    <p className="text-slate-400">GoogleやAppleでアカウントを作成された場合、メールアドレスとパスワードによるログインはできません。登録時と同じソーシャルボタンからログインしてください。</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2 text-white">4. アカウントがロックされている場合</h3>
                                    <p className="text-slate-400">セキュリティ保護のため、ログインの試行に複数回失敗すると、一時的にアカウントがロックされます。しばらく時間を置いてから再度お試しください。</p>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
                                <p className="text-slate-300 text-sm">上記を確認しても解決しない場合は、<button onClick={() => navigate('/contact')} className="text-indigo-400 hover:underline">お問い合わせフォーム</button>より詳細な状況をご連絡ください。</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'ソーシャルログインの設定',
                    content: (
                        <div className="space-y-6">
                            <p className="text-slate-400 leading-relaxed">
                                既存のAinanceアカウントにGoogleやAppleのアカウントを連携させることで、より簡単にログインできるようになります。
                            </p>
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-white">連携の手順</h3>
                                <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                    <li>Ainanceにログインし、「設定」＞「アカウント設定」を開きます。</li>
                                    <li>「外部サービス連携」セクションを探します。</li>
                                    <li>連携したいサービス（Googleなど）の「連携する」ボタンをクリックします。</li>
                                    <li>各サービスの認証画面で許可を行うと、連携が完了します。</li>
                                </ol>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-white">連携の解除</h3>
                                <p className="text-slate-400">同じく「外部サービス連携」セクションから、いつでも連携を解除することができます。「解除」ボタンをクリックしてください。</p>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                                <h4 className="font-bold mb-2 text-purple-400">注意点</h4>
                                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                                    <li>ソーシャルログインのみでアカウント作成した場合、すべての連携を解除することはできません。</li>
                                    <li>事前にメールアドレスとパスワードを設定することで、連携を解除できるようになります。</li>
                                </ul>
                            </div>
                        </div>
                    )
                },
                {
                    title: '二段階認証の設定方法',
                    content: (
                        <div className="space-y-6">
                            <p className="text-slate-400 leading-relaxed">
                                アカウントのセキュリティを強化するため、二段階認証（2FA）の設定を強く推奨しています。
                            </p>
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-white">設定手順</h3>
                                <ol className="list-decimal list-inside text-slate-300 space-y-3 ml-2">
                                    <li>「設定」＞「セキュリティ」を開きます。</li>
                                    <li>「二段階認証」の項目にある「設定する」ボタンをクリックします。</li>
                                    <li>認証アプリ（Google Authenticator, Authyなど）でお手持ちのスマホからQRコードを読み取ります。</li>
                                    <li>アプリに表示された6桁のコードを入力し、設定を完了します。</li>
                                </ol>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-white">バックアップコードについて</h3>
                                <p className="text-slate-400">設定完了時に表示されるバックアップコードは、スマホを紛失した際などにログインするために必要となります。必ず安全な場所に保管してください。</p>
                            </div>
                        </div>
                    )
                }
            ]
        },
        {
            icon: Lock,
            title: 'パスワード・セキュリティ',
            items: [
                {
                    title: 'パスワードの変更方法',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">定期的なパスワード変更でセキュリティを強化しましょう。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-2 ml-2">
                                <li>「設定」→「セキュリティ」→「パスワード変更」を開く</li>
                                <li>現在のパスワードを入力</li>
                                <li>新しいパスワードを入力（8文字以上、英数字混合推奨）</li>
                                <li>「変更する」をクリックして完了</li>
                            </ol>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-4">
                                <p className="text-amber-400 text-sm">推奨: 英大文字・小文字・数字・記号を含む12文字以上のパスワード</p>
                            </div>
                        </div>
                    )
                },
                {
                    title: 'パスワードを忘れた場合',
                    content: (
                        <div className="space-y-4">
                            <ol className="list-decimal list-inside text-slate-300 space-y-2 ml-2">
                                <li>ログイン画面で「パスワードを忘れた方」をクリック</li>
                                <li>登録済みのメールアドレスを入力</li>
                                <li>届いたメールのリンクから新しいパスワードを設定</li>
                            </ol>
                            <p className="text-slate-500 text-sm mt-4">※メールが届かない場合は迷惑メールフォルダをご確認ください。リンクの有効期限は24時間です。</p>
                        </div>
                    )
                },
                {
                    title: 'ログイン履歴の確認',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">過去のログイン日時、デバイス、IPアドレスを確認できます。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-2 ml-2">
                                <li>「設定」→「セキュリティ」→「ログイン履歴」を開く</li>
                                <li>過去30日間のログイン記録が表示されます</li>
                                <li>不審なログインがあれば、すぐにパスワードを変更してください</li>
                            </ol>
                        </div>
                    )
                },
                {
                    title: '不審なアクセスへの対処',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">身に覚えのないログインを発見した場合、すぐに以下の対応を行ってください。</p>
                            <ol className="list-decimal list-inside text-slate-300 space-y-2 ml-2">
                                <li>すぐにパスワードを変更してください</li>
                                <li>二段階認証を有効にしてください</li>
                                <li>他のサービスで同じパスワードを使用している場合は変更を推奨</li>
                                <li>不正な取引がないか確認してください</li>
                            </ol>
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mt-4">
                                <p className="text-rose-400 text-sm">深刻な被害が疑われる場合は、すぐにサポートまでご連絡ください。</p>
                            </div>
                        </div>
                    )
                }
            ]
        },
        {
            icon: Settings,
            title: 'アカウント設定',
            items: [
                {
                    title: 'プロフィール情報の変更',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">「設定」→「プロフィール」から以下の情報を変更できます。</p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
                                <li>表示名</li>
                                <li>プロフィール画像</li>
                                <li>事業所名・住所</li>
                                <li>業種・規模</li>
                            </ul>
                        </div>
                    )
                },
                {
                    title: 'メールアドレスの変更',
                    content: (
                        <div className="space-y-4">
                            <ol className="list-decimal list-inside text-slate-300 space-y-2 ml-2">
                                <li>「設定」→「アカウント設定」→「メールアドレス変更」を開く</li>
                                <li>新しいメールアドレスを入力</li>
                                <li>確認メールが届いたらリンクをクリックして完了</li>
                            </ol>
                            <p className="text-slate-500 text-sm mt-4">※変更が完了するまでは、古いメールアドレスでログインが可能です。</p>
                        </div>
                    )
                },
                {
                    title: '通知設定の変更',
                    content: (
                        <div className="space-y-4">
                            <p className="text-slate-400">「設定」→「通知設定」から以下を設定できます。</p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-2">
                                <li>メール通知のオン/オフ</li>
                                <li>プッシュ通知のオン/オフ</li>
                                <li>通知する内容の選択（取引完了、申告時期、キャンペーン等）</li>
                            </ul>
                        </div>
                    )
                },
                {
                    title: '退会手続きについて',
                    content: (
                        <div className="space-y-4">
                            <ol className="list-decimal list-inside text-slate-300 space-y-2 ml-2">
                                <li>「設定」→「アカウント設定」→「退会」を開く</li>
                                <li>注意事項を確認し、パスワードを入力</li>
                                <li>「退会する」をクリック</li>
                            </ol>
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mt-4">
                                <p className="text-rose-400 text-sm">⚠️ 退会するとすべてのデータが削除され、復元できません。退会前にデータのエクスポートを推奨します。</p>
                            </div>
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
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <User className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">アカウント・登録</h1>
                            <p className="text-slate-400">登録方法、パスワードリセット、アカウント設定など</p>
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

export default AccountHelp;
