import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WarningOutlined } from '@ant-design/icons'

interface ConfirmModalProps {
    open: boolean
    title: string
    content: React.ReactNode
    onConfirm: () => void
    onCancel: () => void
    confirmText?: string
    cancelText?: string
    confirmButtonColor?: string
    isDanger?: boolean
}

export function ConfirmModal({
    open,
    title,
    content,
    onConfirm,
    onCancel,
    confirmText = '确定',
    cancelText = '取消',
    isDanger = false
}: ConfirmModalProps) {

    // ESC handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onCancel()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, onCancel])

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slightly darker for focus
                        backdropFilter: 'blur(4px)',
                        zIndex: 1100, // Higher than TaskModal
                    }}
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '90%',
                            maxWidth: 400,
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-xl)',
                            overflow: 'hidden',
                            border: '1px solid var(--color-gray-100)',
                        }}
                    >
                        <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
                            {/* Icon */}
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                    color: isDanger ? 'var(--color-danger)' : 'var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    fontSize: 24,
                                }}
                            >
                                <WarningOutlined />
                            </div>

                            {/* Title */}
                            <h3 style={{
                                margin: '0 0 8px',
                                fontSize: 18,
                                fontWeight: 600,
                                color: 'var(--color-gray-800)',
                            }}>
                                {title}
                            </h3>

                            {/* Content */}
                            <div style={{
                                fontSize: 14,
                                color: 'var(--color-gray-600)',
                                lineHeight: 1.6,
                            }}>
                                {content}
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{
                            padding: '24px',
                            display: 'flex',
                            gap: 12,
                            justifyContent: 'center',
                        }}>
                            <button
                                onClick={onCancel}
                                style={{
                                    flex: 1,
                                    padding: '10px 0',
                                    border: '1px solid var(--color-gray-200)',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--color-gray-600)',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {cancelText}
                            </button>

                            <button
                                onClick={onConfirm}
                                style={{
                                    flex: 1,
                                    padding: '10px 0',
                                    border: 'none',
                                    borderRadius: 'var(--radius-full)',
                                    backgroundColor: isDanger ? 'var(--color-danger)' : 'var(--color-primary)',
                                    color: 'white',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-sm)',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                                }}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
