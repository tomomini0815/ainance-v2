import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Menu, X, Play, Zap, Brain, BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';
import { SmoothScroll } from '../components/ui/SmoothScroll';
import { CustomCursor } from '../components/ui/CustomCursor';
import { MagneticButton } from '../components/ui/MagneticButton';
import { TextReveal } from '../components/ui/TextReveal';
import { useAuth } from '../hooks/useAuth';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  // Parallax effects
  const yHero = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scaleImage = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const rotateImage = useTransform(scrollYProgress, [0, 0.5], [0, 10]);

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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証済みの場合（リダイレクト待ち）
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">ダッシュボードへ移動中...</p>
        </div>
      </div>
    );
  }

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
        <CustomCursor />

        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen opacity-40"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
        </div>

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
          <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
            <MagneticButton className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold tracking-tight">Ainance</span>
              </div>
            </MagneticButton>

            <div className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-sm">
              <button className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5">機能</button>
              <button className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5">使い方</button>
              <button className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5">料金</button>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">ログイン</button>
              <MagneticButton onClick={() => navigate('/dashboard')}>
                <div className="px-5 py-2.5 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  無料で始める
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
        </nav>

        {/* Hero Section */}
        <section className="relative pt-40 pb-32 px-6 overflow-hidden">
          <motion.div
            style={{ y: yHero, opacity: opacityHero }}
            className="max-w-[1200px] mx-auto text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-medium text-indigo-200 tracking-wide uppercase">AIクラウド経理プラットフォーム</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-8 bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent">
              経理を、<br className="md:hidden" />
              <span className="text-indigo-400/20 selection:bg-indigo-500/30">もっとシンプルに。</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
            >
              レシート処理から請求書作成、経営分析まで。<br />
              AIがあなたの経理業務をまるごとサポートします。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => navigate('/dashboard')}
                className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] flex items-center space-x-2"
              >
                <span>無料で始める</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all flex items-center space-x-2 backdrop-blur-sm">
                <Play className="w-4 h-4 fill-current" />
                <span>使い方を見る</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Dashboard Image */}
          <motion.div
            style={{ scale: scaleImage, rotateX: rotateImage }}
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
            className="mt-20 max-w-[1200px] mx-auto relative z-10 perspective-[2000px]"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full z-0"></div>
              {/* Hero Devices Image - MacBook + iPhone combined */}
              <div className="relative z-10">
                <img
                  src="/assets/hero_devices_v4.png"
                  alt="Ainance Dashboard on MacBook and iPhone"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Clients / Logos */}
        <section className="py-10 border-y border-white/5 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm text-gray-500 mb-8 font-medium tracking-wide">TRUSTED BY INNOVATIVE COMPANIES</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholder Logos - In a real app, use SVG logos */}
              {['Acme Corp', 'GlobalBank', 'Nebula', 'Velocity', 'Trio'].map((name) => (
                <div key={name} className="text-xl font-bold font-serif text-white/40 hover:text-white transition-colors cursor-default">{name}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props / Bento Grid */}
        <section className="py-32 px-6 relative">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">経理業務を、<br />まるごとサポート。</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                レシート処理、請求書作成、経営分析まで。面倒な手作業はAIにおまかせ。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              {/* Card 1 */}
              <div className="md:col-span-2 row-span-1 rounded-3xl bg-[#0F0F0F] border border-white/5 p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">レシート処理</h3>
                    <p className="text-gray-400">レシートをスキャンするだけ。AIが金額・日付・品目を読み取り、自動で仕訳を作成します。</p>
                  </div>
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/10 to-transparent"></div>
                {/* Abstract Shape */}
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
              </div>

              {/* Card 2 */}
              <div className="md:col-span-1 row-span-2 rounded-3xl bg-[#0F0F0F] border border-white/5 p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">CHAT-TO-BOOK</h3>
                  <p className="text-gray-400 mb-8">音声やテキストで取引を記録。まるでアシスタントに話しかけるように経理ができます。</p>

                  <div className="mt-auto relative h-40 bg-zinc-900/50 rounded-xl border border-white/5 p-4 flex items-center justify-center">
                    <div className="text-indigo-400 flex flex-col items-center gap-2">
                      <Sparkles className="w-8 h-8" />
                      <span className="font-mono text-xs">AI POWERED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="md:col-span-1 row-span-1 rounded-3xl bg-[#0F0F0F] border border-white/5 p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">請求書作成</h3>
                  <p className="text-gray-400 text-sm">テンプレートから簡単に請求書を作成。取引先への送付もワンクリック。</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="md:col-span-1 row-span-1 rounded-3xl bg-[#0F0F0F] border border-white/5 p-8 relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">経営分析</h3>
                  <p className="text-gray-400 text-sm">収支・キャッシュフローを可視化。AIが経営改善のヒントを提案します。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-950/20"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 tracking-tighter text-white">
              さあ、始めましょう。
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              今すぐ無料で登録して、Ainanceの全ての機能をお試しください。<br />
              クレジットカードの登録は不要です。
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-gray-200 transition-colors shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]"
            >
              無料で始める
            </button>
          </div>
        </section>

        <footer className="py-12 border-t border-white/5 bg-[#050505] text-sm text-gray-600">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span>© 2025 Ainance Inc.</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Contact</a>
            </div>
          </div>
        </footer>

      </div>
    </SmoothScroll>
  );
};

export default LandingPage;