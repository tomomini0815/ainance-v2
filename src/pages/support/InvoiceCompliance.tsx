import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';

const InvoiceCompliance: React.FC = () => {
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
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">インボイス制度への対応について</h1>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Ainanceは、2023年10月から開始されたインボイス制度（適格請求書等保存方式）に完全対応しています。受け取った請求書の保存、発行する請求書の作成の両面でサポートを提供します。
                        </p>

                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-white">1. 適格請求書発行事業者登録番号の登録</h2>
                                <p className="text-slate-400 mb-4">
                                    設定画面の「事業所設定」から、貴社の適格請求書発行事業者登録番号（Tから始まる13桁の番号）を登録してください。登録された番号は、作成する請求書に自動的に記載されます。
                                </p>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold mb-4 text-white">2. 受領した領収書・請求書の保存</h2>
                                <p className="text-slate-400 mb-4">
                                    AI-OCR機能により、スキャンした領収書や請求書から「登録番号」を自動で検出します。また、国税庁のデータベースと照合し、有効な事業者かどうかのチェックも行います。
                                </p>
                                <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                                    <li>登録番号の自動読取</li>
                                    <li>事業者名の自動照合</li>
                                    <li>保存要件を満たした電子保存</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold mb-4 text-white">3. 適格請求書の発行</h2>
                                <p className="text-slate-400 mb-4">
                                    請求書作成機能を使用することで、インボイス制度の要件（税率ごとの消費税額の記載など）を満たした適格請求書を簡単に作成できます。
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mt-12">
                            <h3 className="text-lg font-bold mb-2 text-blue-400">ご不明な点がある場合</h3>
                            <p className="text-slate-300 text-sm">
                                インボイス制度自体の詳細については、国税庁の特設サイトをご確認いただくか、税理士にご相談ください。Ainanceの操作方法については、サポートまでお問い合わせください。
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default InvoiceCompliance;
