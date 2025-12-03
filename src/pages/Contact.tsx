import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare, Send, MapPin, Phone, Clock, CheckCircle } from 'lucide-react';

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

    const contactMethods = [
        {
            icon: Mail,
            title: 'メール',
            content: 'support@ainance.jp',
            description: '24時間以内に返信します'
        },
        {
            icon: Phone,
            title: '電話',
            content: '03-1234-5678',
            description: '平日 10:00 - 18:00'
        },
        {
            icon: MapPin,
            title: '所在地',
            content: '東京都千代田区千代田1-1-1',
            description: 'Ainanceビル 5F'
        },
        {
            icon: Clock,
            title: '営業時間',
            content: '平日 10:00 - 18:00',
            description: '土日祝日は休業'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#030712] to-[#0f172a] text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-500/20 mb-6">
                        <MessageSquare className="w-10 h-10 text-purple-400" />
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
                        お問い合わせ
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
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
                        <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                                <Send className="w-6 h-6 text-blue-400" />
                                <span>メッセージを送る</span>
                            </h2>

                            {isSubmitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">送信完了</h3>
                                    <p className="text-gray-400">
                                        お問い合わせありがとうございます。
                                        <br />
                                        24時間以内に返信いたします。
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                            お名前 <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#030712]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            placeholder="山田 太郎"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                            メールアドレス <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#030712]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            placeholder="example@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                                            件名 <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-[#030712]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            placeholder="お問い合わせ内容"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                                            メッセージ <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={6}
                                            className="w-full px-4 py-3 bg-[#030712]/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                            placeholder="お問い合わせ内容を詳しくお書きください"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
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

                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="space-y-6"
                    >
                        <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6">その他のお問い合わせ方法</h2>
                            <div className="space-y-6">
                                {contactMethods.map((method, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                                        className="flex items-start space-x-4 p-4 rounded-xl bg-[#030712]/30 border border-white/5 hover:border-white/10 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                            <method.icon className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold mb-1">{method.title}</h3>
                                            <p className="text-white mb-1">{method.content}</p>
                                            <p className="text-sm text-gray-400">{method.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* FAQ Link */}
                        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8">
                            <h3 className="text-xl font-bold mb-3">よくある質問</h3>
                            <p className="text-gray-300 mb-6">
                                お問い合わせの前に、よくある質問をご確認ください。
                                多くの疑問がすぐに解決できます。
                            </p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium transition-colors"
                            >
                                FAQを見る
                            </button>
                        </div>

                        {/* Response Time Info */}
                        <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                            <div className="flex items-start space-x-3">
                                <Clock className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold mb-2">返信時間について</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        通常、お問い合わせから24時間以内に返信いたします。
                                        営業時間外や休業日にいただいたお問い合わせは、翌営業日以降の対応となります。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Map Section (Placeholder) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="bg-[#0f172a]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 overflow-hidden"
                >
                    <h2 className="text-2xl font-bold mb-6">アクセス</h2>
                    <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl flex items-center justify-center border border-white/5">
                        <div className="text-center">
                            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">東京都千代田区千代田1-1-1</p>
                            <p className="text-sm text-gray-500 mt-2">Ainanceビル 5F</p>
                        </div>
                    </div>
                    <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-300">最寄り駅</p>
                                <p className="text-gray-400">東京駅 徒歩5分</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-300">駐車場</p>
                                <p className="text-gray-400">ビル地下に有料駐車場あり</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
