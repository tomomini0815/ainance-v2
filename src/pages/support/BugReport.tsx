import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bug } from 'lucide-react';

const BugReport: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support/troubleshooting')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>トラブルシューティングに戻る</span>
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Bug className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">バグの報告</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            アプリやWebサイトで予期しない動作やエラーを発見した場合は、ぜひご報告ください。
                        </p>

                        <h2 className="text-xl font-bold mb-4 text-white">報告方法</h2>
                        <ol className="list-decimal list-inside text-slate-300 space-y-4 mb-8 ml-4">
                            <li>
                                <button onClick={() => navigate('/contact')} className="text-indigo-400 hover:underline">
                                    お問い合わせフォーム
                                </button>
                                からご連絡ください。
                            </li>
                            <li>お問い合わせ種別で「バグ・不具合報告」を選択してください。</li>
                            <li>以下の情報をできるだけ詳しくお知らせください：
                                <ul className="list-disc list-inside ml-4 mt-2 text-slate-400 text-sm">
                                    <li>発生した日時</li>
                                    <li>どの画面で発生したか</li>
                                    <li>どのような操作をしたか</li>
                                    <li>表示されたエラーメッセージ</li>
                                    <li>お使いの端末・ブラウザ</li>
                                </ul>
                            </li>
                        </ol>

                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mt-8">
                            <p className="text-slate-300 text-sm">
                                スクリーンショットを添付いただけると、調査がスムーズに進みます。ご協力ありがとうございます。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BugReport;
