// 阿里云函数计算 API 客户端
const API_BASE = 'https://api.aitimemg.cn/api';

export const cloudApi = {
    // 合并同步接口（一次获取所有数据）
    async syncAll(): Promise<{ tasks: any[]; schedules: any[] }> {
        const response = await fetch(`${API_BASE}/sync`);
        if (!response.ok) throw new Error('Failed to sync data');
        return response.json();
    },

    // 获取所有任务
    async getTasks(): Promise<any[]> {
        const response = await fetch(`${API_BASE}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return response.json();
    },

    // 保存任务
    async saveTask(task: any): Promise<any> {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
        if (!response.ok) throw new Error('Failed to save task');
        return response.json();
    },

    // 删除任务
    async deleteTask(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete task');
    },

    // 获取所有排班
    async getSchedules(): Promise<any[]> {
        const response = await fetch(`${API_BASE}/schedules`);
        if (!response.ok) throw new Error('Failed to fetch schedules');
        return response.json();
    },

    // 保存排班
    async saveSchedule(schedule: any): Promise<any> {
        const response = await fetch(`${API_BASE}/schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(schedule),
        });
        if (!response.ok) throw new Error('Failed to save schedule');
        return response.json();
    },

    // 删除排班
    async deleteSchedule(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/schedules/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete schedule');
    },
};
