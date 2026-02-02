import type { Task } from '../types'

// 提取历史标签的工具函数
export function extractTagsFromTasks(tasks: Task[]): string[] {
    const tagSet = new Set<string>()

    // 按时间倒序排列，确保最新标签在前
    tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .forEach((task) => {
            // 匹配所有被 【】 包裹的内容
            const matches = task.title.match(/【([^】]+)】/g)
            if (matches) {
                matches.forEach((match) => {
                    const tag = match.replace(/[【】]/g, '')
                    if (tag) {
                        tagSet.add(tag)
                    }
                })
            }
        })

    // 返回去重后的前 8 个最新标签
    return Array.from(tagSet).slice(0, 8)
}
