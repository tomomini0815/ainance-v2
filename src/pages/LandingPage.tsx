import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Menu, X, Play, MessageSquare, Check, ChevronRight, LogIn } from 'lucide-react';
import { SmoothScroll } from '../components/ui/SmoothScroll';
import { CustomCursor } from '../components/ui/CustomCursor';
import { MagneticButton } from '../components/ui/MagneticButton';
import { useAuth } from '../hooks/useAuth';
import { TaxReturnIllustration, CorporateAccountingIllustration, ExpenseSettlementIllustration, InvoiceIllustration, DashboardIllustration, SubsidyIllustration } from '../components/illustrations/FeatureIllustrations';
import HowItWorksSection from '../components/landing/HowItWorksSection';

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
      badge: '経理財務',
      title: 'AIレシート読取',
      description: 'スマホやPCから画像をアップロードするだけで、高精度AIが日付・金額・店舗名を自動抽出。最適な勘定科目もAIが推測します。',
      details: [
        'スマホやPCから画像をアップロード',
        '日付・金額・店舗名をAIが自動抽出',
        '内容から最適な勘定科目をAIが推測'
      ],
      Illustration: ExpenseSettlementIllustration,
    },
    {
      badge: '経理業務',
      title: '音声・チャット経理',
      description: '「カフェで会議、コーヒー代800円」と話しかけるだけ。自然言語処理で文章から取引内容を自動抽出し、手軽に経費を記録します。',
      details: [
        'マイクを使ったシンプルな音声入力対応',
        'チャット形式で日々の経費を手軽に記録',
        '曖昧な表現でもAIが補正して自動仕訳'
      ],
      Illustration: CorporateAccountingIllustration,
    },
    {
      badge: '確定申告',
      title: '確定申告サポート',
      description: '質問に答えるだけのウィザード形式で、青色・白色申告書類を自動作成。控除の計算からe-Tax用データ出力まで一気通貫。',
      details: [
        '青色申告・白色申告の両方に完全対応',
        '各種控除や減価償却費の計算ナビゲート',
        'e-Tax提出用ファイル(xtx形式)の出力'
      ],
      Illustration: TaxReturnIllustration,
    },
    {
      badge: '請求管理',
      title: '請求書・見積書作成',
      description: 'インボイス制度対応の請求書・見積書をスムーズに作成。プレビューを確認しながら入力でき、PDF出力も標準搭載しています。',
      details: [
        '請求書と見積書のフォーマットを簡単切り替え',
        'インボイス適格請求書フォーマットに完全対応',
        '顧客や品目を入力してPDFを即座に発行保存'
      ],
      Illustration: InvoiceIllustration,
    },
    {
      badge: '経営分析',
      title: '経営分析ダッシュボード',
      description: '売上・経費・利益の推移をリアルタイムでグラフ化。月ごとの予算と実績の比較など、データに基づいた経営状態の把握をサポートします。',
      details: [
        '全体のリアルタイムな収支をグラフで可視化',
        '月ごとの予算と実績の比較を行う目標管理',
        '前期決算書のAI取り込みによる簡単移行'
      ],
      Illustration: DashboardIllustration,
    },
    {
      badge: '資金調達',
      title: '補助金マッチング',
      description: 'あなたの事業プロフィールに基づき、受給可能な補助金・助成金をAIが提案。申請書のドラフト作成による支援も行います。',
      details: [
        '事業プロフィールに基づくAI最適マッチング',
        '補助金の推定受給額や難易度、確率を算出',
        '申請書ドラフトの自動作成と戦略的アドバイス'
      ],
      Illustration: SubsidyIllustration,
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
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${(scrolled || isMenuOpen) ? 'bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
          <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
            <MagneticButton className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="flex items-center space-x-3">
                <img src="/ainance-logo-header.png" alt="Ainance Logo" className="w-10 h-10 sm:w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-lg" />
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Ainance</span>
              </div>
            </MagneticButton>

            <div className="hidden md:flex items-center space-x-1">
              {[
                { label: '機能', path: '#features-section' },
                { label: '使い方', path: '#how-it-works-section' },
                { label: 'サポート', path: '/support' }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.path.startsWith('#')) {
                      document.getElementById(item.path.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate(item.path);
                    }
                  }}
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
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* Mobile Menu - outside nav to ensure correct fixed positioning */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-[200]"
              />
              {/* Sidebar */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-[75vw] max-w-[300px] bg-slate-950 z-[201] flex flex-col border-l border-white/10 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 flex-shrink-0">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Menu</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav items */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                  {[
                    { label: '機能', path: '#features-section', icon: Sparkles },
                    { label: '使い方', path: '#how-it-works-section', icon: Play },
                    { label: 'サポート', path: '/support', icon: MessageSquare },
                    { label: 'ログイン', path: '/login', icon: LogIn }
                  ].map((item, idx) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * idx }}
                      onClick={() => {
                        if (item.path.startsWith('#')) {
                          document.getElementById(item.path.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          navigate(item.path);
                        }
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full text-slate-300 hover:text-white px-3 py-3.5 rounded-xl hover:bg-white/5 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors flex-shrink-0">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-base font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="px-4 py-5 border-t border-white/10 flex-shrink-0">
                  <button
                    onClick={() => { navigate('/signup'); setIsMenuOpen(false); }}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl font-bold text-white flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-transform"
                  >
                    <span>無料で始める</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="relative pt-24 sm:pt-40 pb-16 sm:pb-32 px-6 overflow-hidden">
          <motion.div
            style={{ y: yHero, opacity: opacityHero }}
            className="max-w-[1000px] mx-auto text-center relative z-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-full mb-3 sm:mb-8 backdrop-blur-sm"
            >
              <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-indigo-300">次世代AI経理プラットフォーム</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-8"
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
              className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-12 leading-relaxed"
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
                onClick={() => {
                  document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm sm:text-base hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm active:scale-95 mx-auto sm:mx-0"
              >
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-3 h-3 fill-white text-white" />
                </div>
                <span>機能を見る</span>
              </button>
            </motion.div>

            {/* Benefits list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 sm:gap-y-3"
            >
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500">
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
            className="-mt-2 sm:mt-2 max-w-[1400px] mx-auto relative z-10"
          >
            <div className="relative flex justify-center items-center">
              {/* Glow effect - Indigo/Emerald */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 via-blue-500/15 to-emerald-500/15 blur-[80px] rounded-full transform scale-110"></div>

              {/* Mockup images */}
              <div className="relative w-full overflow-visible flex justify-center max-w-7xl mx-auto px-4">
                {/* PC Mockup */}
                <img
                  src="/hero-mockup.png"
                  alt="Ainance Dashboard Mockup PC"
                  className="w-full h-auto object-contain max-h-[340px] sm:max-h-[800px] drop-shadow-[0_20px_50px_rgba(99,102,241,0.3)] relative z-10"
                />
                
                {/* Mobile Mockup */}
                <motion.img
                  src="/mobile-mockup.png"
                  alt="Ainance Dashboard Mockup Mobile"
                  initial={{ opacity: 0, y: 50, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: 1.5, duration: 1, type: "spring", bounce: 0.4 }}
                  className="absolute -right-2 md:right-[2%] bottom-[-12%] md:bottom-[-18%] w-[45%] sm:w-[40%] md:w-[32%] max-w-[400px] h-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)] z-20"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="-mt-8 sm:-mt-16 pt-16 sm:pt-24 pb-24 sm:pb-32 px-6 relative z-20">
          <div className="max-w-[1200px] mx-auto">
            {/* Section Header */}
            <div className="text-center mb-10 sm:mb-12">
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
                <span className="text-2xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">まるごとサポート。</span>
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
                  className="group relative p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-t border-l border-white/20 border-r border-b border-black/50 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] hover:border-indigo-400/50 hover:shadow-[0_0_50px_rgba(99,102,241,0.25)] transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
                >
                  {/* Spotlight Effect inside card */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  {/* Badge */}
                  <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10">
                    <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold rounded-full">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Illustration */}
                  <div className="w-full max-w-[160px] mt-10 mb-4 transform group-hover:-translate-y-2 transition-transform duration-500">
                    <feature.Illustration className="w-full h-auto drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
                  </div>

                  {/* Content */}
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-white group-hover:text-indigo-100 transition-colors">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-5 flex-grow text-left w-full px-2">{feature.description}</p>

                  {/* Feature List */}
                  <ul className="w-full space-y-2 mb-6 px-2 text-left">
                    {feature.details.map((detail, detailIdx) => (
                      <li key={detailIdx} className="flex items-start text-xs sm:text-sm text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">{detail}</span>
                      </li>
                    ))}
                  </ul>


                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorksSection />

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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              さぁ、経理業務をもっと楽に。
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
            <div className="grid grid-cols-3 md:grid-cols-4 gap-x-2 gap-y-10 md:gap-12 mb-16">
              <div className="col-span-3 md:col-span-1">
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
                  <li><button onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-slate-400 hover:text-white transition-colors text-sm">機能紹介</button></li>
                  <li><button onClick={() => document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-slate-400 hover:text-white transition-colors text-sm">使い方</button></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">サポート</h4>
                <ul className="space-y-4">
                  <li><Link to="/support" className="text-slate-400 hover:text-white transition-colors text-sm">ヘルプセンター</Link></li>
                  <li><Link to="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">お問い合わせ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">法的情報</h4>
                <ul className="space-y-4">
                  <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">利用規約</Link></li>
                  <li><Link to="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">プライバシーポリシー</Link></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
              <div className="text-sm text-slate-500">
                © 2025-2026 Ainance. All rights reserved.
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