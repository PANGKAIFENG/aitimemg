import { Layout, Menu, Button, Dropdown, DatePicker, Space } from 'antd'
import {
  AppstoreOutlined,
  ScheduleOutlined,
  ExportOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores'
import dayjs from 'dayjs'
import { useState } from 'react'

const { Header, Content } = Layout

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuthStore()
  const [selectedDate, setSelectedDate] = useState(dayjs())

  const menuItems = [
    {
      key: '/quadrant',
      icon: <AppstoreOutlined />,
      label: '四象限',
    },
    {
      key: '/timeline',
      icon: <ScheduleOutlined />,
      label: '时间轴',
    },
    {
      key: '/export',
      icon: <ExportOutlined />,
      label: '导出',
    },
  ]

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: async () => {
        await signOut()
        navigate('/login')
      },
    },
  ]

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Temporal</h1>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ border: 'none', minWidth: 300 }}
          />
        </div>

        <Space size="middle">
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            allowClear={false}
            format="YYYY-MM-DD"
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button icon={<UserOutlined />}>{user?.email?.split('@')[0]}</Button>
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ padding: 24, background: '#f5f5f5' }}>
        <Outlet context={{ selectedDate, setSelectedDate }} />
      </Content>
    </Layout>
  )
}
