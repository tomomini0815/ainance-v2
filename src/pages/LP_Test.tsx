import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    Menu,
    X,
    Zap,
    Shield,
    TrendingUp,
    Globe,
    MessageSquare,
    BarChart3,
    CreditCard,
    CheckCircle2,
    Users,
    Star,
    Wallet,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Send,
    Lock,
    Smartphone,
    Clock,
} from 'lucide-react';

/* ─── Animated Section Wrapper ─── */
const FadeInSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/* ─── SVG Mini-Chart Components ─── */
const DonutChart: React.FC<{ size?: number; data: { value: number; color: string }[]; strokeWidth?: number }> = ({ size = 120, data, strokeWidth = 14 }) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    let accum = 0;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {data.map((d, i) => {
                const dash = (d.value / total) * circumference;
                const offset = (accum / total) * circumference;
                accum += d.value;
                return (
                    <circle
                        key={i}
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke={d.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                    />
                );
            })}
        </svg>
    );
};

const MiniLineChart: React.FC<{ color?: string; className?: string }> = ({ color = '#818cf8', className = '' }) => {
    const pts = '0,40 15,32 30,36 45,20 60,24 75,12 90,18 105,8 120,14 135,6 150,10';
    return (
        <svg viewBox="0 0 150 48" className={`w-full h-full ${className}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id={`lg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`0,48 ${pts} 150,48`} fill={`url(#lg-${color.replace('#', '')})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

/* ─── Main Component ─── */
const LP_Test: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Benefits', href: '#benefits' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Product', href: '#product' },
        { label: 'Blog', href: '#blog' },
    ];

    const donutData = [
        { value: 35, color: '#818cf8' },
        { value: 25, color: '#34d399' },
        { value: 20, color: '#fbbf24' },
        { value: 20, color: '#f472b6' },
    ];

    const categoryData = [
        { label: 'Marketing', pct: 35, color: '#818cf8' },
        { label: 'Sales', pct: 25, color: '#34d399' },
        { label: 'Operations', pct: 20, color: '#fbbf24' },
        { label: 'Others', pct: 20, color: '#f472b6' },
    ];

    const transactionList = [
        { name: 'Slack Technologies', amount: '-$2,400.00', type: 'out', icon: '💬', time: '2 min ago' },
        { name: 'Stripe Payment', amount: '+$12,800.00', type: 'in', icon: '💳', time: '15 min ago' },
        { name: 'AWS Services', amount: '-$4,200.00', type: 'out', icon: '☁️', time: '1 hr ago' },
        { name: 'Client Invoice #142', amount: '+$8,500.00', type: 'in', icon: '📄', time: '3 hrs ago' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

            {/* ════════════════ Navigation ════════════════ */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-[#020617]/60 backdrop-blur-2xl border-b border-white/[0.06] py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-[1320px] mx-auto px-6 md:px-10 flex justify-between items-center">
                    <div className="flex items-center gap-10">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.35)] group-hover:shadow-[0_0_28px_rgba(99,102,241,0.5)] transition-shadow">
                                <span className="font-extrabold text-white text-sm">A</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight">Ainance</span>
                        </Link>
                        <div className="hidden lg:flex items-center gap-7">
                            {navLinks.map(l => (
                                <a key={l.label} href={l.href} className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors duration-200">{l.label}</a>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <button className="hidden sm:block text-[13px] font-medium text-slate-400 hover:text-white transition-colors">Log in</button>
                        <button className="px-5 py-2 bg-white text-[#020617] rounded-full text-[13px] font-bold hover:bg-slate-100 transition-all active:scale-[0.97] shadow-[0_0_16px_rgba(255,255,255,0.12)]">
                            Join Waitlist
                        </button>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-white">
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:hidden bg-[#020617]/95 backdrop-blur-xl border-t border-white/5 px-6 py-6"
                    >
                        {navLinks.map(l => (
                            <a key={l.label} href={l.href} className="block py-3 text-slate-300 hover:text-white transition-colors">{l.label}</a>
                        ))}
                    </motion.div>
                )}
            </nav>

            {/* ════════════════ Hero ════════════════ */}
            <section className="relative pt-36 md:pt-44 pb-8 px-6 overflow-hidden">
                {/* Background glows */}
                <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/[0.15] blur-[140px] rounded-full pointer-events-none" />
                <div className="absolute top-[100px] right-[-100px] w-[350px] h-[350px] bg-cyan-500/[0.08] blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-[1100px] mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full mb-7"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-medium text-slate-400 tracking-wide">Join Over 2k Happy Users</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="text-[clamp(2.2rem,5.5vw,4.5rem)] font-extrabold tracking-[-0.03em] mb-6 leading-[1.08] max-w-3xl mx-auto"
                    >
                        Effortless transactions,{' '}
                        <br className="hidden md:block" />
                        every time
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="text-slate-400 text-base md:text-lg max-w-xl mx-auto mb-9 leading-relaxed"
                    >
                        Powerful, self-serve product and growth analytics to help you convert, engage, and retain more users. Trusted by over 4,000 startups.
                    </motion.p>

                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.35 }}>
                        <button className="px-8 py-3.5 bg-white text-[#020617] rounded-full font-bold text-sm hover:bg-slate-100 transition-all active:scale-[0.97] shadow-[0_2px_30px_rgba(255,255,255,0.16)]">
                            GET STARTED
                        </button>
                    </motion.div>
                </div>

                {/* ─── Dashboard Mockup ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-[1200px] mx-auto mt-16 relative"
                >
                    <div className="relative group">
                        <div className="absolute -inset-px bg-gradient-to-b from-indigo-500/20 via-transparent to-cyan-500/10 rounded-[1.5rem] blur-sm opacity-60" />
                        <div className="relative bg-[#0a0f1e] rounded-[1.5rem] border border-white/[0.08] overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]">
                            <div className="flex">
                                {/* Sidebar */}
                                <div className="hidden md:flex flex-col w-[220px] border-r border-white/[0.06] p-5 gap-1">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center"><span className="text-[10px] font-bold">A</span></div>
                                        <span className="text-sm font-bold">Ainance</span>
                                    </div>
                                    {[
                                        { icon: <BarChart3 size={15} />, label: 'Dashboard', active: true },
                                        { icon: <Wallet size={15} />, label: 'Transactions' },
                                        { icon: <CreditCard size={15} />, label: 'Cards' },
                                        { icon: <PieChart size={15} />, label: 'Analytics' },
                                        { icon: <Send size={15} />, label: 'Transfers' },
                                        { icon: <Users size={15} />, label: 'Team' },
                                    ].map((item, idx) => (
                                        <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${item.active ? 'bg-white/[0.06] text-white font-medium' : 'text-slate-500 hover:text-slate-300'}`}>
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 p-5 md:p-7 space-y-5 min-h-[440px] md:min-h-[500px]">

                                    {/* Top Stat Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Total Balance', value: '$124,500', change: '+12.5%', up: true, color: 'from-indigo-500/20 to-indigo-500/5' },
                                            { label: 'Income', value: '$48,200', change: '+8.2%', up: true, color: 'from-emerald-500/20 to-emerald-500/5' },
                                            { label: 'Expenses', value: '$15,800', change: '-3.1%', up: false, color: 'from-rose-500/20 to-rose-500/5' },
                                            { label: 'Savings', value: '$32,400', change: '+15.7%', up: true, color: 'from-amber-500/20 to-amber-500/5' },
                                        ].map((card, i) => (
                                            <div key={i} className={`relative p-4 rounded-xl bg-gradient-to-br ${card.color} border border-white/[0.06] overflow-hidden`}>
                                                <p className="text-[11px] text-slate-400 mb-1">{card.label}</p>
                                                <p className="text-lg font-bold mb-1">{card.value}</p>
                                                <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${card.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {card.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                    {card.change}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chart Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        {/* Bar Chart */}
                                        <div className="md:col-span-8 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                            <div className="flex justify-between items-center mb-4">
                                                <p className="text-sm font-semibold">Revenue Overview</p>
                                                <div className="flex gap-3 text-[10px] text-slate-500">
                                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" />Income</span>
                                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400/30" />Expense</span>
                                                </div>
                                            </div>
                                            <div className="h-[160px] flex items-end gap-[6px] relative">
                                                {/* Grid lines */}
                                                {[0, 1, 2, 3].map(i => (
                                                    <div key={i} className="absolute left-0 right-0 border-t border-white/[0.04]" style={{ bottom: `${i * 33.3}%` }} />
                                                ))}
                                                {[
                                                    { income: 65, expense: 35 },
                                                    { income: 80, expense: 45 },
                                                    { income: 55, expense: 30 },
                                                    { income: 90, expense: 50 },
                                                    { income: 70, expense: 40 },
                                                    { income: 85, expense: 48 },
                                                    { income: 60, expense: 32 },
                                                    { income: 95, expense: 55 },
                                                    { income: 75, expense: 42 },
                                                    { income: 88, expense: 46 },
                                                    { income: 72, expense: 38 },
                                                    { income: 92, expense: 52 },
                                                ].map((d, i) => (
                                                    <div key={i} className="flex-1 flex items-end gap-[2px] relative z-10">
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${d.income}%` }}
                                                            transition={{ duration: 0.8, delay: 0.8 + i * 0.04 }}
                                                            className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-[3px] min-w-[4px]"
                                                        />
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${d.expense}%` }}
                                                            transition={{ duration: 0.8, delay: 0.9 + i * 0.04 }}
                                                            className="flex-1 bg-indigo-400/20 rounded-t-[3px] min-w-[3px]"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-2 text-[9px] text-slate-600">
                                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
                                            </div>
                                        </div>

                                        {/* Donut Chart */}
                                        <div className="md:col-span-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                            <p className="text-sm font-semibold mb-4">Spending Categories</p>
                                            <div className="flex justify-center mb-4 relative">
                                                <DonutChart size={110} data={donutData} strokeWidth={12} />
                                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                    <p className="text-lg font-bold">$15.8k</p>
                                                    <p className="text-[10px] text-slate-500">Total Spent</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {categoryData.map((c, i) => (
                                                    <div key={i} className="flex items-center justify-between text-[11px]">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                                                            <span className="text-slate-400">{c.label}</span>
                                                        </span>
                                                        <span className="text-slate-300 font-medium">{c.pct}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Transactions (hidden on small screens for cleanliness) */}
                                    <div className="hidden md:block p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-sm font-semibold">Recent Transactions</p>
                                            <span className="text-[11px] text-indigo-400 cursor-pointer hover:underline">View All</span>
                                        </div>
                                        <div className="space-y-2">
                                            {transactionList.map((tx, i) => (
                                                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{tx.icon}</span>
                                                        <div>
                                                            <p className="text-[13px] font-medium">{tx.name}</p>
                                                            <p className="text-[10px] text-slate-500">{tx.time}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[13px] font-semibold ${tx.type === 'in' ? 'text-emerald-400' : 'text-slate-300'}`}>{tx.amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Bottom glow effect beneath dashboard */}
                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-indigo-500/[0.06] blur-[80px] rounded-full pointer-events-none" />
                </motion.div>
            </section>

            {/* ════════════════ Social Proof ════════════════ */}
            <FadeInSection>
                <section className="py-16 px-6 border-y border-white/[0.04]">
                    <div className="max-w-[1100px] mx-auto">
                        <p className="text-center text-[11px] text-slate-500 font-semibold tracking-[0.2em] mb-10">THE TOOLS THAT POWER THE BEST STARTUPS</p>
                        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-30">
                            {['Forbes', 'INSIDER', 'The Verge', 'WIRED', 'TECHCRUNCH'].map(b => (
                                <span key={b} className="text-xl md:text-2xl font-bold tracking-tighter">{b}</span>
                            ))}
                        </div>
                    </div>
                </section>
            </FadeInSection>

            {/* ════════════════ Things You Would Love ════════════════ */}
            <section id="benefits" className="py-28 px-6">
                <div className="max-w-[1100px] mx-auto">
                    <FadeInSection>
                        <h2 className="text-3xl md:text-[2.8rem] font-extrabold tracking-tight text-center mb-16 leading-tight">
                            Things you would love<br className="hidden md:block" /> about us
                        </h2>
                    </FadeInSection>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left — Testimonial + Stat */}
                        <FadeInSection delay={0.1}>
                            <div className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-transparent border border-white/[0.08] relative overflow-hidden h-full">
                                <div className="relative z-10">
                                    <div className="flex items-baseline gap-2 mb-5">
                                        <span className="text-5xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">5</span>
                                        <span className="text-xl font-semibold text-slate-300">mins</span>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed mb-8 max-w-md">
                                        Join over 2,000+ happy users already registered on our platform. Secure and lightning-fast management of all your financial resources.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-sm font-bold">A</div>
                                        <div>
                                            <p className="text-sm font-semibold">Adam Smith</p>
                                            <p className="text-[11px] text-slate-500">CEO of TechFlow</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 blur-[100px] pointer-events-none" />
                            </div>
                        </FadeInSection>

                        {/* Right — Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { value: '12X', label: 'More faster and secure transactions', span: 'col-span-2' },
                                { value: '31X', label: 'More efficient budget and expense management' },
                                { value: '20X', label: 'Better user retention for web3 devices' },
                            ].map((s, i) => (
                                <FadeInSection key={i} delay={0.15 + i * 0.08} className={s.span || ''}>
                                    <div className="p-7 md:p-8 rounded-[1.5rem] bg-white/[0.025] border border-white/[0.08] hover:border-white/[0.12] transition-colors h-full">
                                        <h3 className="text-3xl md:text-4xl font-extrabold mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{s.value}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">{s.label}</p>
                                    </div>
                                </FadeInSection>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════ Ten More Things ════════════════ */}
            <section className="py-28 px-6">
                <div className="max-w-[1100px] mx-auto">
                    <FadeInSection>
                        <h2 className="text-3xl md:text-[2.8rem] font-extrabold tracking-tight text-center mb-16 leading-tight">
                            One more thing you<br className="hidden md:block" /> should know
                        </h2>
                    </FadeInSection>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left — Feature List */}
                        <FadeInSection delay={0.1} className="lg:col-span-5">
                            <div className="p-8 md:p-10 rounded-[2rem] bg-white/[0.025] border border-white/[0.08] space-y-7 h-full">
                                <h3 className="text-2xl font-bold leading-tight">Manage everything in a single platform</h3>
                                <ul className="space-y-3.5">
                                    {[
                                        'Instant budget analysis with AI',
                                        'Multi-currency support for global business',
                                        'Real-time fraud detection engine',
                                        'Secure bank-level data encryption',
                                    ].map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                                            <CheckCircle2 className="text-emerald-400 w-4.5 h-4.5 flex-shrink-0" size={18} />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className="px-6 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors">
                                    Explore Now
                                </button>
                            </div>
                        </FadeInSection>

                        {/* Right — Financial Dashboard Snippet */}
                        <FadeInSection delay={0.2} className="lg:col-span-7">
                            <div className="rounded-[2rem] bg-[#0a0f1e] border border-white/[0.08] overflow-hidden relative h-full">
                                <div className="p-6 md:p-8 space-y-5">
                                    {/* Balance Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[11px] text-slate-500 mb-1">Total Balance</p>
                                            <h4 className="text-2xl font-bold">$124,500<span className="text-slate-500 text-base">.00</span></h4>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <ArrowUpRight size={12} className="text-emerald-400" />
                                            <span className="text-[11px] font-semibold text-emerald-400">+12.5%</span>
                                        </div>
                                    </div>

                                    {/* Mini line chart */}
                                    <div className="h-20 w-full">
                                        <MiniLineChart color="#818cf8" />
                                    </div>

                                    {/* Category breakdown */}
                                    <div className="flex items-center gap-6">
                                        <div className="flex-shrink-0">
                                            <DonutChart size={80} data={donutData} strokeWidth={8} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1">
                                            {categoryData.map((c, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                                                    <span className="text-[11px] text-slate-400 truncate">{c.label}</span>
                                                    <span className="text-[11px] text-slate-300 font-medium ml-auto">{c.pct}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Transaction rows */}
                                    <div className="space-y-1">
                                        {transactionList.slice(0, 3).map((tx, i) => (
                                            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-base">{tx.icon}</span>
                                                    <div>
                                                        <p className="text-[12px] font-medium">{tx.name}</p>
                                                        <p className="text-[10px] text-slate-500">{tx.time}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[12px] font-semibold ${tx.type === 'in' ? 'text-emerald-400' : 'text-slate-300'}`}>{tx.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent pointer-events-none" />
                            </div>
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* ════════════════ Feature Grid ════════════════ */}
            <section id="product" className="py-28 px-6">
                <div className="max-w-[1100px] mx-auto">
                    <FadeInSection>
                        <h2 className="text-3xl md:text-[2.8rem] font-extrabold tracking-tight text-center mb-5 leading-tight max-w-2xl mx-auto">
                            Everything you need,<br className="hidden md:block" /> in one place
                        </h2>
                        <p className="text-slate-400 text-center max-w-lg mx-auto mb-16 text-sm leading-relaxed">
                            All the tools you need to manage, track, and grow your financial portfolio in a single, elegant dashboard.
                        </p>
                    </FadeInSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            { icon: Zap, title: 'Instant Transfer', desc: 'Securely transfer funds globally in seconds with our optimized routing system.', accent: 'from-yellow-500/20 to-yellow-500/5' },
                            { icon: Globe, title: 'Multi-currency', desc: 'Manage over 50+ currencies with real-time exchange rate monitoring and low fees.', accent: 'from-cyan-500/20 to-cyan-500/5' },
                            { icon: BarChart3, title: 'Risk Analysis', desc: 'Advanced AI-driven analysis to minimize financial risks and identify opportunities.', accent: 'from-indigo-500/20 to-indigo-500/5' },
                            { icon: Shield, title: 'Fraud Protection', desc: 'Bank-level security and real-time monitoring to keep your assets safe 24/7.', accent: 'from-emerald-500/20 to-emerald-500/5' },
                            { icon: Users, title: 'Multi-user Access', desc: 'Invite team members and manage granular permissions for collaborative management.', accent: 'from-purple-500/20 to-purple-500/5' },
                            { icon: MessageSquare, title: '24/7 Support', desc: 'Dedicated professional support team available whenever you need assistance.', accent: 'from-rose-500/20 to-rose-500/5' },
                        ].map((item, i) => (
                            <FadeInSection key={i} delay={i * 0.06}>
                                <motion.div
                                    whileHover={{ y: -6, transition: { duration: 0.25 } }}
                                    className="p-7 rounded-[1.5rem] bg-white/[0.025] border border-white/[0.08] hover:border-white/[0.15] transition-all group h-full"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                        <item.icon className="text-white/80 w-5 h-5" />
                                    </div>
                                    <h3 className="text-base font-bold mb-3">{item.title}</h3>
                                    <p className="text-[13px] text-slate-400 leading-relaxed">{item.desc}</p>
                                </motion.div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════ Integration Showcase ════════════════ */}
            <section className="py-28 px-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/[0.06] blur-[150px] pointer-events-none" />
                <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <FadeInSection>
                        <div className="relative">
                            {/* Orbital rings */}
                            <div className="relative w-[320px] h-[320px] md:w-[380px] md:h-[380px] mx-auto">
                                {/* Outer ring */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 border border-white/[0.05] rounded-full"
                                >
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#0f172a] rounded-xl border border-white/10 flex items-center justify-center shadow-lg">
                                        <Shield className="text-indigo-400 w-4 h-4" />
                                    </div>
                                    <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-10 h-10 bg-[#0f172a] rounded-xl border border-white/10 flex items-center justify-center shadow-lg">
                                        <Globe className="text-cyan-400 w-4 h-4" />
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#0f172a] rounded-xl border border-white/10 flex items-center justify-center shadow-lg">
                                        <Lock className="text-amber-400 w-4 h-4" />
                                    </div>
                                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-10 h-10 bg-[#0f172a] rounded-xl border border-white/10 flex items-center justify-center shadow-lg">
                                        <Smartphone className="text-rose-400 w-4 h-4" />
                                    </div>
                                </motion.div>

                                {/* Inner ring */}
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-[18%] border border-white/[0.08] rounded-full"
                                >
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#0f172a] rounded-lg border border-white/10 flex items-center justify-center">
                                        <TrendingUp className="text-emerald-400 w-3.5 h-3.5" />
                                    </div>
                                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#0f172a] rounded-lg border border-white/10 flex items-center justify-center">
                                        <CreditCard className="text-purple-400 w-3.5 h-3.5" />
                                    </div>
                                    <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-8 h-8 bg-[#0f172a] rounded-lg border border-white/10 flex items-center justify-center">
                                        <Clock className="text-sky-400 w-3.5 h-3.5" />
                                    </div>
                                </motion.div>

                                {/* Center logo */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                                    <Zap className="text-[#020617] w-7 h-7" />
                                </div>
                            </div>
                        </div>
                    </FadeInSection>

                    <FadeInSection delay={0.15}>
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-[2.5rem] font-extrabold leading-tight tracking-tight">
                                Transferred in seconds payment management
                            </h2>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                                Seamlessly integrate with your favorite tools and workflows. From Slack notifications to Discord automations, manage your financial flow across all platforms.
                            </p>
                            <button className="px-7 py-3 bg-white text-[#020617] rounded-full font-bold text-sm hover:bg-slate-100 transition-all active:scale-[0.97] shadow-[0_2px_24px_rgba(255,255,255,0.1)]">
                                Explore all Integrations
                            </button>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* ════════════════ Testimonials ════════════════ */}
            <section className="py-28 px-6">
                <div className="max-w-[1100px] mx-auto">
                    <FadeInSection>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
                            <h2 className="text-3xl md:text-[2.5rem] font-extrabold tracking-tight leading-tight">Trusted by industry<br className="hidden md:block" /> leaders</h2>
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'].map((c, i) => (
                                        <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-[#020617] flex items-center justify-center text-[10px] font-bold`}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div className="pl-2">
                                    <p className="text-sm font-bold">2.5k+</p>
                                    <p className="text-[10px] text-slate-500">Users registered</p>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { name: 'Adam Smith', role: 'CEO, Creative Agency', text: '"This platform has completely transformed how we manage our agency budget. The real-time analysis tools are life-changing and saved us hundreds of hours."' },
                            { name: 'Elena Korova', role: 'Founder, TechStart', text: '"As a founder, I need tools that scale with us. Ainance provided the security and efficiency we needed to expand internationally without friction."' },
                        ].map((t, i) => (
                            <FadeInSection key={i} delay={i * 0.1}>
                                <div className="p-8 md:p-10 rounded-[2rem] bg-white/[0.025] border border-white/[0.08] space-y-6 h-full hover:border-white/[0.12] transition-colors">
                                    <div className="flex gap-0.5 text-amber-400">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                                    </div>
                                    <p className="text-[15px] text-slate-300 leading-relaxed">{t.text}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-sm font-bold">{t.name[0]}</div>
                                        <div>
                                            <p className="text-sm font-semibold">{t.name}</p>
                                            <p className="text-[11px] text-slate-500">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════ Blog ════════════════ */}
            <section id="blog" className="py-28 px-6">
                <div className="max-w-[1100px] mx-auto">
                    <FadeInSection>
                        <h2 className="text-3xl md:text-[2.5rem] font-extrabold tracking-tight text-center mb-14">News and Blogs</h2>
                    </FadeInSection>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { cat: 'AI & Finance', title: 'How AI is transforming personal budgeting for Gen Z entrepreneurs', img: 'from-indigo-900 to-slate-900' },
                            { cat: 'Web3', title: 'Understanding the future of Web 3 and financial autonomy', img: 'from-emerald-900 to-slate-900' },
                            { cat: 'Security', title: 'Bank-level encryption: what it means for your digital assets', img: 'from-purple-900 to-slate-900' },
                        ].map((post, i) => (
                            <FadeInSection key={i} delay={i * 0.08}>
                                <div className="group cursor-pointer">
                                    <div className={`aspect-[16/10] rounded-2xl bg-gradient-to-br ${post.img} mb-5 overflow-hidden relative border border-white/[0.06]`}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-semibold">{post.cat}</div>
                                    </div>
                                    <h4 className="text-[15px] font-bold mb-2 group-hover:text-indigo-400 transition-colors leading-snug">{post.title}</h4>
                                    <p className="text-slate-500 text-[12px] leading-relaxed">Deep dive into how modern technology is reshaping the financial world and how you can prepare...</p>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════ Final CTA ════════════════ */}
            <FadeInSection>
                <section className="py-20 px-6 relative">
                    <div className="max-w-[960px] mx-auto text-center py-16 md:py-20 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 relative overflow-hidden px-8 shadow-[0_20px_60px_-10px_rgba(99,102,241,0.3)]">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.08] blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 blur-[80px] pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                                Fast payment fixes –<br /> back to business
                            </h2>
                            <p className="text-indigo-200/80 text-sm md:text-base max-w-lg mx-auto mb-8 leading-relaxed">
                                Stop worrying about financial complexity. Join Ainance today and experience the future of effortless management.
                            </p>
                            <button className="px-9 py-4 bg-white text-indigo-600 rounded-full font-bold text-sm hover:bg-indigo-50 transition-all active:scale-[0.97] shadow-[0_4px_30px_rgba(255,255,255,0.25)]">
                                GET STARTED
                            </button>
                        </div>
                    </div>
                </section>
            </FadeInSection>

            {/* ════════════════ Footer ════════════════ */}
            <footer className="py-16 px-6 border-t border-white/[0.04]">
                <div className="max-w-[1100px] mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">
                        <div className="col-span-2 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center">
                                    <span className="text-[10px] font-extrabold">A</span>
                                </div>
                                <span className="text-base font-bold">Ainance</span>
                            </div>
                            <p className="text-slate-500 text-[12px] leading-relaxed max-w-[240px]">
                                Providing the best financial tools for modern digital businesses and startups around the world.
                            </p>
                        </div>
                        {[
                            { title: 'Product', links: ['Pricing', 'Benefits', 'Features', 'Integrations'] },
                            { title: 'Information', links: ['Articles', 'News', 'Updates', 'Newsletter'] },
                            { title: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms'] },
                            { title: 'Contact', links: ['Twitter', 'Discord', 'Github', 'Support'] },
                        ].map(g => (
                            <div key={g.title} className="space-y-4">
                                <h5 className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-500">{g.title}</h5>
                                <ul className="space-y-3">
                                    {g.links.map(l => (
                                        <li key={l}><a href="#" className="text-slate-400 hover:text-white transition-colors text-[12px]">{l}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 text-[11px]">© 2025 Ainance Inc. All rights reserved.</p>
                        <div className="flex gap-6 text-[11px] text-slate-500">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LP_Test;
