import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Menu, X, Play, FileText, MessageSquare, Receipt, TrendingUp, Check, ChevronRight, Calculator, LogIn } from 'lucide-react';
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

  // ... (rest of logic up to line 125)
  // (Skipping to keep context clear, but I'll make sure the file remains valid)
  // Wait, I need to provide the full replacement or a good chunk.

  // Let's re-view the file to see where the benefits end and navigation starts to ensure I don't break anything.
  // Benefits end at line 123. Navigation starts at 143.

  // I will replace from line 1 to line 203 to include the new import and menu logic.
  // Actually, I should probably use multi_replace for better precision if I want to keep the benefit array etc.
  // But replace_file_content is okay if I provide the correct range.

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証済みの場合（リダイレクト待ち）
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin"></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">ダッシュボードへ移動中...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Receipt,
      title: 'AIレシート読取',
      description: 'スマホで撮影するだけで、日付・金額・支払先をAIが自動認識。面倒な手入力を99%削減し、CSV出力も可能です。',
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-500/10',
      iconColor: 'text-indigo-400',
    },
    {
      icon: MessageSquare,
      title: '音声・チャット経理',
      description: '「タクシー代 1500円」と話しかけるだけで記帳完了。LINE感覚で、移動中や隙間時間にサクッと経理処理ができます。',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Calculator,
      title: '確定申告サポート',
      description: '質問に答えるだけのウィザード形式で、青色・白色申告書類を自動作成。控除の計算からe-Tax用データ出力まで対応。',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
    },
    {
      icon: FileText,
      title: '請求書・見積書作成',
      description: 'インボイス制度対応の請求書・見積書をワンクリックで作成。PDF変換機能も標準搭載し、業務時間を大幅短縮。',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      title: '経営分析ダッシュボード',
      description: '売上・経費・利益の推移をリアルタイムでグラフ化。月ごとの収支状況を一目で把握し、データに基づいた経営判断を。',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
    },
    {
      icon: Sparkles,
      title: '補助金マッチング',
      description: 'あなたの事業プロフィールに基づき、受給可能な補助金・助成金をAIが提案。申請に必要な情報の整理もサポート。',
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-500/10',
      iconColor: 'text-rose-400',
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
      <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
        <CustomCursor />

        {/* Animated Background - Indigo/Blue/Emerald theme */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Primary gradient orb - Indigo */}
          <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-gradient-to-b from-indigo-600/25 via-blue-600/15 to-transparent blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }}></div>

          {/* Secondary orbs - Emerald/Teal */}
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 blur-[100px] rounded-full"></div>
          <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[80px] rounded-full"></div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>
        </div>

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
          <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
            <MagneticButton className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="flex items-center space-x-3">
                <img src="/ainance-logo-header.png" alt="Ainance Logo" className="w-10 h-10 sm:w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-lg" />
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Ainance</span>
              </div>
            </MagneticButton>

            <div className="hidden md:flex items-center space-x-1">
              {[
                { label: '機能', path: '/features' },
                { label: '使い方', path: '/how-to-use' },
                { label: 'サポート', path: '/support' }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-all rounded-full hover:bg-white/5 active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2 hover:bg-white/5 rounded-full">
                ログイン
              </button>
              <MagneticButton onClick={() => navigate('/signup')}>
                <div className="group relative px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full font-medium text-sm text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    無料で始める
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </MagneticButton>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 text-white z-[110] bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[101]"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 right-0 bottom-0 w-[280px] bg-slate-900/90 backdrop-blur-3xl border-l border-white/10 z-[102] p-8 pt-24 shadow-2xl"
                >
                  <div className="flex flex-col space-y-6">
                    {[
                      { label: '機能', path: '/features', icon: Sparkles },
                      { label: '使い方', path: '/how-to-use', icon: Play },
                      { label: 'サポート', path: '/support', icon: MessageSquare },
                      { label: 'ログイン', path: '/login', icon: LogIn }
                    ].map((item, idx) => (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        onClick={() => {
                          navigate(item.path);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-4 text-slate-300 hover:text-white transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-medium">{item.label}</span>
                      </motion.button>
                    ))}

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 }}
                      className="pt-8 border-t border-white/10"
                    >
                      <button
                        onClick={() => {
                          navigate('/signup');
                          setIsMenuOpen(false);
                        }}
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl font-bold text-white shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                      >
                        <span>無料で始める</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
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
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-full mb-8 backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
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
              <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
                経理を、
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                もっとシンプルに。
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
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
              className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6"
            >
              <button
                onClick={() => navigate('/signup')}
                className="group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl font-bold text-lg text-white shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden active:scale-95"
              >
                <span className="relative z-10">無料で始める</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button className="group relative w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm active:scale-95">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-4 h-4 fill-white text-white" />
                </div>
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
                <div key={index} className="flex items-center space-x-2 text-sm text-slate-500">
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
              {/* Glow effect - Indigo/Emerald */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 via-blue-500/15 to-emerald-500/15 blur-[80px] rounded-full transform scale-110"></div>

              {/* Browser frame */}
              <div className="relative bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
                {/* Browser header */}
                <div className="flex items-center space-x-2 px-4 py-3 bg-slate-900/80 border-b border-white/5">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-500 font-mono">
                      ainance.jp/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
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
                <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">まるごとサポート。</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 max-w-2xl mx-auto text-lg"
              >
                面倒な手作業はAIにおまかせ。
                あなたは本業に集中できます。
              </motion.p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>

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
          {/* Background decorations - Indigo/Emerald */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 via-blue-600/5 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full"></div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 mb-8 shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              さあ、始めましょう。
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
              今すぐ無料で登録して、Ainanceの全ての機能をお試しください。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="group relative w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full font-bold text-lg text-white shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">無料で始める</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              クレジットカードの登録は不要です
            </p>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-16 sm:py-20 border-t border-white/5 bg-slate-950/50 backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none"></div>
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <img src="/ainance-logo-header.png" alt="Ainance Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-lg" />
                  <span className="text-xl font-bold text-white tracking-tight">Ainance</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  AIが一人ひとりの経理を支える、次世代のパートナー。面倒な事務作業から解放され、豊かに働く未来を創ります。
                </p>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">サービス</h4>
                <ul className="space-y-4">
                  <li><Link to="/features" className="text-slate-400 hover:text-white transition-colors text-sm">機能紹介</Link></li>
                  <li><Link to="/how-to-use" className="text-slate-400 hover:text-white transition-colors text-sm">使い方</Link></li>
                  <li><Link to="/pricing" className="text-slate-400 hover:text-white transition-colors text-sm">料金プラン</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">サポート</h4>
                <ul className="space-y-4">
                  <li><Link to="/support" className="text-slate-400 hover:text-white transition-colors text-sm">ヘルプセンター</Link></li>
                  <li><Link to="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">お問い合わせ</Link></li>
                  <li><Link to="/tax-filing-guide" className="text-slate-400 hover:text-white transition-colors text-sm">公式ガイド</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">法的情報</h4>
                <ul className="space-y-4">
                  <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">利用規約</Link></li>
                  <li><Link to="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">プライバシーポリシー</Link></li>
                  <li><Link to="/legal" className="text-slate-400 hover:text-white transition-colors text-sm">特定商取引法に基づく表記</Link></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
              <div className="text-sm text-slate-500">
                © 2025 Ainance. All rights reserved.
              </div>
              <div className="flex items-center space-x-6">
                {/* Social icons could go here */}
                <span className="text-xs text-slate-600">Built with precision for specialists.</span>
              </div>
            </div>
          </div>
        </footer>

      </div >
    </SmoothScroll >
  );
};

export default LandingPage;