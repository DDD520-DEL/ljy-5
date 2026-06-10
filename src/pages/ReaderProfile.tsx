import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  User,
  ArrowLeft,
  BookOpen,
  Star,
  MessageSquare,
  Users,
  Gift,
  TrendingUp,
  Calendar,
  Book,
  Award,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Eye,
  PenLine,
  Lock,
  Globe,
  AlertTriangle,
  CalendarClock,
  Bell,
  Mail,
} from 'lucide-react'
import { bookApi } from '@/lib/api'
import {
  formatDate,
  formatDateTime,
  readerLevelLabel,
  readerLevelColor,
  readerLevelMinPoints,
  pointsActionLabel,
  pointsActionColor,
  getLevelProgress,
  donationReviewStatusLabel,
  donationReviewStatusColor,
  noteVisibilityLabel,
  noteVisibilityColor,
  cn,
  calculateDaysRemaining,
} from '@/lib/utils'
import type { ReaderProfile as ReaderProfileType, Review, PointsLog, DonationReview, Note, BorrowRecordWithBook, Notification } from '../../shared/types'

export default function ReaderProfile() {
  const { nickname } = useParams<{ nickname: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ReaderProfileType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'history' | 'borrow' | 'current' | 'overdue' | 'reviews' | 'notes' | 'meetups' | 'donations' | 'notifications'>('history')
  const [activeBorrows, setActiveBorrows] = useState<BorrowRecordWithBook[]>([])
  const [overdueBorrows, setOverdueBorrows] = useState<BorrowRecordWithBook[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [markingRead, setMarkingRead] = useState<Record<number, boolean>>({})

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const decodedNickname = decodeURIComponent(nickname!)
      const [profileData, notifData] = await Promise.all([
        bookApi.readerProfile(decodedNickname),
        bookApi.getNotifications(decodedNickname).catch(() => []),
      ])
      setProfile(profileData)
      setNotifications(notifData)
      const allActive = profileData.currentBorrowings || []
      setActiveBorrows(allActive)
      setOverdueBorrows(allActive.filter(b => b.status === 'overdue'))
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [nickname])

  useEffect(() => {
    if (!nickname) return
    loadProfile()
  }, [nickname, loadProfile])

  async function handleMarkNotificationRead(id: number) {
    try {
      setMarkingRead(prev => ({ ...prev, [id]: true }))
      await bookApi.markNotificationRead(decodeURIComponent(nickname!), id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error(err)
    } finally {
      setMarkingRead(prev => ({ ...prev, [id]: false }))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-white rounded-lg w-24 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-white rounded-xl animate-pulse" />
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 bg-white rounded-xl animate-pulse" />
            <div className="h-80 bg-white rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <div className="card p-12 text-center">
          <User className="w-16 h-16 text-coffee-300 mx-auto mb-4" />
          <p className="text-coffee-600 font-medium mb-1">{error || '读者不存在'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            返回仪表盘
          </button>
        </div>
      </div>
    )
  }

  const { account, logs, borrowHistory, reviews, notes, meetups, donations, donationReviews } = profile
  const levelProgress = getLevelProgress(account.points)

  const stats = [
    { label: '累计积分', value: account.points, icon: Star, color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50' },
    { label: '当前借阅', value: activeBorrows.length, icon: BookOpen, color: 'from-sky-500 to-sky-700', bg: 'bg-sky-50' },
    { label: '逾期图书', value: overdueBorrows.length, icon: AlertTriangle, color: overdueBorrows.length > 0 ? 'from-red-500 to-red-700' : 'from-gray-400 to-gray-600', bg: overdueBorrows.length > 0 ? 'bg-red-50' : 'bg-gray-50' },
    { label: '发表书评', value: account.reviewCount, icon: MessageSquare, color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-50' },
    { label: '未读通知', value: notifications.filter(n => !n.read).length, icon: Bell, color: notifications.filter(n => !n.read).length > 0 ? 'from-purple-500 to-purple-700' : 'from-gray-400 to-gray-600', bg: notifications.filter(n => !n.read).length > 0 ? 'bg-purple-50' : 'bg-gray-50' },
  ]

  const tabs: Array<{
    id: 'history' | 'borrow' | 'current' | 'overdue' | 'reviews' | 'notes' | 'meetups' | 'donations' | 'notifications'
    label: string
    icon: any
    count: number
    badge?: { count: number; color: string }
  }> = [
    { id: 'history', label: '积分动态', icon: TrendingUp, count: logs.length },
    { id: 'current', label: '当前借阅', icon: CalendarClock, count: activeBorrows.length, badge: overdueBorrows.length > 0 ? { count: overdueBorrows.length, color: 'bg-red-500 text-white' } : undefined },
    { id: 'overdue', label: '逾期记录', icon: AlertTriangle, count: overdueBorrows.length, badge: overdueBorrows.length > 0 ? { count: overdueBorrows.length, color: 'bg-red-500 text-white' } : undefined },
    { id: 'borrow', label: '借阅历史', icon: BookOpen, count: borrowHistory.length },
    { id: 'reviews', label: '发表书评', icon: MessageSquare, count: reviews.length },
    { id: 'notes', label: '读书笔记', icon: PenLine, count: notes.length },
    { id: 'notifications', label: '通知中心', icon: Bell, count: notifications.length, badge: notifications.filter(n => !n.read).length > 0 ? { count: notifications.filter(n => !n.read).length, color: 'bg-red-500 text-white' } : undefined },
    { id: 'meetups', label: '读书会', icon: Users, count: meetups.length },
    { id: 'donations', label: '捐赠图书', icon: Gift, count: donations.length + (donationReviews?.length || 0) },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="card p-6">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-3xl font-serif font-bold">
                  {account.nickname.charAt(0)}
                </span>
              </div>
              <h1 className="page-title text-xl mb-1">{account.nickname}</h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={cn('badge border', readerLevelColor[account.level])}>
                  <Award className="w-3 h-3 mr-1" />
                  {readerLevelLabel[account.level]}
                </span>
              </div>

              <div className="text-left mb-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-coffee-500">升级进度</span>
                  <span className="text-coffee-700 font-medium">
                    {levelProgress.nextLevel
                      ? `${account.points} / ${levelProgress.maxPoints}`
                      : '已达最高等级'}
                  </span>
                </div>
                <div className="h-2 bg-coffee-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
                      account.level === 'bookworm' ? 'from-coffee-400 to-coffee-600' :
                      account.level === 'booklover' ? 'from-amber-400 to-amber-600' :
                      account.level === 'bookmaniac' ? 'from-emerald-400 to-emerald-600' :
                      'from-purple-400 to-purple-600'
                    )}
                    style={{ width: `${levelProgress.progress}%` }}
                  />
                </div>
                {levelProgress.nextLevel && (
                  <p className="text-xs text-coffee-400 mt-1.5 text-center">
                    还差 {levelProgress.maxPoints - account.points} 积分升级为 {readerLevelLabel[levelProgress.nextLevel]}
                  </p>
                )}
              </div>

              <div className="text-xs text-coffee-400 space-y-1">
                <p>注册于 {formatDate(account.createdAt)}</p>
                <p>最近活跃 {formatDate(account.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="section-title flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-brass-500" />
              等级说明
            </h3>
            <div className="space-y-2">
              {(Object.entries(readerLevelLabel) as [keyof typeof readerLevelLabel, string][]).map(([level, label]) => (
                <div
                  key={level}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-all',
                    account.level === level
                      ? 'bg-gradient-to-r from-coffee-50 to-brass-400/10 border-coffee-200'
                      : 'bg-white border-coffee-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('badge border', readerLevelColor[level])}>
                      {label}
                    </span>
                    {account.level === level && (
                      <span className="text-xs text-coffee-600 font-medium">当前等级</span>
                    )}
                  </div>
                  <span className="text-xs text-coffee-500">
                    {readerLevelMinPoints[level]} 积分起
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  'relative overflow-hidden card p-4 group cursor-pointer',
                  'hover:scale-[1.02] transition-transform duration-300'
                )}
              >
                <div className={cn('absolute top-0 right-0 w-20 h-20 opacity-10 rounded-full -translate-y-6 translate-x-6 bg-gradient-to-br', stat.color)} />
                <div className="relative">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br text-white', stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl md:text-2xl font-serif font-bold text-coffee-900">{stat.value}</p>
                  <p className="text-xs text-coffee-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap relative',
                    activeTab === tab.id
                      ? 'bg-coffee-700 text-white shadow-md'
                      : 'text-coffee-500 hover:text-coffee-700 hover:bg-coffee-50'
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={cn(
                      'px-1.5 py-0.5 rounded-full text-xs',
                      activeTab === tab.id ? 'bg-white/20' : 'bg-coffee-100'
                    )}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className={cn(
                      'absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shadow',
                      tab.badge.color
                    )}>
                      {tab.badge.count > 99 ? '99+' : tab.badge.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[300px]">
              {activeTab === 'history' && (
                <div className="space-y-3">
                  {logs.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                      <p className="text-coffee-400">暂无积分动态</p>
                    </div>
                  ) : (
                    logs.map((log: PointsLog) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 hover:border-coffee-200 transition-colors"
                      >
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', pointsActionColor[log.action])}>
                          {log.action === 'borrow' && <BookOpen className="w-5 h-5" />}
                          {log.action === 'review' && <MessageSquare className="w-5 h-5" />}
                          {log.action === 'meetup' && <Users className="w-5 h-5" />}
                          {log.action === 'donation' && <Gift className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-coffee-800">{pointsActionLabel[log.action]}</p>
                          <p className="text-sm text-coffee-500 truncate">{log.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-emerald-600">+{log.points}</p>
                          <p className="text-xs text-coffee-400 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'current' && (
                <div className="space-y-3">
                  {activeBorrows.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarClock className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                      <p className="text-coffee-400">当前没有借阅中的图书</p>
                    </div>
                  ) : (
                    activeBorrows.map((record) => {
                      const days = calculateDaysRemaining(record.dueDate)
                      const isOverdue = days < 0
                      const isWarning = days >= 0 && days <= 7
                      return (
                        <Link
                          key={record.id}
                          to={`/books/${record.bookId}`}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border group transition-all",
                            isOverdue
                              ? "bg-red-50/50 border-red-200 hover:border-red-300"
                              : "bg-coffee-50/50 border-coffee-100 hover:border-coffee-200"
                          )}
                        >
                          <div className="w-14 h-20 rounded-md overflow-hidden bg-coffee-100 shadow-sm flex-shrink-0">
                            {record.book.coverImage ? (
                              <img src={record.book.coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-coffee-400">
                                <Book className="w-7 h-7" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-coffee-800 truncate group-hover:text-coffee-600">
                              {record.book.title}
                            </p>
                            <p className="text-sm text-coffee-500 mb-2">{record.book.author}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="inline-flex items-center gap-1 text-coffee-600">
                                <Calendar className="w-3 h-3" />
                                借阅：{formatDate(record.borrowDate)}
                              </span>
                              <span className={cn(
                                "inline-flex items-center gap-1 font-medium",
                                isOverdue ? "text-red-600" : isWarning ? "text-amber-600" : "text-forest-600"
                              )}>
                                <CalendarClock className="w-3 h-3" />
                                应还：{formatDate(record.dueDate)}
                              </span>
                              <span className={cn(
                                "badge border font-medium py-0.5 px-2",
                                isOverdue
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : isWarning
                                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                                    : 'bg-forest-100 text-forest-700 border-forest-200'
                              )}>
                                {isOverdue ? (
                                  <span className="inline-flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    逾期 {Math.abs(days)} 天
                                  </span>
                                ) : (
                                  <span>剩余 {days} 天</span>
                                )}
                              </span>
                              {record.reminderCount > 0 && (
                                <span className="badge border bg-amber-100 text-amber-700 border-amber-200 py-0.5 px-2">
                                  被催 {record.reminderCount} 次
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-coffee-300 group-hover:text-coffee-500 transition-colors flex-shrink-0" />
                        </Link>
                      )
                    })
                  )}
                </div>
              )}

              {activeTab === 'overdue' && (
                <div className="space-y-3">
                  {overdueBorrows.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-forest-300 mx-auto mb-3" />
                      <p className="text-coffee-500">太棒了！没有逾期图书</p>
                      <p className="text-sm text-coffee-400 mt-1">请保持按时还书的好习惯</p>
                    </div>
                  ) : (
                    overdueBorrows.map((record) => {
                      const days = calculateDaysRemaining(record.dueDate)
                      return (
                        <Link
                          key={record.id}
                          to={`/books/${record.bookId}`}
                          className="flex items-center gap-4 p-4 rounded-xl border-2 border-red-300 bg-red-50/60 hover:border-red-400 hover:bg-red-50 group transition-all"
                        >
                          <div className="w-14 h-20 rounded-md overflow-hidden bg-coffee-100 shadow-sm flex-shrink-0 relative">
                            {record.book.coverImage ? (
                              <img src={record.book.coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-coffee-400">
                                <Book className="w-7 h-7" />
                              </div>
                            )}
                            <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-[10px] py-0.5 text-center font-bold">
                              OVERDUE
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-bold text-coffee-900 truncate group-hover:text-coffee-700">
                                {record.book.title}
                              </p>
                              <span className="badge border bg-red-200 text-red-800 border-red-300 font-bold py-0.5 px-2 flex-shrink-0">
                                逾期 {Math.abs(days)} 天
                              </span>
                            </div>
                            <p className="text-sm text-coffee-500 mb-2">{record.book.author}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className="inline-flex items-center gap-1 text-coffee-600">
                                <Calendar className="w-3 h-3" />
                                借阅：{formatDate(record.borrowDate)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                                <CalendarClock className="w-3 h-3" />
                                应还：{formatDate(record.dueDate)}
                              </span>
                              {record.reminderCount > 0 && (
                                <span className="badge border bg-amber-100 text-amber-700 border-amber-200 py-0.5 px-2 inline-flex items-center gap-1">
                                  <Bell className="w-3 h-3" />
                                  被催 {record.reminderCount} 次
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              请尽快归还，以免产生额外费用或影响后续借阅权限
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors flex-shrink-0" />
                        </Link>
                      )
                    })
                  )}
                </div>
              )}

              {activeTab === 'borrow' && (
                <div className="space-y-3">
                  {borrowHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                      <p className="text-coffee-400">暂无借阅记录</p>
                    </div>
                  ) : (
                    borrowHistory.map((item, idx) => (
                      <Link
                        key={`${item.book.id}-${idx}`}
                        to={`/books/${item.book.id}`}
                        className="flex items-center gap-4 p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 hover:border-coffee-200 transition-colors group"
                      >
                        {item.book.coverImage && (
                          <img src={item.book.coverImage} alt={item.book.title} className="w-12 h-16 object-cover rounded-md shadow-sm" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-coffee-800 truncate group-hover:text-coffee-600">{item.book.title}</p>
                          <p className="text-sm text-coffee-500">{item.book.author}</p>
                          <p className="text-xs text-coffee-400 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.traceLog.timestamp)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-coffee-300 group-hover:text-coffee-500 transition-colors flex-shrink-0" />
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                      <p className="text-coffee-400">暂无书评</p>
                    </div>
                  ) : (
                    reviews.map((review: Review) => (
                      <Link
                        key={review.id}
                        to={`/books/${review.bookId}`}
                        className="block p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 hover:border-coffee-200 transition-colors group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                            {Array.from({ length: 5 - review.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 text-coffee-200" />
                            ))}
                          </div>
                          <span className="text-xs text-coffee-400">{formatDateTime(review.createdAt)}</span>
                        </div>
                        <p className="text-coffee-700 text-sm leading-relaxed line-clamp-2 mb-2">
                          {review.content}
                        </p>
                        <p className="text-xs text-coffee-500 group-hover:text-coffee-700 transition-colors">
                          查看图书 →
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-12">
                      <PenLine className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                      <p className="text-coffee-400">暂无读书笔记</p>
                    </div>
                  ) : (
                    notes.map((note: Note) => (
                      <Link
                        key={note.id}
                        to={`/books/${note.bookId}`}
                        className="block p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 hover:border-coffee-200 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-coffee-800 mb-1 group-hover:text-coffee-600 transition-colors">
                              {note.title}
                            </h4>
                            {note.bookTitle && (
                              <p className="text-xs text-coffee-500">{note.bookTitle}</p>
                            )}
                          </div>
                          <span className={cn('badge border text-[10px] flex-shrink-0', noteVisibilityColor[note.visibility])}>
                            {note.visibility === 'private' && <Lock className="w-3 h-3 mr-0.5" />}
                            {note.visibility === 'public' && <Globe className="w-3 h-3 mr-0.5" />}
                            {noteVisibilityLabel[note.visibility]}
                          </span>
                        </div>
                        <p className="text-coffee-700 text-sm leading-relaxed line-clamp-3 mb-3">
                          {note.content}
                        </p>
                        {note.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-1 mb-3">
                            {note.images.slice(0, 4).map((img, idx) => (
                              <div key={idx} className="aspect-square rounded overflow-hidden bg-coffee-100">
                                <img src={img} alt={`配图${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-coffee-500">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {note.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {note.commentCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {note.viewCount}
                            </span>
                          </div>
                          <span className="text-xs text-coffee-400">{formatDateTime(note.createdAt)}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'meetups' && (
                <div className="space-y-3">
                  {meetups.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                      <p className="text-coffee-400">暂无读书会参与记录</p>
                    </div>
                  ) : (
                    meetups.map((item) => (
                      <Link
                        key={item.meetup.id}
                        to={`/meetups/${item.meetup.id}`}
                        className="block p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 hover:border-coffee-200 transition-colors group"
                      >
                        <p className="font-medium text-coffee-800 group-hover:text-coffee-600 mb-1">
                          {item.meetup.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-coffee-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.meetup.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {item.meetup.currentParticipants}/{item.meetup.maxParticipants}人
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                      <p className="text-coffee-400">暂无通知</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "p-4 rounded-xl border transition-all",
                          notif.read
                            ? "bg-white border-coffee-100"
                            : "bg-amber-50/50 border-amber-200 shadow-sm"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            notif.type === 'reminder' ? 'bg-red-100 text-red-600' :
                            notif.type === 'reservation' ? 'bg-sky-100 text-sky-600' :
                            'bg-coffee-100 text-coffee-600'
                          )}>
                            {notif.type === 'reminder' && <AlertTriangle className="w-5 h-5" />}
                            {notif.type === 'reservation' && <Calendar className="w-5 h-5" />}
                            {notif.type === 'system' && <Bell className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <p className={cn(
                                  "font-semibold",
                                  notif.read ? 'text-coffee-700' : 'text-coffee-900'
                                )}>
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {notif.emailSent && (
                                  <span className="badge border bg-sky-100 text-sky-600 border-sky-200 py-0.5 px-1.5 text-[10px] inline-flex items-center gap-0.5">
                                    <Mail className="w-2.5 h-2.5" />
                                    邮件
                                  </span>
                                )}
                                {!notif.read && (
                                  <button
                                    onClick={() => handleMarkNotificationRead(notif.id)}
                                    disabled={markingRead[notif.id]}
                                    className={cn(
                                      "text-xs px-2 py-1 rounded-md transition-colors font-medium",
                                      markingRead[notif.id]
                                        ? 'bg-coffee-100 text-coffee-400'
                                        : 'bg-coffee-200 text-coffee-700 hover:bg-coffee-300'
                                    )}
                                  >
                                    {markingRead[notif.id] ? '...' : '标已读'}
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className={cn(
                              "text-sm mb-2",
                              notif.read ? 'text-coffee-500' : 'text-coffee-600'
                            )}>
                              {notif.content}
                            </p>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-coffee-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(notif.createdAt)}
                              </span>
                              {notif.relatedBookId && (
                                <Link
                                  to={`/books/${notif.relatedBookId}`}
                                  className="text-coffee-600 hover:text-coffee-800 font-medium inline-flex items-center gap-0.5"
                                >
                                  查看图书
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'donations' && (
                <div className="space-y-6">
                  {(donationReviews && donationReviews.length > 0) && (
                    <div>
                      <h4 className="text-sm font-medium text-coffee-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        审核进度
                      </h4>
                      <div className="space-y-3">
                        {donationReviews.map((review: DonationReview) => (
                          <div
                            key={review.id}
                            className={cn(
                              'p-4 rounded-xl border transition-colors',
                              review.status === 'pending' && 'bg-amber-50/50 border-amber-200',
                              review.status === 'approved' && 'bg-emerald-50/50 border-emerald-200',
                              review.status === 'rejected' && 'bg-red-50/50 border-red-200',
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-coffee-800 truncate">{review.title}</p>
                                  <span className={cn('badge border text-[10px]', donationReviewStatusColor[review.status])}>
                                    {donationReviewStatusLabel[review.status]}
                                  </span>
                                </div>
                                <p className="text-sm text-coffee-500">{review.author}</p>
                                <p className="text-xs text-coffee-400 flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  提交于 {formatDateTime(review.createdAt)}
                                </p>
                                {review.status === 'approved' && review.bookId && (
                                  <Link
                                    to={`/books/${review.bookId}`}
                                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 mt-2 transition-colors"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    查看已入库图书
                                    <ChevronRight className="w-3 h-3" />
                                  </Link>
                                )}
                                {review.status === 'rejected' && review.reviewNote && (
                                  <div className="mt-2 p-2 bg-red-50 rounded-md border border-red-100">
                                    <p className="text-xs text-red-600">
                                      <span className="font-medium">驳回原因：</span>{review.reviewNote}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {review.status === 'pending' && <Clock className="w-5 h-5 text-amber-400" />}
                                {review.status === 'approved' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                {review.status === 'rejected' && <XCircle className="w-5 h-5 text-red-400" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    {donations.length === 0 && (!donationReviews || donationReviews.length === 0) ? (
                      <div className="text-center py-12">
                        <Gift className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                        <p className="text-coffee-400">暂无捐赠记录</p>
                      </div>
                    ) : donations.length > 0 ? (
                      <div>
                        {(donationReviews && donationReviews.length > 0) && (
                          <h4 className="text-sm font-medium text-coffee-700 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            已入库图书
                          </h4>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {donations.map((book) => (
                            <Link key={book.id} to={`/books/${book.id}`} className="group">
                              <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow mb-2 bg-coffee-100">
                                {book.coverImage ? (
                                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-coffee-400">
                                    <Book className="w-8 h-8" />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm font-medium text-coffee-900 truncate group-hover:text-coffee-700">{book.title}</p>
                              <p className="text-xs text-coffee-500 truncate">{book.author}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
