import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export function Footer() {
    const navigate = useNavigate()

    return (
        <footer style={{ background: '#111827', color: 'white' }}>
            {/* CTA Section */}
            <div style={{ padding: '6rem 2rem', textAlign: 'center', borderBottom: '1px solid #374151' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>
                        开始认知你的时间
                    </h2>
                    <p style={{ color: '#9CA3AF', marginBottom: '2.5rem', fontSize: '1.2rem' }}>
                        免费开始使用 Temporal，重塑你的工作流。
                    </p>
                    <button
                        className="landing-btn btn-primary"
                        style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}
                        onClick={() => navigate('/app')}
                    >
                        免费注册
                    </button>
                </motion.div>
            </div>

            {/* Links Section */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem' }}>
                <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', background: 'linear-gradient(45deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Temporal</div>
                    <p style={{ color: '#9CA3AF', lineHeight: 1.6 }}>
                        不再让时间悄悄流逝。<br />
                        看见它，记录它，掌控它。
                    </p>
                </div>

                <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>产品</h4>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#9CA3AF', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li>功能</li>
                        <li>定价</li>
                        <li>更新日志</li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>资源</h4>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#9CA3AF', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li>帮助中心</li>
                        <li>API 文档</li>
                        <li>社区</li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>关于</h4>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#9CA3AF', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li>团队</li>
                        <li>联系我们</li>
                        <li>Twitter</li>
                    </ul>
                </div>
            </div>

            <div style={{ borderTop: '1px solid #374151', padding: '2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.9rem' }}>
                © {new Date().getFullYear()} Temporal. All rights reserved.
            </div>
        </footer>
    )
}
