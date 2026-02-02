import { motion } from 'framer-motion'

const features = [
    {
        phase: '📌 规划',
        title: '带着意图开始每一天',
        items: [
            'Cmd+K 快速创建任务',
            '【】标签自动高亮',
            '拖拽排班到时间轴'
        ],
        color: '#3B82F6',
        visual: (
            <div style={{ background: '#EFF6FF', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '20px', gap: '10px' }}>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(59,130,246,0.1)' }}>
                    <span style={{ color: '#3B82F6', fontWeight: 600 }}>[Deep Work]</span> Write algorithm
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(59,130,246,0.1)' }}>
                    <span style={{ color: '#6B7280', fontWeight: 600 }}>[Admin]</span> Reply emails
                </div>
                <div style={{ border: '2px dashed #BFDBFE', borderRadius: '8px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                    Drag to Schedule
                </div>
            </div>
        )
    },
    {
        phase: '⏱️ 执行',
        title: '保持专注，灵活调整',
        items: [
            '时间轴可视化管理',
            '拖拽调整时间和时长',
            '当前时间红线指引'
        ],
        color: '#10B981',
        visual: (
            <div style={{ background: '#ECFDF5', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '0', display: 'flex' }}>
                    <div style={{ width: '40px', borderRight: '1px solid #D1FAE5', paddingTop: '10px', fontSize: '10px', color: '#10B981' }}>09:00<br /><br />10:00</div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '60px', background: 'white', borderLeft: '3px solid #10B981', borderRadius: '4px', padding: '8px', fontSize: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            Frontend Dev
                        </div>
                        <div style={{ position: 'absolute', top: '45px', left: '0', right: '0', height: '2px', background: '#EF4444', zIndex: 10 }}>
                            <div style={{ position: 'absolute', left: '-4px', top: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        phase: '📊 复盘',
        title: '看见时间去向',
        items: [
            '周统计数据概览',
            '深度工作时长追踪',
            '结构化 CSV 导出'
        ],
        color: '#8B5CF6',
        visual: (
            <div style={{ background: '#F5F3FF', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
                    <div style={{ width: '30px', height: '40%', background: '#DDD6FE', borderRadius: '4px' }} />
                    <div style={{ width: '30px', height: '70%', background: '#C4B5FD', borderRadius: '4px' }} />
                    <div style={{ width: '30px', height: '50%', background: '#A78BFA', borderRadius: '4px' }} />
                    <div style={{ width: '30px', height: '90%', background: '#8B5CF6', borderRadius: '4px' }} />
                </div>
            </div>
        )
    }
]

export function Features() {
    return (
        <section className="features-section">
            <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                三步掌控你的时间
            </motion.h2>

            <div className="features-flow">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        className="feature-row"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ flexDirection: index % 2 === 1 ? 'row-reverse' : 'row' }}
                    >
                        <div className="feature-text-block">
                            <div className="feature-phase" style={{ background: feature.color, alignSelf: 'flex-start' }}>
                                {feature.phase}
                            </div>
                            <h3 className="feature-step-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{feature.title}</h3>
                            <ul className="feature-items">
                                {feature.items.map((item, i) => (
                                    <li key={i} style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="feature-visual-block">
                            {feature.visual}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
