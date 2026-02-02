import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import { ExecutePage } from './features/execute'
import { LandingPage } from './features/landing'
import { LoginPage } from './features/auth/LoginPage'

dayjs.locale('zh-cn')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

// 根路径分发器
function RootDispatcher() {
  const hasOnboarded = localStorage.getItem('temporal_has_onboarded') === 'true'

  if (hasOnboarded) {
    return <Navigate to="/app" replace />
  }

  return <LandingPage />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootDispatcher />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app" element={<ExecutePage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
