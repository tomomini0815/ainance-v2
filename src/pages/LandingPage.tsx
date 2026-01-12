import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Menu, X, Play, Zap, Brain, BarChart3, ShieldCheck, FileText, MessageSquare, Receipt, TrendingUp, Check, ChevronRight, Star } from 'lucide-react';
import { SmoothScroll } from '../components/ui/SmoothScroll';
import { CustomCursor } from '../components/ui/CustomCursor';
import { MagneticButton } from '../components/ui/MagneticButton';
import { useAuth } from '../hooks/useAuth';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  // Parallax effects
  const yHero = useTransform(scrollYProgress, [0, 0.5], [0, -150]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scaleImage = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  // ログイン済みの場合はダッシュボードへリダイレクト
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 認証チェック中はローディング画面を表示
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-400 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証済みの場合（リダイレクト待ち）
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-400 font-medium">ダッシュボードへ移動中...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Receipt,
      title: 'スマートレシート処理',
      description: 'レシートを撮影するだけ。AIが瞬時に金額・日付・品目を読み取り、自動で仕訳を作成。手入力の手間を99%削減。',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
    },
    {
      icon: MessageSquare,
      title: 'チャット経理',
      description: '「今日のランチ代1,200円」と話しかけるだけ。音声やテキストで自然に取引を記録できます。',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
    {
      icon: FileText,
      title: 'ワンクリック請求書',
      description: 'プロフェッショナルな請求書をテンプレートから簡単作成。PDF出力からメール送付まで完全自動化。',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      title: 'AI経営分析',
      description: '収支・キャッシュフローをリアルタイム可視化。AIがあなたのビジネスに最適なアドバイスを提案。',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-400',
    },
  ];

  const benefits = [
    '月額料金なし、完全無料で始められる',
    'スマホ・PC、どこからでもアクセス可能',
    'データは暗号化して安全に保管',
    'いつでもデータのエクスポートが可能',
  ];

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#030014] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
        <CustomCursor />

        {/* Animated Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Primary gradient orb */}
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-gradient-to-b from-indigo-600/30 via-purple-600/20 to-transparent blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }}></div>

          {/* Secondary orbs */}
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 blur-[100px] rounded-full"></div>
          <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 blur-[80px] rounded-full"></div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>

          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>
        </div>

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#030014]/80 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
          <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
            <MagneticButton className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Ainance</span>
              </div>
            </MagneticButton>

            <div className="hidden md:flex items-center space-x-1">
              {['機能', '使い方', 'サポート'].map((item) => (
                <button key={item} className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                  {item}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2">
                ログイン
              </button>
              <MagneticButton onClick={() => navigate('/signup')}>
                <div className="group relative px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full font-medium text-sm text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 overflow-hidden">
                  <span className="relative z-10">無料で始める</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </MagneticButton>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white z-50"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 right-0 bg-[#030014]/95 backdrop-blur-xl border-b border-white/5 p-6"
            >
              <div className="flex flex-col space-y-4">
                {['機能', '使い方', 'サポート'].map((item) => (
                  <button key={item} className="text-left py-2 text-gray-300 hover:text-white transition-colors">{item}</button>
                ))}
                <hr className="border-white/10" />
                <button onClick={() => navigate('/login')} className="py-2 text-gray-300 hover:text-white transition-colors text-left">ログイン</button>
                <button onClick={() => navigate('/signup')} className="py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full font-medium text-white">無料で始める</button>
              </div>
            </motion.div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 px-6 overflow-hidden">
          <motion.div
            style={{ y: yHero, opacity: opacityHero }}
            className="max-w-[1000px] mx-auto text-center relative z-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full mb-8 backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-sm font-medium text-indigo-300">次世代AI経理プラットフォーム</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8"
            >
              <span className="bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
                経理を、
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                もっとシンプルに。
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              レシート処理から請求書作成、経営分析まで。
              <br className="hidden sm:block" />
              AIがあなたの経理業務をまるごとサポートします。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => navigate('/signup')}
                className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full font-semibold text-lg text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center space-x-2 overflow-hidden"
              >
                <span className="relative z-10">無料で始める</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button className="group w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm">
                <Play className="w-5 h-5 fill-current" />
                <span>使い方を見る</span>
              </button>
            </motion.div>

            {/* Benefits list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            >
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-500">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Dashboard Image */}
          <motion.div
            style={{ scale: scaleImage }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
            className="mt-16 sm:mt-24 max-w-[1200px] mx-auto relative z-10"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-[80px] rounded-full transform scale-110"></div>

              {/* Browser frame */}
              <div className="relative bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
                {/* Browser header */}
                <div className="flex items-center space-x-2 px-4 py-3 bg-[#0f0f0f] border-b border-white/5">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1.5 bg-[#1a1a1a] rounded-lg text-xs text-gray-500 font-mono">
                      ainance.jp/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="aspect-[16/9] bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
                  <img
                    src="/assets/hero_devices_v4.png"
                    alt="Ainance Dashboard"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 px-6 relative">
          <div className="max-w-[1200px] mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16 sm:mb-20">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm font-medium text-indigo-400 mb-6"
              >
                機能紹介
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight"
              >
                経理業務を、
                <br className="sm:hidden" />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">まるごとサポート。</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 max-w-2xl mx-auto text-lg"
              >
                面倒な手作業はAIにおまかせ。
                あなたは本業に集中できます。
              </motion.p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden"
                >
                  {/* Hover gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white group-hover:text-white transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                  {/* Learn more link */}
                  <div className="mt-6 flex items-center text-sm font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>詳しく見る</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32 px-6 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 via-purple-600/5 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full"></div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-8 shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              さあ、始めましょう。
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
              今すぐ無料で登録して、Ainanceの全ての機能をお試しください。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="group relative w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full font-bold text-lg text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">無料で始める</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              クレジットカードの登録は不要です
            </p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5 bg-[#030014]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">Ainance</span>
              </div>

              {/* Links */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
                <a href="#" className="hover:text-white transition-colors">利用規約</a>
                <a href="#" className="hover:text-white transition-colors">お問い合わせ</a>
                <a href="#" className="hover:text-white transition-colors">特定商取引法に基づく表記</a>
              </div>

              {/* Copyright */}
              <div className="text-sm text-gray-600">
                © 2025 Ainance. All rights reserved.
              </div>
            </div>
          </div>
        </footer>

      </div>
    </SmoothScroll>
  );
};

export default LandingPage;