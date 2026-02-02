import { motion } from 'framer-motion'

const differentiators = [
    {
        icon: '⚡',
        title: '轻量记录',
        description: '单次操作 < 10秒，Cmd+K 快速创建，不打断心流'
    },
    {
        icon: '🏷️',
        title: '结构化标签',
        description: '【类型-深度】【责任】自定义体系，让每条时间都有"身份"'
    },
    {
        icon: '👁️',
        title: '觉察优于提醒',
        description: '不做推送和警报，让你自己发现规律，培养时间敏感度'
    },
    {
        icon: '🤖',
        title: 'AI 友好导出',
        description: '结构化 CSV 导出，可直接交给 AI 分析你的时间模式'
    }
]

export function Differentiators() {
    return (
        <section className="differentiators-section">
            <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                为什么选择 Temporal
            </motion.h2>

            <div className="differentiators-grid">
                {differentiators.map((item, index) => (
                    <motion.div
                        key={index}
                        className="diff-card"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <span className="diff-icon">{item.icon}</span>
                        <div>
                            <h3 className="diff-title">{item.title}</h3>
                            <p className="diff-desc">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
