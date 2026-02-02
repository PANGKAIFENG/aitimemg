import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores'
import { Spin } from 'antd'

// 生产环境启用认证
const DEV_MODE = false

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, initialized } = useAuthStore()
  const location = useLocation()

  // 开发模式跳过认证（调试用）
  if (DEV_MODE) {
    return <>{children}</>
  }

  if (!initialized || loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
