import { useState, useEffect } from 'react'
import { GithubOutlined } from '@ant-design/icons'

interface NavbarProps {
    onStart: () => void
}

export function Navbar({ onStart }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="logo cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Temporal
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <a
                    href="https://github.com/linctex/temporal"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-gray-600)', fontSize: '1.25rem' }}
                >
                    <GithubOutlined />
                </a>
                <button className="landing-btn btn-primary" onClick={onStart}>
                    立即开始
                </button>
            </div>
        </nav>
    )
}
