import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Menu, X, Play, Zap, Brain, BarChart3, Clock, CheckCircle2, Smartphone, Globe } from 'lucide-react';
import { SmoothScroll } from '../components/ui/SmoothScroll';
import { CustomCursor } from '../components/ui/CustomCursor';
import { MagneticButton } from '../components/ui/MagneticButton';
import { TextReveal } from '../components/ui/TextReveal';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { scrollYProgress } = useScroll();

  // Smooth scroll progress for parallax
  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const yMockup = useTransform(scrollYProgress, [0, 0.4], [0, -150]);
  const rotateMockup = useTransform(scrollYProgress, [0, 0.4], [0, 10]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Simulate loading for preloader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#030712] text-white overflow-hidden font-sans selection:bg-blue-500/30 cursor-none">
        <CustomCursor />

        {/* Preloader */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
              className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            >
              <div className="relative">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="w-64 h-1 bg-white origin-left"
                />
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-4 left-0 text-sm font-mono text-gray-400"
                >
                  LOADING EXPERIENCE...
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-white mix-blend-difference z-[100] origin-left"
          style={{ scaleX: scrollYProgress }}
        />

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'
          }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <MagneticButton className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="flex items-center space-x-3 group">
                  <div className="relative w-10 h-10 overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-white group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-black">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold tracking-tighter mix-blend-difference">Ainance</span>
                </div>
              </MagneticButton>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <MagneticButton onClick={() => navigate('/login')}>
                  <span className="text-sm font-medium text-white px-4 py-2">Login</span>
                </MagneticButton>
                <MagneticButton onClick={() => navigate('/dashboard')}>
                  <div className="px-6 py-2.5 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-200 transition-colors">
                    Get Started
                  </div>
                </MagneticButton>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-white z-50 relative"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-[150px]"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          </div>

          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                style={{ y: yHero, opacity: opacityHero }}
                className="space-y-10 text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2 }}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-medium text-gray-300 tracking-wide">AI-POWERED ACCOUNTING</span>
                </motion.div>

                <div className="space-y-4">
                  <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tighter">
                    <TextReveal text="The Future" delay={2.4} />
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                      <TextReveal text="of Finance" delay={2.6} />
                    </span>
                    <TextReveal text="is Here." delay={2.8} />
                  </h1>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.0 }}
                  className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
                >
                  AIが経理業務を自動化し、個人事業主から法人まで、あらゆる事業者の成長をサポート。時間と手間を大幅に削減し、経営に集中できます。
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.2 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
                >
                  <MagneticButton onClick={() => {
                    // ログイン状態を確認し、必要に応じてログインページにリダイレクト
                    const user = localStorage.getItem('user');
                    if (user) {
                      navigate('/dashboard');
                    } else {
                      navigate('/login');
                    }
                  }}>
                    <div className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 group">
                      <span>Start Free Trial</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </MagneticButton>

                  <MagneticButton onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
                    <div className="px-8 py-4 bg-transparent border border-white/20 rounded-full font-bold text-lg hover:bg-white/5 transition-colors flex items-center space-x-2">
                      <Play className="w-5 h-5 fill-current" />
                      <span>Watch Demo</span>
                    </div>
                  </MagneticButton>
                </motion.div>
              </motion.div>

              {/* Hero 3D Mockup */}
              <motion.div
                style={{ y: yMockup, rotateX: rotateMockup, scale: scaleHero }}
                className="relative hidden lg:block perspective-1000"
              >
                <motion.div
                  initial={{ opacity: 0, rotateX: 20, y: 100 }}
                  animate={{ opacity: 1, rotateX: 5, y: 0 }}
                  transition={{ delay: 2.5, duration: 1.5, ease: "easeOut" }}
                  className="relative z-10 transform-style-3d group"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl transform translate-y-10 group-hover:blur-2xl transition-all duration-700"></div>
                  {/* Macbook Pro Mockup */}
                  <div className="w-full rounded-2xl shadow-2xl border border-[#1e293b] relative z-10 bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center min-h-[400px] overflow-hidden">
                    {/* Macbook Pro Screen */}
                    <div className="w-full h-full bg-black rounded-b-2xl rounded-t-sm overflow-hidden relative">
                      <img
                        src="/assets/real_dashboard_desktop.png"
                        alt="Ainance Dashboard on Macbook Pro"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="text-center p-8"><div class="text-4xl mb-4">📊</div><p class="text-gray-400">Dashboard Preview</p></div>';
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.log('Macbook dashboard image loaded successfully:', target.src);
                        }}
                      />
                      {/* Macbook Pro Notch */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-2xl"></div>
                    </div>
                    {/* Macbook Pro Bottom */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-4/5 h-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full"></div>
                  </div>

                  {/* Mobile Mockup Overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="absolute -bottom-16 -right-8 w-[35%] rounded-[2.5rem] shadow-2xl border-[8px] border-[#1e293b] z-20 transform group-hover:translate-y-[-10px] transition-transform duration-700 bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center aspect-[9/16]"
                  >
                    <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden relative">
                      <img
                        src="/assets/real_dashboard_mobile.png"
                        alt="Ainance Mobile Dashboard"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="text-center p-4"><div class="text-2xl mb-2">📱</div><p class="text-gray-400 text-xs">Mobile Preview</p></div>';
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.log('Mobile dashboard image loaded successfully:', target.src);
                        }}
                      />
                      {/* Mobile Notch */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-black rounded-full"></div>
                    </div>
                  </motion.div>

                  {/* Floating Cards */}
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-12 -right-12 p-6 bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Growth</p>
                        <p className="text-2xl font-bold text-white">+128%</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>




        {/* Features Bento Grid - Enhanced */}
        <section id="features" className="py-32 relative bg-gradient-to-b from-[#030712] via-[#050b1d] to-[#030712]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400 tracking-wide">POWERFUL FEATURES</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tighter">
                経理業務を革新する
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  AI搭載機能
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                最先端のAI技術で、経理業務の効率を劇的に向上させます
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
              {/* Large Feature 1 - AI Processing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2 row-span-2 rounded-[2rem] bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/5 p-10 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                      <Zap className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                      AIによる超高速処理
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                      レシート・請求書を瞬時に読み取り、自動で仕訳。
                      <span className="text-white font-semibold"> 99.2%の精度</span>で処理し、
                      <span className="text-blue-400 font-semibold"> 入力時間を80%削減</span>。
                      経理の専門知識がなくても、プロ並みの精度で処理できます。
                    </p>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">複数フォーマット対応（PDF、画像、スキャン）</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">手書き文字も高精度で認識</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">一括アップロードで大量処理も瞬時に完了</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Small Feature 1 - Smart Categorization - Extended */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="row-span-2 rounded-[2rem] bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/5 p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/40 transition-all duration-500" />
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Brain className="w-7 h-7 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">スマートな自動分類</h3>
                    <p className="text-gray-400 leading-relaxed mb-6">
                      AIが支出を<span className="text-purple-400 font-semibold">99以上のカテゴリ</span>に自動分類。
                      学習機能で使うほど精度が向上します。
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-gray-300">勘定科目を自動提案</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-gray-300">税区分も自動判定</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-gray-300">過去の仕訳から学習</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Medium Feature - Real-time Analytics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/5 p-10 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex items-center justify-between h-full">
                  <div className="max-w-xl">
                    <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">リアルタイム経営分析</h3>
                    <p className="text-gray-400 text-lg leading-relaxed mb-6">
                      キャッシュフロー、損益、予算進捗を<span className="text-blue-400 font-semibold">リアルタイムで可視化</span>。
                      経営判断に必要な情報を、いつでもどこでも確認できます。
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-xs text-gray-400">月次レポート</p>
                        <p className="text-lg font-bold text-white">自動生成</p>
                      </div>
                      <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-xs text-gray-400">予測精度</p>
                        <p className="text-lg font-bold text-green-400">95%+</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <TrendingUp className="w-40 h-40 text-white/5 group-hover:text-blue-500/20 transition-colors duration-500" />
                  </div>
                </div>
              </motion.div>

              {/* Small Feature 2 - Time Saving */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="rounded-[2rem] bg-[#0f172a] border border-white/5 p-8 relative overflow-hidden group hover:border-orange-500/30 transition-colors"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-500/40 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">圧倒的な時短効果</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    月末処理が<span className="text-orange-400 font-semibold">3日→30分</span>に。
                    空いた時間を本業に集中できます。
                  </p>
                </div>
              </motion.div>

              {/* Large Feature 2 - Multi-device */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-white/5 p-10 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex items-center justify-between h-full">
                  <div className="max-w-xl">
                    <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Smartphone className="w-7 h-7 text-purple-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">どこでも、いつでも</h3>
                    <p className="text-gray-400 text-lg leading-relaxed mb-6">
                      PC、スマホ、タブレット。すべてのデバイスで<span className="text-purple-400 font-semibold">完全同期</span>。
                      外出先でもレシート撮影→即座に記帳完了。
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span>iOS / Android</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span>Web / Desktop</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Globe className="w-32 h-32 text-white/5 group-hover:text-purple-500/20 group-hover:rotate-12 transition-all duration-500" />
                  </div>
                </div>
              </motion.div>

              {/* Small Feature 3 - Integration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="rounded-[2rem] bg-[#0f172a] border border-white/5 p-8 relative overflow-hidden group hover:border-cyan-500/30 transition-colors"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/40 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">豊富な連携機能</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    銀行・クレカ・会計ソフトと<span className="text-cyan-400 font-semibold">シームレス連携</span>。
                    データ入力の手間を完全に排除。
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mobile App Showcase (Parallax) */}
        <section className="py-32 relative overflow-hidden bg-gradient-to-b from-[#030712] to-[#0f172a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative order-2 lg:order-1"
              >
                <div className="relative z-10">
                  <div className="w-full max-w-md mx-auto rounded-[3rem] shadow-2xl border-[8px] border-[#1e293b] relative z-10 bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center aspect-[9/16] min-h-[500px]">
                    <img
                      src="/assets/real_dashboard_mobile.png"
                      alt="Mobile App"
                      className="w-full h-full object-cover rounded-[3rem]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="text-center p-8"><div class="text-4xl mb-4">📱</div><p class="text-gray-400">Mobile App Preview</p></div>';
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.log('Mobile app image loaded successfully:', target.src);
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-blue-500/30 rounded-[3rem] blur-3xl transform translate-y-10"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8 text-center lg:text-left order-1 lg:order-2"
              >
                <h2 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tighter">
                  いつでもどこでも経理業務 <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">シームレスに。</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                  直感的なモバイルアプリで、Ainanceのパワーを指先に。出張中でも会議中でも、リアルタイムで経費追跡、取引承認、経営洞察を手に入れることができます。
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050b1d] to-[#030712]"></div>
          <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <h2 className="text-5xl sm:text-7xl font-bold mb-8 tracking-tighter">
                あなたのビジネスを <br />
                次のレベルへ。
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Ainanceで経理業務の自動化を体験し、手間のかかるルーティンワークから解放され、本当に重要な仕事に集中しましょう。
              </p>

              <div className="flex justify-center">
                <MagneticButton onClick={() => navigate('/dashboard')}>
                  <div className="relative px-12 py-6 bg-white text-black rounded-full font-bold text-xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 group-hover:text-white transition-colors">Get Started for Free</span>
                  </div>
                </MagneticButton>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5 bg-[#020617]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="w-5 h-5 text-gray-400" />
              <span className="font-bold text-gray-400">Ainance</span>
            </div>
            <div className="flex space-x-8 text-sm text-gray-500">
              <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </footer>

        <style>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-3d {
            transform-style: preserve-3d;
          }
          img {
            image-rendering: -webkit-optimize-contrast;
          }
        `}</style>
      </div>
    </SmoothScroll>
  );
};

export default LandingPage;