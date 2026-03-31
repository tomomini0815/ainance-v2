import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { UserPlus, Camera, BarChart3, FileText } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'STEP 1: 無料アカウント作成',
    description: 'メールアドレスまたはGoogleアカウントで、わずか1分で登録完了。クレジットカード情報の入力は不要です。',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    glow: 'shadow-[0_0_40px_rgba(99,102,241,0.15)]',
    glowColor: 'bg-indigo-500',
  },
  {
    icon: Camera,
    title: 'STEP 2: スマホでサクッと取引記録',
    description: 'スマホでレシートを撮影するか、チャットで「ランチ代 1000円」と送信するだけでAIが自動仕分けして記録完了します。',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]',
    glowColor: 'bg-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'STEP 3: 経営状況をリアルタイム把握',
    description: 'ダッシュボードで売上や経費の推移を直感的に確認。AIが自動で分析し、無駄な経費の削減案や資金繰りのアドバイスを提供します。',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_40px_rgba(6,182,212,0.15)]',
    glowColor: 'bg-cyan-500',
  },
  {
    icon: FileText,
    title: 'STEP 4: 書類作成・e-Tax申告準備まで',
    description: '蓄積した取引データから確定申告に必要な計算を自動化し、e-Tax用の申告データを作成します。請求書も専用フォームからスムーズに作成可能です。',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.15)]',
    glowColor: 'bg-blue-500',
  }
];

const HowItWorksSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end center"]
  });

  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  return (
    <section id="how-it-works-section" ref={containerRef} className="py-32 sm:py-48 px-6 relative overflow-hidden bg-slate-950">
      {/* Background Glows */}
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-left md:text-center mb-16 sm:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-medium text-emerald-400 mb-6"
          >
            <span>使い方</span>
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[1.45rem] sm:text-4xl lg:text-5xl font-bold !mb-6 tracking-tight !leading-[1.4]"
          >
            使い方に迷わない。<br />
            <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">驚くほどシンプルな4ステップ</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-3xl mx-0 md:mx-auto text-lg sm:text-xl leading-relaxed"
          >
            専門知識は一切不要。今日からすぐにAIを使った効率的な経理業務が始められます。
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Central Line (Desktop) */}
          <div className="absolute left-[32px] md:left-1/2 top-4 bottom-4 w-[2px] bg-slate-800 -translate-x-1/2 overflow-hidden">
            <motion.div 
              className="absolute top-0 w-full bg-gradient-to-b from-indigo-500 via-emerald-500 to-blue-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ height: '100%', scaleY: pathLength, originY: 0 }}
            />
          </div>

          <div className="space-y-12 md:space-y-0 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className={`relative flex flex-row items-start w-full pb-20 md:pb-32 last:pb-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Timeline Dot (Desktop) */}
                  <div className={`absolute left-8 md:left-1/2 top-8 -translate-x-1/2 w-16 h-16 bg-slate-950 border-4 border-slate-900 rounded-full z-20 flex items-center justify-center shadow-xl transition-all duration-500 group-hover:border-slate-800`}>
                    <div className={`w-full h-full rounded-full ${step.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className={`w-7 h-7 ${step.color}`} />
                    </div>
                  </div>

                  {/* Empty space for alternating layout (Desktop) */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 flex relative z-10 pl-20 md:pl-0 ${isEven ? 'md:justify-end md:pr-10' : 'md:justify-start md:pl-10'}`}>
                    <div className={`w-full max-w-lg p-8 sm:p-10 rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:${step.border} transition-all duration-500 hover:${step.glow} group relative overflow-hidden`}>
                      {/* Card Background Glow (Outer) */}
                      <motion.div 
                        animate={{ 
                          opacity: [0.05, 0.1, 0.05],
                          scale: [1, 1.05, 1] 
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className={`absolute -inset-24 ${step.glowColor} blur-[120px] pointer-events-none z-0`} 
                      />
                      
                      {/* Card Background Glow (Inner - Intensifies on Hover) */}
                      <div className={`absolute inset-0 ${step.glowColor} blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none z-0`} />
                      
                      {/* Inner Glow on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                      
                      {/* Mobile Icon (hidden on desktop since it's on the timeline) */}
                      <div className={`hidden w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10`}>
                        <Icon className={`w-8 h-8 ${step.color}`} />
                      </div>
                      
                       <h3 className="text-xl lg:text-2xl font-bold text-white mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300 relative z-10">
                        {step.title}
                      </h3>
                      
                      <p className="text-slate-400 leading-relaxed text-lg relative z-10">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
