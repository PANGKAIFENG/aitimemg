import { Typography } from 'antd'

const { Title, Text } = Typography

export function ExportPage() {
  return (
    <div>
      <Title level={3}>数据导出</Title>
      <Text type="secondary">导出任务数据为 CSV（开发中...）</Text>
    </div>
  )
}
