import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp, Menu, X, Play } from 'lucide-react';
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

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
                {['Features', 'Benefits', 'Pricing'].map((item) => (
                  <MagneticButton key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group overflow-hidden block">
                      <span className="block group-hover:-translate-y-full transition-transform duration-300">{item}</span>
                      <span className="absolute top-full left-0 block group-hover:-translate-y-full transition-transform duration-300 text-white">{item}</span>
                    </a>
                  </MagneticButton>
                ))}
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
                  Experience the next generation of financial management.
                  Automated, intelligent, and beautifully designed.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.2 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
                >
                  <MagneticButton onClick={() => navigate('/dashboard')}>
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
                  <div className="w-full rounded-3xl shadow-2xl border border-white/10 backdrop-blur-sm transform transition-transform duration-700 group-hover:rotate-x-0 group-hover:scale-105 bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center min-h-[400px]">
                    <img
                      src="/assets/real_dashboard_desktop.png"
                      alt="Dashboard Interface"
                      className="w-full h-full object-cover rounded-3xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="text-center p-8"><div class="text-4xl mb-4">📊</div><p class="text-gray-400">Dashboard Preview</p></div>';
                      }}
                    />
                  </div>

                  {/* Mobile Mockup Overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="absolute -bottom-12 -right-4 w-[28%] rounded-[2.5rem] shadow-2xl border-[8px] border-[#1e293b] z-20 transform group-hover:translate-y-[-10px] transition-transform duration-700 bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center aspect-[9/16]"
                  >
                    <img
                      src="/assets/real_dashboard_mobile.png"
                      alt="Mobile Interface"
                      className="w-full h-full object-cover rounded-[2.5rem]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="text-center p-4"><div class="text-2xl mb-2">📱</div><p class="text-gray-400 text-xs">Mobile Preview</p></div>';
                      }}
                    />
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

        {/* Features Bento Grid */}
        <section id="features" className="py-32 relative bg-[#050b1d]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-20"
            >
              <h2 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tighter">
                Crafted for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Excellence</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              {/* Large Feature */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 row-span-2 rounded-[2rem] bg-[#0f172a] border border-white/5 p-10 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
                      <Zap className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">AI-Powered Automation</h3>
                    <p className="text-gray-400 text-lg max-w-md">Instantly process receipts with 99% accuracy. Our AI learns from your data to provide smarter suggestions over time.</p>
                  </div>
                  <div className="mt-8 rounded-xl bg-black/30 border border-white/5 p-4 backdrop-blur-sm transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center space-x-4">
                      <div className="h-2 w-24 bg-gray-700 rounded-full"></div>
                      <div className="h-2 w-12 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="mt-4 h-32 bg-gradient-to-t from-blue-500/10 to-transparent rounded-lg"></div>
                  </div>
                </div>
              </motion.div>

              {/* Small Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-[2rem] bg-[#0f172a] border border-white/5 p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-colors"></div>
                <Sparkles className="w-10 h-10 text-purple-400 mb-6" />
                <h3 className="text-xl font-bold mb-2">Smart Categorization</h3>
                <p className="text-gray-400 text-sm">Automatic expense sorting into 99+ categories.</p>
              </motion.div>

              {/* Small Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="rounded-[2rem] bg-[#0f172a] border border-white/5 p-8 relative overflow-hidden group hover:border-green-500/30 transition-colors"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 transition-colors"></div>
                <Shield className="w-10 h-10 text-green-400 mb-6" />
                <h3 className="text-xl font-bold mb-2">Bank-Grade Security</h3>
                <p className="text-gray-400 text-sm">256-bit encryption keeps your financial data safe.</p>
              </motion.div>

              {/* Medium Feature */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-3 rounded-[2rem] bg-[#0f172a] border border-white/5 p-10 relative overflow-hidden group flex items-center justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                <div className="max-w-xl relative z-10">
                  <h3 className="text-3xl font-bold mb-4">Real-time Analytics</h3>
                  <p className="text-gray-400 text-lg">Visualize your cash flow, expenses, and profits in real-time. Make data-driven decisions with confidence.</p>
                </div>
                <div className="hidden md:block relative z-10">
                  <TrendingUp className="w-32 h-32 text-white/5 group-hover:text-white/10 transition-colors" />
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
                  Manage your finances <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">on the go.</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                  Our intuitive mobile app brings the power of Ainance to your fingertips. Track expenses, approve transactions, and get real-time insights from anywhere.
                </p>
                <div className="flex justify-center lg:justify-start space-x-4">
                  <MagneticButton>
                    <img src="/assets/app-store.svg" alt="App Store" className="h-12" />
                  </MagneticButton>
                  <MagneticButton>
                    <img src="/assets/google-play.svg" alt="Google Play" className="h-12" />
                  </MagneticButton>
                </div>
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
                Ready to transform <br />
                your workflow?
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Join thousands of businesses using Ainance to streamline their accounting.
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
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
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