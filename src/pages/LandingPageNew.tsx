import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Menu, X, Play, Receipt, MessageSquare, Zap, Globe } from 'lucide-react';
import { SmoothScroll } from '../components/ui/SmoothScroll';
import { useAuth } from '../hooks/useAuth';
import { DashboardMockup } from '../components/hero/DashboardMockup';

const LandingPageNew: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();

    // Parallax & Scroll Effects
    const yHero = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    if (authLoading || isAuthenticated) return null;

    return (
        <SmoothScroll>
            <div className="min-h-screen bg-[#06040A] text-white font-sans selection:bg-cyan-500/30 selection:text-white overflow-x-hidden">

                {/* Background Ambient Glow - Optimized for depth */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[150px] mix-blend-screen opacity-60"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-900/10 rounded-full blur-[150px] mix-blend-screen opacity-60"></div>
                    <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-cyan-900/5 rounded-full blur-[100px] mix-blend-screen opacity-40"></div>
                </div>

                {/* Navbar - Minimal & Glass */}
                <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06040A]/80 backdrop-blur-xl">
                    <div className="max-w-[1400px] mx-auto px-6 h-20 flex justify-between items-center">
                        <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium tracking-tight text-white/80 group-hover:text-white transition-colors">Ainance <span className="opacity-50">AI</span></span>
                        </div>

                        <div className="hidden md:flex items-center space-x-1">
                            {['プラットフォーム', 'ソリューション', 'リソース', '料金プラン'].map((item, i) => (
                                <button key={i} className="px-5 py-2 text-sm text-white/60 hover:text-white transition-colors relative group">
                                    {item}
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-1/2"></span>
                                </button>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            <button onClick={() => navigate('/login')} className="text-sm text-white/80 hover:text-white transition-colors">
                                ログイン
                            </button>
                            <button onClick={() => navigate('/signup')} className="px-5 py-2 text-sm bg-white text-black rounded-full hover:bg-white/90 transition-colors font-medium">
                                無料で始める
                            </button>
                        </div>

                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white/80 hover:text-white">
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </nav>

                {/* Hero Section - Spatial & Typography Driven */}
                <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
                    <div className="max-w-[1400px] w-full mx-auto grid lg:grid-cols-2 gap-20 items-center">

                        <motion.div style={{ y: yHero, opacity: opacityHero }} className="z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    <span className="text-xs font-mono text-white/70 uppercase tracking-wider">Intelligence V2.0 Online</span>
                                </div>

                                <h1 className="text-6xl md:text-8xl font-medium tracking-tight leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50">
                                    Accounting <br />
                                    <span className="italic font-serif font-light text-white/80">Reimagined.</span>
                                </h1>

                                <p className="text-lg text-white/60 max-w-md leading-relaxed mb-10">
                                    空間デザインと金融知能の融合。<br />
                                    あなたの思考速度で機能する、AI駆動の次世代経理システム。
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => navigate('/signup')} className="group px-8 py-4 bg-white text-black rounded-full font-medium flex items-center justify-center hover:bg-white/90 transition-all">
                                        無料で始める
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button className="px-8 py-4 border border-white/10 rounded-full font-medium text-white hover:bg-white/5 transition-all flex items-center justify-center backdrop-blur-sm">
                                        <Play className="mr-2 w-4 h-4 fill-white" /> デモを見る
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Abstract 3D/Spatial Visual Representation - Holographic Command Center */}
                        <div className="relative h-[600px] w-full hidden lg:block perspective-1000">
                            <motion.div
                                animate={{
                                    rotateY: [0, 5, 0, -5, 0],
                                    rotateX: [0, -2, 0, 2, 0],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative w-full h-full transform-style-3d"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, z: 0 }}
                                    animate={{ opacity: 1, scale: 1, z: 20 }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] origin-center"
                                >
                                    <DashboardMockup />
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ticker */}
                <div className="border-y border-white/5 bg-white/[0.02]">
                    <div className="max-w-[1400px] mx-auto px-6 py-8 flex items-center justify-between text-white/30 text-sm font-mono uppercase tracking-widest overflow-hidden">
                        <span>Automated</span>
                        <span>•</span>
                        <span>Intelligent</span>
                        <span>•</span>
                        <span>Secure</span>
                        <span>•</span>
                        <span>Scalable</span>
                        <span className="hidden md:inline">•</span>
                        <span className="hidden md:inline">Real-time</span>
                    </div>
                </div>

                {/* Features BENTO Grid */}
                <section className="py-32 px-6">
                    <div className="max-w-[1400px] mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-20"
                        >
                            <h2 className="text-4xl md:text-5xl font-medium mb-6">Designed for <br /><span className="text-white/50">clarity in chaos.</span></h2>
                            <p className="text-lg text-white/60 max-w-2xl">
                                複雑化する経理業務を、驚くほどシンプルに。<br />
                                最先端のAI技術が、あなたのビジネスに「透明性」と「速度」をもたらします。
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
                            {/* Feature 1 - Large */}
                            <div className="md:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-10 relative overflow-hidden group hover:border-white/20 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                            <Receipt className="text-white w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-medium mb-2">Smart OCR Engine</h3>
                                        <p className="text-white/60 max-w-sm">
                                            独自の視覚処理パイプラインが、超人的な精度でデータを抽出。<br />
                                            レシート、請求書、手書きメモ——すべてを一瞬でデジタル化します。
                                        </p>
                                    </div>
                                    <div className="w-full h-48 bg-black/40 rounded-xl border border-white/5 overflow-hidden relative">
                                        <div className="absolute top-4 left-4 right-4 h-2 bg-white/10 rounded-full animate-pulse"></div>
                                        <div className="absolute top-8 left-4 w-2/3 h-2 bg-white/10 rounded-full animate-pulse delay-75"></div>
                                        <div className="absolute top-12 left-4 w-1/2 h-2 bg-white/10 rounded-full animate-pulse delay-150"></div>

                                        {/* Scan line */}
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent -translate-y-full animate-[scan_2s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 - Tall */}
                            <div className="md:row-span-1 rounded-3xl bg-white/5 border border-white/10 p-10 relative overflow-hidden group hover:border-white/20 transition-colors">
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                            <Zap className="text-white w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-medium mb-2">Real-time Sync</h3>
                                        <p className="text-white/60">
                                            思考の速度でデータを同期。<br />
                                            すべてのデバイスで、ゼロ・レイテンシーの体験を。
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="relative w-32 h-32">
                                            <div className="absolute inset-0 border-2 border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                            <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
                                            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono">SYNC</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="rounded-3xl bg-white/5 border border-white/10 p-10 relative overflow-hidden group hover:border-white/20 transition-colors">
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                        <MessageSquare className="text-white w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-medium mb-2">Voice Interface</h3>
                                    <p className="text-white/60 mb-8">
                                        「タクシー代 2,500円」<br />
                                        文脈を理解する自然言語処理で、話すだけで経理が完了します。
                                    </p>
                                    <div className="flex space-x-1 items-end h-8">
                                        {[1, 2, 3, 4, 5, 4, 3, 2].map((h, i) => (
                                            <div key={i} className="w-1 bg-white/80 rounded-full animate-[bounce_1s_ease-in-out_infinite]" style={{ height: h * 4 + 'px', animationDelay: i * 0.1 + 's' }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Feature 4 - Wide */}
                            <div className="md:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-10 relative overflow-hidden group hover:border-white/20 transition-colors flex items-center">
                                <div className="relative z-10 w-1/2 pr-10">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                        <Globe className="text-white w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-medium mb-2">Global Compliance</h3>
                                    <p className="text-white/60">
                                        インボイス制度、電子帳簿保存法に完全対応。<br />
                                        法改正への追従も、システムが自動で行います。
                                    </p>
                                </div>
                                <div className="relative w-1/2 h-full flex items-center justify-center">
                                    {/* Simple Map Visualization */}
                                    <div className="w-full h-32 bg-white/5 rounded-lg border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-purple-500 rounded-full animate-ping delay-300"></div>
                                        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-green-500 rounded-full animate-ping delay-700"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer - Minimal */}
                <footer className="border-t border-white/5 py-20 bg-black">
                    <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-4 gap-12 text-sm text-white/50">
                        <div className="col-span-1 md:col-span-2">
                            <div className="text-white text-xl font-medium mb-6">Ainance</div>
                            <p className="max-w-xs mb-8">
                                空間デザインと高度なAIを通じて、金融インテリジェンスの未来を切り拓く。
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                                <a href="#" className="hover:text-white transition-colors">Github</a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">機能一覧</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">料金プラン</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">セキュリティ</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">ロードマップ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">会社概要</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">採用情報</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">ブログ</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
                            </ul>
                        </div>
                    </div>
                </footer>
            </div>
        </SmoothScroll>
    );
};

export default LandingPageNew;
