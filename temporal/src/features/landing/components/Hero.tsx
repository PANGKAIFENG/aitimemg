import { motion } from 'framer-motion'

interface HeroProps {
    onStart: () => void
}

export function Hero({ onStart }: HeroProps) {
    return (
        <div className="landing-hero" style={{
            background: 'var(--bg-page)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 顶部微光效果 - 浅色版 */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                height: '80%',
                background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}
            >
                {/* 品牌名小标 - 浅色版 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        background: 'rgba(99, 102, 241, 0.05)',
                        border: '1px solid rgba(99, 102, 241, 0.1)',
                        borderRadius: '100px',
                        fontSize: '13px',
                        color: 'var(--accent-primary)',
                        marginBottom: '1.5rem',
                        fontWeight: 500
                    }}
                >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                    Temporal AI 1.0 Preview
                </motion.div>

                {/* 主标题 - 浅色版 */}
                <h1 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: '2rem',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.03em',
                    backgroundImage: 'linear-gradient(180deg, #111827 0%, #4B5563 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    看见时间，<br />
                    掌控节奏
                </h1>

                {/* 副标题 - 浅色版 */}
                <p style={{
                    fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    margin: '0 auto 3rem',
                    lineHeight: 1.6
                }}>
                    不只是日程管理，而是帮你理解自己的时间结构。<br />
                    <span style={{ color: '#374151', fontWeight: 500 }}>让 AI 成为你的私人时间教练。</span>
                </p>

                {/* CTA 按钮 - 浅色版 */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        className="landing-btn"
                        onClick={onStart}
                        style={{
                            padding: '12px 32px',
                            fontSize: '1rem',
                            background: '#111827',
                            color: '#FFFFFF',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05)'
                        }}
                    >
                        免费开始
                    </button>
                    <button
                        className="landing-btn"
                        onClick={() => document.querySelector('.features-section')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{
                            padding: '12px 24px',
                            fontSize: '1rem',
                            background: 'white',
                            color: '#374151',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        了解更多
                    </button>
                </div>
            </motion.div>

            {/* 产品预览区域 (3D 倾斜效果 - 浅色版) */}
            <motion.div
                initial={{ opacity: 0, y: 100, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                style={{
                    perspective: '1000px',
                    marginTop: '6rem',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <div style={{
                    position: 'relative',
                    width: '90%',
                    maxWidth: '1100px',
                    transformStyle: 'preserve-3d',
                }}>
                    {/* 浅色发光边框 */}
                    <div style={{
                        position: 'absolute',
                        inset: '-1px',
                        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 100%)',
                        borderRadius: '16px',
                        zIndex: 0
                    }} />

                    {/* 主界面容器 - 浅色玻璃白 */}
                    <div style={{
                        position: 'relative',
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.03)',
                        zIndex: 1,
                        aspectRatio: '16/10'
                    }}>
                        {/* 模拟界面头部 */}
                        <div style={{
                            height: '48px',
                            borderBottom: '1px solid #F3F4F6',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 20px',
                            gap: '12px',
                            background: '#FAFAFA'
                        }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E5E7EB' }} />
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E5E7EB' }} />
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E5E7EB' }} />
                            </div>
                        </div>

                        {/* 界面内容 */}
                        <div style={{ display: 'flex', height: 'calc(100% - 48px)' }}>
                            {/* 左侧栏 */}
                            <div style={{ width: '240px', borderRight: '1px solid #F3F4F6', padding: '20px', background: '#FAFAFA' }}>
                                <div style={{ width: '60%', height: '12px', background: '#E5E7EB', borderRadius: '4px', marginBottom: '24px' }} />
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '16px', height: '16px', background: '#E5E7EB', borderRadius: '4px' }} />
                                        <div style={{ width: '70%', height: '10px', background: '#F3F4F6', borderRadius: '4px' }} />
                                    </div>
                                ))}
                            </div>

                            {/* 时间轴区域 */}
                            <div style={{ flex: 1, padding: '20px', position: 'relative', background: '#FFFFFF' }}>
                                {/* 时间刻度线 */}
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{
                                        height: '80px',
                                        borderBottom: '1px solid #F3F4F6',
                                        display: 'flex'
                                    }}>
                                        <span style={{ fontSize: '12px', color: '#9CA3AF', width: '50px', fontFamily: 'monospace' }}>{i + 8}:00</span>
                                    </div>
                                ))}

                                {/* 任务卡片 1 - 浅色 */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: 'auto' }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    style={{
                                        position: 'absolute',
                                        top: '40px',
                                        left: '70px',
                                        right: '40px',
                                        height: '60px',
                                        background: 'rgba(99, 102, 241, 0.05)',
                                        borderLeft: '3px solid #6366F1',
                                        borderRadius: '4px',
                                        padding: '12px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ width: '120px', height: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '2px', marginBottom: '8px' }} />
                                    <div style={{ width: '80px', height: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '2px' }} />
                                </motion.div>

                                {/* 任务卡片 2 - 高亮 - 浅色 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1.2 }}
                                    style={{
                                        position: 'absolute',
                                        top: '130px',
                                        left: '70px',
                                        right: '40px',
                                        height: '90px',
                                        background: '#FFFFFF',
                                        borderLeft: '3px solid #10B981',
                                        borderRadius: '6px',
                                        padding: '16px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ width: '180px', height: '12px', background: '#10B981', borderRadius: '2px', opacity: 0.6 }} />
                                        <div style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '100px', fontSize: '10px', color: '#10B981', fontWeight: 600 }}>Deep Work</div>
                                    </div>
                                    <div style={{ width: '240px', height: '10px', background: '#F3F4F6', borderRadius: '2px' }} />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
