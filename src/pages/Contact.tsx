import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Send, CheckCircle, HelpCircle } from 'lucide-react';

const Contact: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitted(false);
        }, 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };



    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-indigo-500/10">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-500/10 mb-6">
                        <MessageSquare className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
                        お問い合わせ
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        ご質問やご相談がございましたら、お気軽にお問い合わせください。
                        <br />
                        専門スタッフが丁寧にサポートいたします。
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 mb-20">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                                <Send className="w-6 h-6 text-indigo-400" />
                                <span>メッセージを送る</span>
                            </h2>

                            {isSubmitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">送信完了</h3>
                                    <p className="text-slate-400">
                                        お問い合わせありがとうございます。
                                        <br />
                                        24時間以内に返信いたします。
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                            お名前 <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            placeholder="山田 太郎"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                            メールアドレス <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            placeholder="example@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                                            件名 <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            placeholder="お問い合わせ内容"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                                            メッセージ <span className="text-rose-400">*</span>
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={6}
                                            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                            placeholder="お問い合わせ内容を詳しくお書きください"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>送信中...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>送信する</span>
                                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-sm text-gray-500 text-center">
                                        送信いただいた情報は、
                                        <button
                                            type="button"
                                            onClick={() => navigate('/privacy')}
                                            className="text-blue-400 hover:text-blue-300 underline"
                                        >
                                            プライバシーポリシー
                                        </button>
                                        に基づき管理されます。
                                    </p>
                                </form>
                            )}
                        </div>
                    </motion.div>

                    {/* FAQ Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="h-full"
                    >
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 h-full flex flex-col">
                            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                                <HelpCircle className="w-6 h-6 text-indigo-400" />
                                <span>よくある質問</span>
                            </h2>

                            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="p-4 rounded-xl bg-[#030712]/30 border border-white/5">
                                    <h3 className="font-bold mb-2 text-white">アカウント登録は無料ですか？</h3>
                                    <p className="text-sm text-slate-400">はい、初期登録は完全に無料です。有料プランへのアップグレードもいつでも可能です。</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#030712]/30 border border-white/5">
                                    <h3 className="font-bold mb-2 text-white">セキュリティ対策は万全ですか？</h3>
                                    <p className="text-sm text-slate-400">通信の暗号化やデータのバックアップなど、金融機関レベルのセキュリティ対策を講じています。</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#030712]/30 border border-white/5">
                                    <h3 className="font-bold mb-2 text-white">インボイス制度に対応していますか？</h3>
                                    <p className="text-sm text-slate-400">はい、完全対応しています。適格請求書の発行や保存要件を満たした機能を提供しています。</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#030712]/30 border border-white/5">
                                    <h3 className="font-bold mb-2 text-white">サポートの対応時間を教えてください。</h3>
                                    <p className="text-sm text-slate-400">平日10:00〜18:00となっております。お問い合わせフォームからは24時間受け付けております。</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#030712]/30 border border-white/5">
                                    <h3 className="font-bold mb-2 text-white">退会はいつでもできますか？</h3>
                                    <p className="text-sm text-slate-400">はい、マイページの設定画面からいつでも退会手続きが可能です。解約金などは一切かかりません。</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
