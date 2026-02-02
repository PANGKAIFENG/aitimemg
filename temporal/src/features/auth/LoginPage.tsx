import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd'
import { MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()

  const handleEmailAuth = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })
        if (error) throw error
        message.success('登录成功')
        navigate('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        })
        if (error) throw error
        message.success('注册成功，请查收验证邮件')
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Google 登录失败')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Temporal
          </Title>
          <Text type="secondary">{isLogin ? '登录你的账户' : '创建新账户'}</Text>
        </div>

        <Form<LoginFormValues> onFinish={handleEmailAuth} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {isLogin ? '登录' : '注册'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <Button icon={<GoogleOutlined />} onClick={handleGoogleLogin} block size="large">
          使用 Google 登录
        </Button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">
            {isLogin ? '还没有账户？' : '已有账户？'}
            <Button type="link" onClick={() => setIsLogin(!isLogin)} style={{ padding: '0 4px' }}>
              {isLogin ? '立即注册' : '立即登录'}
            </Button>
          </Text>
        </div>
      </Card>
    </div>
  )
}
