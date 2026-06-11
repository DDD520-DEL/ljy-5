import { useEffect, useRef } from 'react'
import { Bell, CheckCheck, Clock, BookOpen, Users, MessageSquare, Heart, Gift, AlertCircle, X } from 'lucide-react'
import { useNotificationStore, selectUnreadCount, selectSortedNotifications } from '@/hooks/useNotificationStore'
import { cn, formatDateTime } from '@/lib/utils'
import type { Notification, NotificationType } from '../../shared/types'

const iconMap: Record<NotificationType, typeof Bell> = {
  reminder: AlertCircle,
  system: Bell,
  reservation: BookOpen,
  reservation_available: BookOpen,
  meetup_register: Users,
  comment_reply: MessageSquare,
  note_like: Heart,
  donation_approved: Gift,
  donation_rejected: Gift,
}

const colorMap: Record<NotificationType, string> = {
  reminder: 'bg-red-100 text-red-600',
  system: 'bg-coffee-100 text-coffee-600',
  reservation: 'bg-brass-100 text-brass-600',
  reservation_available: 'bg-emerald-100 text-emerald-600',
  meetup_register: 'bg-purple-100 text-purple-600',
  comment_reply: 'bg-sky-100 text-sky-600',
  note_like: 'bg-rose-100 text-rose-600',
  donation_approved: 'bg-emerald-100 text-emerald-600',
  donation_rejected: 'bg-amber-100 text-amber-600',
}

interface NotificationCenterProps {
  nickname?: string
  variant?: 'default' | 'home'
}

export default function NotificationCenter({ nickname, variant = 'default' }: NotificationCenterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    isOpen,
    setOpen,
    toggleOpen,
    markAsRead,
    markAllAsRead,
    currentNickname,
    setCurrentNickname,
    fetchNotifications,
  } = useNotificationStore()
  const unreadCount = useNotificationStore(selectUnreadCount)
  const notifications = useNotificationStore(selectSortedNotifications)

  useEffect(() => {
    if (nickname) {
      setCurrentNickname(nickname)
    }
  }, [nickname, setCurrentNickname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setOpen])

  const handleMarkAsRead = (n: Notification) => {
    if (n.read || !currentNickname) return
    markAsRead(currentNickname, n.id)
  }

  const handleMarkAllAsRead = () => {
    if (!currentNickname || unreadCount === 0) return
    markAllAsRead(currentNickname)
  }

  const handleRefresh = () => {
    if (currentNickname) {
      fetchNotifications(currentNickname)
    }
  }

  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString()

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => {
          toggleOpen()
          if (isOpen === false) handleRefresh()
        }}
        className={cn(
          'relative p-2 rounded-lg transition-all duration-200',
          variant === 'home'
            ? 'text-coffee-600 hover:bg-coffee-50 hover:text-coffee-800'
            : 'text-coffee-600 hover:bg-coffee-50 hover:text-coffee-800'
        )}
        aria-label="通知中心"
      >
        <Bell className={cn('w-5 h-5', variant === 'home' ? 'w-5 h-5' : 'w-5 h-5')} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
            {displayCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-coffee-100 overflow-hidden animate-fade-in',
            variant === 'home' ? 'right-0' : 'right-0'
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-coffee-50 border-b border-coffee-100">
            <h3 className="font-semibold text-coffee-800 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              消息通知
              {unreadCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                  {unreadCount} 条未读
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs px-2.5 py-1 rounded-md text-coffee-600 hover:bg-coffee-100 transition-colors flex items-center gap-1"
                  title="全部标为已读"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  全部已读
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-coffee-500 hover:bg-coffee-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <Bell className="w-10 h-10 mx-auto text-coffee-300 mb-3" />
                <p className="text-coffee-500 text-sm">暂无通知消息</p>
              </div>
            ) : (
              <ul className="divide-y divide-coffee-50">
                {notifications.map((n) => {
                  const Icon = iconMap[n.type] || Bell
                  return (
                    <li
                      key={n.id}
                      onClick={() => handleMarkAsRead(n)}
                      className={cn(
                        'px-4 py-3 cursor-pointer transition-colors',
                        n.read ? 'bg-white hover:bg-coffee-50/50' : 'bg-coffee-50/60 hover:bg-coffee-50'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', colorMap[n.type])}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn('text-sm font-medium', n.read ? 'text-coffee-700' : 'text-coffee-900')}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-coffee-600 mt-1 leading-relaxed line-clamp-2">
                            {n.content}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-coffee-400">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(n.createdAt)}
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-coffee-50/50 border-t border-coffee-100 text-center">
              <p className="text-xs text-coffee-500">
                共 {notifications.length} 条通知，按时间倒序排列
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
