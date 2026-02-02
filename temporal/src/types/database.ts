// Supabase 数据库类型定义
// 这个文件定义了数据库表的 TypeScript 类型

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          importance: number | null
          urgency: number | null
          quadrant: string | null
          status: string
          tags: string[] | null
          completion_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          importance?: number | null
          urgency?: number | null
          quadrant?: string | null
          status?: string
          tags?: string[] | null
          completion_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          importance?: number | null
          urgency?: number | null
          quadrant?: string | null
          status?: string
          tags?: string[] | null
          completion_note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_events: {
        Row: {
          id: string
          task_id: string
          user_id: string
          start_at: string
          end_at: string
          duration_min: number
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          start_at: string
          end_at: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          start_at?: string
          end_at?: string
          created_at?: string
        }
      }
    }
  }
}
