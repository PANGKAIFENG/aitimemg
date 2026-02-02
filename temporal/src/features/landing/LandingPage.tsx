import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    ArrowRight,
    CheckCircle2,
    Clock,
    Zap,
    BarChart3,
    Calendar,
    Target,
    AlertTriangle,
    Menu,
    X,
} from 'lucide-react';


/* --- Design Tokens & Utilities --- */
/* (Tokens are applied via Tailwind classes) */

const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <section className={`px-6 py-24 md:px-12 md:py-32 max-w-7xl mx-auto ${className}`}>
        {children}
    </section>
);

const Badge = ({ children, color = "primary" }: { children: React.ReactNode, color?: "primary" | "accent" | "danger" }) => {
    const styles = {
        primary: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
        accent: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-100" },
        danger: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
    };
    const s = styles[color];
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}>
            {children}
        </span>
    );
};

/* --- Components --- */

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/50">
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                    <span className="font-bold text-lg tracking-tight text-slate-900">Temporal</span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                    <a href="#benefits" className="hover:text-indigo-600 transition-colors">为什么选择</a>
                    <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">怎么做</a>
                    <a href="#ai-output" className="hover:text-indigo-600 transition-colors">AI 报告</a>
                    <a href="#pricing" className="hover:text-indigo-600 transition-colors">定价</a>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-600 hover:text-slate-900">登录</button>
                    <button onClick={() => navigate('/login')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        免费开始
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-slate-600" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4 text-center">
                            <a href="#benefits" onClick={() => setIsOpen(false)}>为什么选择</a>
                            <a href="#how-it-works" onClick={() => setIsOpen(false)}>怎么做</a>
                            <a href="#ai-output" onClick={() => setIsOpen(false)}>AI 报告</a>
                            <a href="#pricing" onClick={() => setIsOpen(false)}>定价</a>
                            <div className="h-px bg-slate-100 my-2" />
                            <button onClick={() => navigate('/login')} className="font-medium">登录</button>
                            <button onClick={() => navigate('/login')} className="bg-indigo-600 text-white py-2 rounded-lg font-medium">免费开始</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const MockDashboard = () => {
    return (
        <div className="relative bg-white rounded-2xl border border-slate-200/60 shadow-2xl p-6 md:p-8 max-w-lg mx-auto md:mr-0 z-10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">本周时间结构</h3>
                    <p className="text-xs text-slate-500">Jan 8 - Jan 14</p>
                </div>
                <Badge color="primary">优良 (A-)</Badge>
            </div>

            {/* Chart Mock - Flex layout for simplicity */}
            <div className="flex gap-6 mb-8">
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                        {/* Deep Work */}
                        <path className="text-indigo-600" strokeDasharray="40, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                        {/* Meetings (offset) */}
                        <path className="text-teal-400" strokeDasharray="30, 100" strokeDashoffset="-40" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-slate-900">42<span className="text-xs text-slate-500 ml-0.5">h</span></span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Total</span>
                    </div>
                </div>

                <div className="flex-1 space-y-3 pt-2">
                    {[
                        { label: "深度工作", val: "40%", hours: "16.8h", color: "bg-indigo-600" },
                        { label: "必要会议", val: "30%", hours: "12.6h", color: "bg-teal-400" },
                        { label: "碎片通讯", val: "20%", hours: "8.4h", color: "bg-slate-300" },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                                    {item.label}
                                </span>
                                <span className="text-slate-600">{item.hours}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-full rounded-full ${item.color}`} style={{ width: item.val }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <Target size={12} />
                        <span>目标对齐</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">92%</div>
                    <div className="text-[10px] text-teal-600 mt-0.5">↑ 5% vs last week</div>
                </div>
                <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                    <div className="flex items-center gap-1.5 text-xs text-red-500 mb-1">
                        <AlertTriangle size={12} />
                        <span>风险提醒</span>
                    </div>
                    <div className="text-xs text-red-900 font-medium leading-tight">周四会议超标 (6h)</div>
                </div>
            </div>

            {/* Decorative Blur */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -z-10" />
        </div>
    );
};

const HeroSection = () => {
    return (
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Aurora */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(circle_at_50%_0%,rgba(109,77,255,0.12)_0%,transparent_60%)] -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
                {/* Left Content */}
                <div className="space-y-8 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge>时间管理 2.0</Badge>
                        <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold text-[#0B1220] tracking-tight leading-[1.15]">
                            看清时间结构，<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">推进目标进展</span>
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            自动把你的日程与记录映射到目标与高能时段，生成可执行的周报与下周排班建议。
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                    >
                        <button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                            开始分析我的时间 <ArrowRight size={18} />
                        </button>
                        <button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-full font-medium transition-all flex items-center justify-center gap-2">
                            <Play size={18} fill="currentColor" className="opacity-80" /> 看 30 秒演示
                        </button>
                    </motion.div>

                    <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-teal-500" /> 不卖隐私数据</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-teal-500" /> 双向同步日历</span>
                    </div>
                </div>

                {/* Right Content - Mock */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative lg:h-[600px] flex items-center justify-center"
                >
                    <MockDashboard />
                    {/* Floating Cards (Decorations) */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute md:top-12 md:-left-8 bg-white p-4 rounded-xl shadow-lg border border-slate-100 hidden md:block"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                <Zap size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-medium">高能时段保护</div>
                                <div className="text-sm font-bold text-slate-800">10:00 - 11:30</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

const BenefitCard = ({ icon: Icon, title, sub, points, index }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all hover:border-indigo-100 group"
    >
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6 leading-relaxed text-sm">{sub}</p>
        <ul className="space-y-3">
            {points.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                </li>
            ))}
        </ul>
    </motion.div>
);

const HowItWorks = () => {
    return (
        <Section className="bg-white rounded-[3rem] my-12 border border-slate-100" >
            <div className="text-center max-w-2xl mx-auto mb-20">
                <Badge>How it works</Badge>
                <h2 className="mt-4 text-3xl font-bold text-slate-900">闭环式时间管理</h2>
                <p className="mt-4 text-slate-600">从规划到复盘，Temporal 嵌入你的完整工作流。</p>
            </div>

            <div className="space-y-24">
                {/* Step 1: Plan */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">1</div>
                        <h3 className="text-2xl font-bold text-slate-900">智能排班，而非简单填空</h3>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            拖拽任务时，AI 自动避开低能时段，锁定你的深度工作窗口。不要让琐事打碎你的黄金时间。
                        </p>
                    </div>
                    <div className="relative aspect-[4/3] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center p-8 group">
                        <div className="w-full h-full bg-white rounded-xl shadow-lg border border-slate-100 p-4 relative">
                            {/* Mock Calendar */}
                            <div className="flex justify-between border-b pb-2 mb-2">
                                <span className="font-semibold text-slate-700">Monday</span>
                            </div>
                            <div className="space-y-2">
                                <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded text-xs text-red-700">
                                    09:00 - 10:00 Weekly Sync
                                </div>
                                {/* Dragging Item */}
                                <div className="p-4 bg-indigo-600 text-white rounded shadow-xl transform rotate-1 scale-105 cursor-grabbing z-10 text-sm font-medium flex justify-between items-center group-hover:translate-y-4 transition-transform duration-700">
                                    <span>编写架构文档</span>
                                    <span className="bg-indigo-500/50 px-1.5 py-0.5 rounded text-[10px]">High Energy</span>
                                </div>
                                <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 h-16 rounded flex items-center justify-center text-xs text-indigo-400 font-medium">
                                    推荐时段 (最佳精力匹配)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 2: Act */}
                <div className="grid lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
                    <div className="lg:order-2 space-y-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">2</div>
                        <h3 className="text-2xl font-bold text-slate-900">沉浸执行，记录真实流向</h3>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            开启专注模式自动屏蔽干扰，基于时间轴的无感记录，还原最真实的一天。你以为你工作了8小时，其实可能只有3小时。
                        </p>
                    </div>
                    <div className="lg:order-1 relative aspect-[4/3] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center p-8">
                        <div className="absolutetop-1/2 left-1/2 w-full max-w-sm">
                            <div className="bg-slate-900 text-white rounded-full px-6 py-4 shadow-2xl flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="font-mono">00:24:15</span>
                                </div>
                                <span className="text-slate-400 text-sm">Design Review</span>
                            </div>
                            <div className="pl-8 border-l-2 border-slate-200 space-y-8 relative">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white bg-slate-300" />
                                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-sm text-slate-500">
                                    <span className="font-bold text-slate-800">10:00</span> Standup Meeting
                                </div>
                                <div className="absolute -left-[9px] top-20 w-4 h-4 rounded-full border-4 border-white bg-indigo-600" />
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 shadow-sm text-sm text-indigo-800 font-medium">
                                    <span className="font-bold">10:30</span> Deep Work: API Design
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 3: Review */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">3</div>
                        <h3 className="text-2xl font-bold text-slate-900">用数据复盘，而非凭感觉</h3>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            周末不再不仅是休息，更是资产盘点。系统自动生成结构化周报，指引你下周如何调整。
                        </p>
                    </div>
                    <div className="relative aspect-[4/3] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center p-8">
                        <div className="w-full bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-slate-900">Weekly Report</h4>
                                <div className="text-2xl font-bold text-indigo-600">B+</div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg text-sm text-red-800">
                                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                    <div>目标偏差警告：项目 A 进度滞后，本周仅投入 2h (计划 8h)。</div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg text-sm text-teal-800">
                                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                                    <div>建议：下周二下午适合安排“深度编码”，已为您预留。</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

const AIDeliverables = () => {
    const cards = [
        {
            title: "本周时间结构报告",
            desc: "你的时间都去哪了？深度工作占比 vs 目标偏差一目了然。",
            icon: BarChart3,
            mock: (
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600"><span>深度工作</span> <span>42%</span></div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="w-[42%] h-full bg-indigo-600" /></div>
                    <div className="flex justify-between items-center text-slate-600 pt-1"><span>管理噪音</span> <span>15%</span></div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="w-[15%] h-full bg-slate-400" /></div>
                </div>
            )
        },
        {
            title: "下周排班建议",
            desc: "基于你的历史数据，建议取消2个低效会议，预留3个高能块。",
            icon: Calendar,
            mock: (
                <div className="bg-indigo-50 p-3 rounded border border-indigo-100 text-xs text-indigo-900">
                    <div className="font-bold mb-1">AI 建议:</div>
                    <div>拒绝 "周三同步会" (低价值)</div>
                    <div className="mt-1">预留 "周四上午" (高能段)</div>
                </div>
            )
        },
        {
            title: "风险与偏差提醒",
            desc: "警报：你在“行政杂务”上花费超过 30%，已偏离季度核心目标。",
            icon: AlertTriangle,
            mock: (
                <div className="flex items-start gap-2 bg-red-50 p-2.5 rounded border border-red-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                    <div className="text-xs text-red-800 leading-tight">
                        偏离目标 "发布 V2.0". <br />当前投入: 15% (Target: 40%)
                    </div>
                </div>
            )
        }
    ];

    return (
        <Section>
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">AI 不是替你努力，<br />而是替你看清结构并给出下一步</h2>
                <p className="text-slate-600">告别虚无的“AI 助手”，这里是实实在在的交付物。</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                            <card.icon size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h3>
                        <p className="text-sm text-slate-500 mb-6 h-10">{card.desc}</p>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 h-28 flex flex-col justify-center">
                            {card.mock}
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

const SocialProof = () => {
    return (
        <section className="bg-slate-900 py-24 text-white">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">不要只听我们要说什么</h2>
                        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 mb-2">6.5h</div>
                        <p className="text-slate-400 text-lg mb-8">平均用户每周挽回的深度工作时间</p>
                    </div>
                    <div className="grid gap-6">
                        {[
                            { q: "以前我只知道我很忙，用 Temporal 后我知道我忙得有没有价值。", a: "产品总监" },
                            { q: "每周自动生成的排班建议，帮我抢回了至少 5 小时的深度思考时间。", a: "独立开发者" },
                            { q: "它不是不仅是日历，它是我的私人时间审计师。", a: "自由撰稿人" }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                                <p className="text-lg text-slate-200 mb-4">"{item.q}"</p>
                                <div className="text-sm font-medium text-slate-500">— {item.a}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

/* --- Main Page Component --- */

export function LandingPage() {

    return (
        <div className="min-h-screen bg-[#F7F8FB] font-sans text-[#0B1220] selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            <HeroSection />

            <div id="benefits">
                <Section>
                    <div className="grid md:grid-cols-3 gap-8">
                        <BenefitCard
                            index={0}
                            icon={Target}
                            title="目标对齐的可视化"
                            sub="这是一个不仅看“做了什么”，更看“为了什么”的视角。"
                            points={["自动关联日程与 OKR", "极简仪表盘展示", "识别无意义的忙碌"]}
                        />
                        <BenefitCard
                            index={1}
                            icon={Clock}
                            title="捍卫你的高能时段"
                            sub="并不是每一小时都等价，别让琐事吞噬你的黄金时间。"
                            points={["识别生理节律/高能窗口", "自动拦截低价值会议", "智能推荐深度时段"]}
                        />
                        <BenefitCard
                            index={2}
                            icon={BarChart3}
                            title="量化时间投资回报"
                            sub="像管理资产一样管理时间，计算每小时的产出 ROI。"
                            points={["信号噪音比 (S/N Ratio)", "深度工作时长趋势", "多维数据导出"]}
                        />
                    </div>
                </Section>
            </div>

            <div id="how-it-works">
                <HowItWorks />
            </div>

            <div id="ai-output">
                <AIDeliverables />
            </div>

            <SocialProof />

            {/* Pricing & Final CTA */}
            <div id="pricing" className="py-24 max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                    <Badge>Pricing</Badge>
                    <h2 className="mt-4 text-3xl font-bold text-slate-900">投资你的时间资产</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200">
                        <h3 className="text-xl font-bold">Free</h3>
                        <div className="text-4xl font-bold my-4">$0</div>
                        <p className="text-slate-500 mb-8">适合个人基础分析与体验。</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex gap-2 text-sm"><CheckCircle2 size={16} className="text-slate-400" /> 7天数据留存</li>
                            <li className="flex gap-2 text-sm"><CheckCircle2 size={16} className="text-slate-400" /> 基础时间结构分析</li>
                        </ul>
                        <button className="w-full py-3 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-colors">免费开始</button>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-white/10 px-3 py-1 text-xs font-medium rounded-bl-xl">Most Popular</div>
                        <h3 className="text-xl font-bold">Pro</h3>
                        <div className="text-4xl font-bold my-4">$12 <span className="text-lg font-normal opacity-70">/mo</span></div>
                        <p className="text-indigo-200 mb-8">完整 AI 教练能力，找回 1 小时即回本。</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex gap-2 text-sm"><CheckCircle2 size={16} className="text-teal-400" /> 无限历史数据</li>
                            <li className="flex gap-2 text-sm"><CheckCircle2 size={16} className="text-teal-400" /> 完整 AI 周报与建议</li>
                            <li className="flex gap-2 text-sm"><CheckCircle2 size={16} className="text-teal-400" /> 风险预警系统</li>
                        </ul>
                        <button className="w-full py-3 rounded-xl font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg">开始 14 天免费试用</button>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mt-24 max-w-2xl mx-auto space-y-8">
                    <h3 className="text-xl font-bold text-center mb-8">常见问题</h3>
                    {[
                        { q: "会卖我的数据吗？", a: "绝不。数据仅存储于本地或加密云端，未经授权绝不用于训练通用模型。" },
                        { q: "需要手动记录吗？", a: "支持全自动（基于日历同步）、半自动（计时器）和手动补录，丰俭由人。" },
                        { q: "支持哪些日历平台？", a: "原生支持 Google Calendar, Outlook, Apple Calendar 双向同步。" }
                    ].map((item, i) => (
                        <div key={i} className="border-b border-slate-200 pb-4">
                            <div className="font-semibold text-slate-900 mb-2">{item.q}</div>
                            <div className="text-slate-600 text-sm leading-relaxed">{item.a}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <h2 className="text-3xl font-bold mb-8">让你的时间成为可迭代的资产</h2>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-full text-lg font-medium transition-all shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1">
                        开始分析我的时间
                    </button>
                </div>
            </div>

            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-slate-600 font-bold text-xs">T</div>
                        <span className="font-medium text-slate-700">Temporal</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-900">Privacy</a>
                        <a href="#" className="hover:text-slate-900">Terms</a>
                        <a href="#" className="hover:text-slate-900">Contact</a>
                    </div>
                    <div className="mt-4 md:mt-0">
                        © 2024 Temporal Inc.
                    </div>
                </div>
            </footer>
        </div>
    );
}
