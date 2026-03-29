import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { UserPlus, Camera, BarChart3, FileText, Bot } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'STEP 1: 無料アカウント作成',
    description: 'メールアドレスまたはGoogleアカウントで、わずか1分で登録完了。クレジットカード情報の入力は不要です。',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    glow: 'shadow-[0_0_40px_rgba(99,102,241,0.15)]',
  },
  {
    icon: Camera,
    title: 'STEP 2: スマホでサクッと取引記録',
    description: 'スマホでレシートを撮影するか、チャットで「ランチ代 1000円」と送信するだけでAIが自動仕分けして記録完了します。',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]',
  },
  {
    icon: BarChart3,
    title: 'STEP 3: 経営状況をリアルタイム把握',
    description: 'ダッシュボードで売上や経費の推移を直感的に確認。AIが自動で分析し、無駄な経費の削減案や資金繰りのアドバイスを提供します。',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_40px_rgba(6,182,212,0.15)]',
  },
  {
    icon: FileText,
    title: 'STEP 4: 書類作成・e-Tax申告まで',
    description: '請求書の発行もワンクリック。確定申告の時期には、蓄積されたデータから必要な書類を自動生成しそのまま申告できます。',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.15)]',
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
    <section id="how-it-works-section" ref={containerRef} className="py-24 sm:py-32 px-6 relative overflow-hidden bg-slate-950">
      {/* Background Glows */}
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20 sm:mb-32">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-medium text-emerald-400 mb-6"
          >
            <Bot className="w-4 h-4" />
            <span>How It Works</span>
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight"
          >
            使い方に迷わない。<br className="sm:hidden" />
            <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">驚くほどシンプルな4ステップ</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto text-lg"
          >
            専門知識は一切不要。今日からすぐにAIを使った効率的な経理業務が始められます。
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Central Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-[2px] bg-slate-800 -translate-x-1/2 overflow-hidden">
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
                  className={`relative flex flex-col md:flex-row items-center w-full md:pb-24 last:md:pb-0 ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Timeline Dot (Desktop) */}
                  <div className={`hidden md:flex absolute left-1/2 top-8 -translate-x-1/2 w-16 h-16 bg-slate-950 border-4 border-slate-900 rounded-full z-20 items-center justify-center shadow-xl transition-all duration-500 group-hover:border-slate-800`}>
                    <div className={`w-full h-full rounded-full ${step.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className={`w-7 h-7 ${step.color}`} />
                    </div>
                  </div>

                  {/* Empty space for alternating layout (Desktop) */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 flex relative z-10 ${isEven ? 'md:justify-start md:pl-16' : 'md:justify-end md:pr-16'}`}>
                    <div className={`w-full max-w-lg p-8 sm:p-10 rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:${step.border} transition-all duration-500 hover:${step.glow} group relative overflow-hidden`}>
                      {/* Inner Glow on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Mobile Icon (hidden on desktop since it's on the timeline) */}
                      <div className={`md:hidden w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10`}>
                        <Icon className={`w-8 h-8 ${step.color}`} />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300 relative z-10">
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
