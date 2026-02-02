import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// 启用真实认证
const DEV_MODE = false

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    // 本地开发模式，直接跳过认证
    if (DEV_MODE) {
      set({ initialized: true, loading: false })
      return
    }

    // 检测 Supabase 客户端是否存在
    if (!supabase) {
      console.warn('Supabase client not initialized, skipping auth')
      set({ initialized: true, loading: false, user: null, session: null })
      return
    }

    // 设置超时，避免网络问题导致页面卡住
    const timeout = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 3000) // 3秒超时
    })

    try {
      const sessionPromise = supabase.auth.getSession()
      const result = await Promise.race([sessionPromise, timeout])

      if (result === null) {
        // 超时，直接进入未登录状态
        console.warn('Auth initialization timeout, proceeding without auth')
        set({ initialized: true, loading: false })
        return
      }

      const { data: { session }, error } = result

      if (error) {
        console.warn('Auth initialization warning:', error.message)
      }

      set({ session, user: session?.user ?? null, initialized: true, loading: false })

      // 监听认证状态变化
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null })
      })
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      set({ initialized: true, loading: false })
    }
  },

  signOut: async () => {
    if (DEV_MODE) {
      set({ user: null, session: null })
      return
    }
    if (supabase) {
      await supabase.auth.signOut()
    }
    set({ user: null, session: null })
  },
}))
