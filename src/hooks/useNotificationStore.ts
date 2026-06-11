import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Notification } from '../../shared/types'
import { bookApi } from '@/lib/api'

interface NotificationState {
  notifications: Notification[]
  currentNickname: string | null
  isLoading: boolean
  isOpen: boolean

  setCurrentNickname: (nickname: string | null) => void
  fetchNotifications: (nickname: string) => Promise<void>
  markAsRead: (nickname: string, notificationId: number) => Promise<void>
  markAllAsRead: (nickname: string) => Promise<void>
  addNotification: (notification: Notification) => void
  setOpen: (open: boolean) => void
  toggleOpen: () => void
  clearLocal: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      currentNickname: null,
      isLoading: false,
      isOpen: false,

      setCurrentNickname: (nickname) => {
        if (nickname !== get().currentNickname) {
          set({ currentNickname: nickname, notifications: [] })
          if (nickname) {
            get().fetchNotifications(nickname)
          }
        }
      },

      fetchNotifications: async (nickname) => {
        if (!nickname) return
        set({ isLoading: true })
        try {
          const data = await bookApi.getNotifications(nickname)
          set({ notifications: data })
        } catch (err) {
          console.error('获取通知失败:', err)
        } finally {
          set({ isLoading: false })
        }
      },

      markAsRead: async (nickname, notificationId) => {
        try {
          await bookApi.markNotificationRead(nickname, notificationId)
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            ),
          }))
        } catch (err) {
          console.error('标记已读失败:', err)
        }
      },

      markAllAsRead: async (nickname) => {
        try {
          await bookApi.markAllNotificationsRead(nickname)
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
          }))
        } catch (err) {
          console.error('标记全部已读失败:', err)
        }
      },

      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }))
      },

      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      clearLocal: () => {
        set({ notifications: [], currentNickname: null, isOpen: false })
      },
    }),
    {
      name: 'bookstore-notifications',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        currentNickname: state.currentNickname,
      }),
    }
  )
)

export const selectUnreadCount = (state: NotificationState) =>
  state.notifications.filter((n) => !n.read).length

export const selectSortedNotifications = (state: NotificationState) =>
  [...state.notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
