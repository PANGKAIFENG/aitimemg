
import { motion } from 'framer-motion'

const scenarios = [
    {
        role: '产品经理',
        desc: '项目推进、评审决策、跨团队协同',
        icon: '🚀'
    },
    {
        role: '设计师',
        desc: '深度工作、探索实验、体验打磨',
        icon: '🎨'
    },
    {
        role: '创作者',
        desc: '专注时间、灵感捕捉、内容产出',
        icon: '✍️'
    },
    {
        role: '自由职业者',
        desc: '时间自律、目标追踪、工作边界',
        icon: '🌟'
    }
]

export function UserScenarios() {
    return (
        <section className="scenarios-section" style={{ padding: '6rem 2rem', background: '#FAFAFA' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <h2 className="section-title">为谁设计</h2>
                <p style={{ color: 'var(--color-gray-500)', fontSize: '1.1rem' }}>
                    Temporal 适合那些需要主动掌控时间，而非被动响应的人。
                </p>
            </motion.div>

            <div className="scenarios-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '2rem',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                {scenarios.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '16px',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                            border: '1px solid rgba(0,0,0,0.03)'
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1F2937' }}>{item.role}</h3>
                        <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
