import { motion } from 'framer-motion'

const philosophyItems = [
    {
        icon: '🎯',
        title: 'What — 我在做什么？',
        description: '每个任务都有身份：属于哪个战场？什么类型？主责还是支援？',
        color: '#3B82F6'
    },
    {
        icon: '⏰',
        title: 'When — 什么时候在做？',
        description: '你的高能时段在哪里？被会议占用了？还是留给了深度工作？',
        color: '#10B981'
    },
    {
        icon: '📊',
        title: 'How Much — 多少有效时间？',
        description: '深度工作时长是多少？信号和噪音的比例如何？',
        color: '#8B5CF6'
    }
]

export function Philosophy() {
    return (
        <section className="philosophy-section">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <h2 className="section-title">时间管理的本质</h2>
                <p style={{ color: 'var(--color-gray-500)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.7 }}>
                    没有这三层的清晰认知，时间记录就是流水账。<br />
                    有了这三层认知，时间记录才变成「时间资产的经营日志」。
                </p>
            </motion.div>

            <div className="philosophy-grid">
                {philosophyItems.map((item, index) => (
                    <motion.div
                        key={index}
                        className="philosophy-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.15 }}
                    >
                        <div className="philosophy-icon" style={{ borderColor: item.color }}>
                            {item.icon}
                        </div>
                        <h3 className="philosophy-title">{item.title}</h3>
                        <p className="philosophy-desc">{item.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
