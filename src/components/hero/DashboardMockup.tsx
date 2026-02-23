import React from 'react';

import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, Activity,
    Zap, Globe, Shield, PieChart, CreditCard, Layers,
    FileText, Search, Bell, User
} from 'lucide-react';

const data = [
    { name: 'Jan', value: 4000, expense: 2400 },
    { name: 'Feb', value: 3000, expense: 1398 },
    { name: 'Mar', value: 2000, expense: 9800 },
    { name: 'Apr', value: 2780, expense: 3908 },
    { name: 'May', value: 1890, expense: 4800 },
    { name: 'Jun', value: 2390, expense: 3800 },
    { name: 'Jul', value: 3490, expense: 4300 },
];

const smallData = [
    { name: 'M', value: 10 }, { name: 'T', value: 40 },
    { name: 'W', value: 30 }, { name: 'T', value: 70 },
    { name: 'F', value: 50 }, { name: 'S', value: 90 },
    { name: 'S', value: 60 }
];

export const DashboardMockup: React.FC = () => {
    return (
        <div className="w-full h-full relative font-mono text-xs overflow-hidden rounded-xl border border-cyan-500/30 bg-[#050505]/90 backdrop-blur-xl shadow-[0_0_80px_-20px_rgba(6,182,212,0.3)]">

            {/* HUD Overlay Effects */}
            <div className="absolute inset-0 pointer-events-none z-50">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-500/5 to-transparent"></div>

                {/* Corner Brackets */}
                <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-cyan-500/50"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-cyan-500/50"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-cyan-500/50"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-cyan-500/50"></div>
            </div>

            {/* Top Navigation Bar */}
            <div className="h-12 border-b border-cyan-900/50 flex items-center justify-between px-6 bg-black/40">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"></div>
                        <span className="text-cyan-400 font-bold tracking-widest text-sm">AINANCE_OS</span>
                    </div>
                    <div className="hidden md:flex space-x-1">
                        {['DASHBOARD', 'ANALYTICS', 'TRANSACTIONS', 'SETTINGS'].map(item => (
                            <div key={item} className="px-3 py-1 text-cyan-500/50 hover:text-cyan-300 hover:bg-cyan-500/10 cursor-pointer transition-colors text-[10px]">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-4 text-cyan-500/70">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-cyan-900/20 rounded border border-cyan-500/20">
                        <Globe size={12} />
                        <span>GLOBAL_NET: ONLINE</span>
                    </div>
                    <Search size={14} />
                    <Bell size={14} />
                    <div className="w-6 h-6 rounded-full bg-cyan-900/50 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                        <User size={12} />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="p-6 grid grid-cols-12 gap-6 h-[calc(100%-48px)] overflow-hidden">

                {/* Left Sidebar */}
                <div className="col-span-2 hidden md:flex flex-col space-y-4 text-cyan-500/60">
                    <div className="p-4 rounded-lg bg-cyan-900/5 border border-cyan-500/10 space-y-4">
                        <div className="flex items-center space-x-3 text-cyan-300 bg-cyan-500/10 p-2 rounded border border-cyan-500/20">
                            <Layers size={14} />
                            <span>Overview</span>
                        </div>
                        {[
                            { i: <CreditCard size={14} />, l: 'Cards' },
                            { i: <FileText size={14} />, l: 'Invoices' },
                            { i: <PieChart size={14} />, l: 'Reports' },
                            { i: <Shield size={14} />, l: 'Security' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3 hover:text-cyan-300 hover:bg-cyan-500/5 p-2 rounded transition-colors cursor-pointer">
                                {item.i}
                                <span>{item.l}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto p-4 rounded-lg bg-gradient-to-b from-cyan-900/10 to-transparent border border-cyan-500/10">
                        <div className="text-[10px] mb-2 uppercase tracking-wide">System Status</div>
                        <div className="flex items-center justify-between mb-1">
                            <span>CPU</span>
                            <span className="text-cyan-400">42%</span>
                        </div>
                        <div className="h-1 w-full bg-cyan-900/30 rounded-full mb-3">
                            <div className="h-full w-[42%] bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                            <span>MEM</span>
                            <span className="text-purple-400">68%</span>
                        </div>
                        <div className="h-1 w-full bg-cyan-900/30 rounded-full">
                            <div className="h-full w-[68%] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        </div>
                    </div>
                </div>

                {/* Center Main Panel */}
                <div className="col-span-12 md:col-span-7 flex flex-col space-y-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { l: 'TOTAL_REVENUE', v: '$4,250,500', c: 'text-cyan-400', i: <TrendingUp size={16} /> },
                            { l: 'EXPENSES', v: '$1,200,300', c: 'text-orange-400', i: <TrendingDown size={16} /> },
                            { l: 'NET_PROFIT', v: '$3,050,200', c: 'text-green-400', i: <DollarSign size={16} /> },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-black/20 border border-cyan-500/20 p-4 rounded-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-50">{stat.i}</div>
                                <div className="text-[10px] text-cyan-500/50 mb-1">{stat.l}</div>
                                <div className={`text-lg font-bold ${stat.c} font-mono tracking-tight`}>{stat.v}</div>
                                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-cyan-500/20">
                                    <div className="h-full bg-cyan-500/50 w-[70%]" style={{ width: `${Math.random() * 50 + 40}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Chart */}
                    <div className="flex-1 bg-black/20 border border-cyan-500/20 rounded-lg p-4 relative">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-cyan-300 font-bold flex items-center space-x-2">
                                <Activity size={14} />
                                <span>REVENUE_FLOW_ANALYTICS</span>
                            </div>
                            <div className="flex space-x-2">
                                {['1H', '1D', '1W', '1M', '1Y'].map(t => (
                                    <button key={t} className="px-2 py-0.5 text-[9px] border border-cyan-500/30 rounded text-cyan-500/70 hover:bg-cyan-500/20">{t}</button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#0e749020" vertical={false} />
                                    <XAxis dataKey="name" stroke="#0e749060" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#0e749060" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000000cc', borderColor: '#06b6d440', borderRadius: '4px', fontSize: '10px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                                    <Area type="monotone" dataKey="expense" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Transactions Table Mock */}
                    <div className="h-[150px] bg-black/20 border border-cyan-500/20 rounded-lg p-4 overflow-hidden">
                        <div className="text-cyan-500/70 mb-2 border-b border-cyan-500/10 pb-2 flex justify-between">
                            <span>LATEST_TRANSACTIONS</span>
                            <span className="text-[9px] px-1 border border-cyan-500/30 rounded bg-cyan-500/10">LIVE</span>
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center text-[10px] hover:bg-cyan-500/5 p-1 rounded">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500/50"></div>
                                        <span className="text-white/80">AWS_INFRASTRUCTURE_COST</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-cyan-500/50">10:42:33</span>
                                        <span className="text-cyan-300 w-16 text-right">-$245.00</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Widgets */}
                <div className="col-span-3 hidden md:flex flex-col space-y-4">
                    <div className="bg-gradient-to-br from-purple-900/10 to-transparent border border-purple-500/20 p-4 rounded-lg">
                        <div className="text-purple-300 mb-3 flex items-center justify-between">
                            <span>AI_PREDICTION</span>
                            <Zap size={14} />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">+24.5%</div>
                        <div className="text-[9px] text-purple-400 mb-4">Projected growth for Q3 based on current trajectory.</div>
                        <div className="h-16 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={smallData}>
                                    <Bar dataKey="value" fill="#a855f7" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex-1 bg-black/20 border border-cyan-500/20 rounded-lg p-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grain-url.png')] opacity-10"></div>
                        <div className="text-cyan-500/70 mb-3">ACTIVE_USERS_MAP</div>
                        <div className="flex items-center justify-center h-[120px] relative">
                            <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute inset-4 border border-cyan-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                            <Globe size={48} className="text-cyan-500/30" />
                            <div className="absolute top-2 right-4 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                            <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                        </div>
                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-[10px] text-cyan-400/80">
                                <span>TOKYO_NODE</span>
                                <span>45ms</span>
                            </div>
                            <div className="w-full bg-cyan-900/30 h-1 rounded-full"><div className="w-[80%] h-full bg-cyan-500"></div></div>
                            <div className="flex justify-between text-[10px] text-cyan-400/80">
                                <span>NY_NODE</span>
                                <span>120ms</span>
                            </div>
                            <div className="w-full bg-cyan-900/30 h-1 rounded-full"><div className="w-[60%] h-full bg-cyan-500"></div></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
