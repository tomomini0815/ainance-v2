import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Laptop, Smartphone, Monitor } from 'lucide-react';

const MultiDevice: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/support')}
                        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>サポートトップに戻る</span>
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Monitor className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">複数のデバイスで利用できますか？</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            はい、Ainanceはクラウドサービスですので、1つのアカウントで複数のデバイスからアクセスし、データを同期してご利用いただけます。
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mb-10">
                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <Smartphone className="w-8 h-8 text-indigo-400 mb-4" />
                                <h3 className="font-bold mb-2">スマートフォン（外出先）</h3>
                                <p className="text-slate-400 text-sm">
                                    領収書の撮影や、ちょっとした隙間時間の入力に最適です。移動中にチャットで経費申請を行うこともできます。
                                </p>
                            </div>
                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <Laptop className="w-8 h-8 text-emerald-400 mb-4" />
                                <h3 className="font-bold mb-2">パソコン（オフィス・自宅）</h3>
                                <p className="text-slate-400 text-sm">
                                    じっくりと経営分析を行ったり、大量のデータを編集したり、決算書類を作成する場合に便利です。
                                </p>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-4 text-white">同期について</h2>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mb-8 ml-4">
                            <li>データはクラウド上で安全に一元管理されています。</li>
                            <li>スマホで入力した直後にパソコンで見ても、最新の情報が反映されます。</li>
                            <li>同期のための特別な操作（保存ボタンを押すなど）は基本的に不要です。</li>
                        </ul>

                        <h2 className="text-xl font-bold mb-4 text-white">利用台数の制限</h2>
                        <p className="text-slate-400 mb-4">
                            スタンダードプラン以上では、同時にログインできるデバイス数に制限はありません。チームプランをご利用の場合は、複数人で同時にアクセスし、共同で作業することも可能です。
                        </p>

                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-2 text-indigo-400">セキュリティに関する推奨事項</h3>
                            <p className="text-slate-300 text-sm">
                                公共のパソコン（ネットカフェなど）で利用した際は、必ずログアウトすることを忘れないでください。また、2段階認証を設定することで、セキュリティをより強化することができます。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MultiDevice;
