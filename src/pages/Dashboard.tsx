import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Book, Users, Eye, MessageSquare, TrendingUp, Calendar, Clock, ChevronRight, Sparkles, BookmarkPlus, Star, User, Heart, PenLine, Flame, AlertTriangle, Megaphone, CheckCircle, CalendarClock, AlertCircle, MessageCircle, Coffee } from 'lucide-react'
import { bookApi, meetupApi, reservationApi, noteApi, feedbackApi } from '@/lib/api'
import { formatDate, sourceTypeLabel, sourceTypeColor, meetupStatusLabel, meetupStatusColor, readerLevelLabel, readerLevelColor, cn, calculateDaysRemaining } from '@/lib/utils'
import type { Book as BookType, Meetup, ReaderRanking, Note, BorrowRecordWithBook, MeetupDiscussionPost } from '../../shared/types'

export default function Dashboard() {
  const [books, setBooks] = useState<BookType[]>([])
  const [borrowRanking, setBorrowRanking] = useState<BookType[]>([])
  const [discussRanking, setDiscussRanking] = useState<BookType[]>([])
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [reservationCount, setReservationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [rankType, setRankType] = useState<'borrow' | 'discuss'>('borrow')
  const [pointsRanking, setPointsRanking] = useState<ReaderRanking[]>([])
  const [borrowCountRanking, setBorrowCountRanking] = useState<ReaderRanking[]>([])
  const [hotNotes, setHotNotes] = useState<Note[]>([])
  const [activeBorrows, setActiveBorrows] = useState<BorrowRecordWithBook[]>([])
  const [overdueBorrows, setOverdueBorrows] = useState<BorrowRecordWithBook[]>([])
  const [sendingReminders, setSendingReminders] = useState<Record<number, boolean>>({})
  const [reminderSuccess, setReminderSuccess] = useState<number | null>(null)
  const [hotDiscussionPosts, setHotDiscussionPosts] = useState<(MeetupDiscussionPost & { meetupTitle?: string; meetupStatus?: string })[]>([])
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, pending: 0, processing: 0, resolved: 0, rejected: 0 })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [allBooks, borrowRank, discussRank, allMeetups, resStats, pointsRank, borrowCountRank, hotNotesData, activeBorrowsData, overdueBorrowsData, hotDiscussionPostsData, fbStats] = await Promise.all([
        bookApi.list(),
        bookApi.ranking('borrow'),
        bookApi.ranking('discuss'),
        meetupApi.list(),
        reservationApi.stats(),
        bookApi.readerRanking('points', 8),
        bookApi.readerRanking('borrow', 8),
        noteApi.hot(5, 7),
        bookApi.getActiveBorrows(),
        bookApi.getOverdueBorrows(),
        meetupApi.getHotDiscussionPosts(5, 7),
        feedbackApi.stats(),
      ])
      setBooks(allBooks)
      setBorrowRanking(borrowRank)
      setDiscussRanking(discussRank)
      setMeetups(allMeetups.slice(0, 5))
      setReservationCount(resStats.count)
      setPointsRanking(pointsRank)
      setBorrowCountRanking(borrowCountRank)
      setHotNotes(hotNotesData)
      setActiveBorrows(activeBorrowsData)
      setOverdueBorrows(overdueBorrowsData)
      setHotDiscussionPosts(hotDiscussionPostsData)
      setFeedbackStats(fbStats)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendReminder(bookId: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      setSendingReminders(prev => ({ ...prev, [bookId]: true }))
      await bookApi.reminder(bookId)
      setReminderSuccess(bookId)
      setTimeout(() => setReminderSuccess(null), 3000)
      const [active, overdue] = await Promise.all([
        bookApi.getActiveBorrows(),
        bookApi.getOverdueBorrows(),
      ])
      setActiveBorrows(active)
      setOverdueBorrows(overdue)
    } catch (err) {
      alert(err instanceof Error ? err.message : '催还失败')
    } finally {
      setSendingReminders(prev => ({ ...prev, [bookId]: false }))
    }
  }

  const stats = [
    {
      label: '馆藏图书',
      value: books.length,
      icon: Book,
      gradient: 'from-coffee-600 to-coffee-800',
      bg: 'bg-coffee-50',
    },
    {
      label: '累计被借阅',
      value: books.reduce((s, b) => s + b.borrowCount, 0),
      icon: Eye,
      gradient: 'from-brass-400 to-brass-600',
      bg: 'bg-amber-50',
    },
    {
      label: '当前预约数',
      value: reservationCount,
      icon: BookmarkPlus,
      gradient: 'from-amber-400 to-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: '读者短评',
      value: books.reduce((s, b) => s + b.discussCount, 0),
      icon: MessageSquare,
      gradient: 'from-forest-500 to-forest-600',
      bg: 'bg-emerald-50',
    },
    {
      label: '读书会活动',
      value: meetups.length,
      icon: Users,
      gradient: 'from-sky-500 to-sky-700',
      bg: 'bg-sky-50',
    },
    {
      label: '注册读者',
      value: pointsRanking.length + borrowCountRanking.length > 0 ? new Set([...pointsRanking, ...borrowCountRanking].map(r => r.nickname)).size : 0,
      icon: User,
      gradient: 'from-purple-500 to-purple-700',
      bg: 'bg-purple-50',
    },
    {
      label: '逾期图书',
      value: overdueBorrows.length,
      icon: AlertTriangle,
      gradient: overdueBorrows.length > 0 ? 'from-red-500 to-red-700' : 'from-gray-400 to-gray-600',
      bg: overdueBorrows.length > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
    {
      label: '反馈总数',
      value: feedbackStats.total,
      icon: MessageSquare,
      gradient: 'from-indigo-500 to-indigo-700',
      bg: 'bg-indigo-50',
    },
    {
      label: '待处理',
      value: feedbackStats.pending,
      icon: Clock,
      gradient: feedbackStats.pending > 0 ? 'from-amber-500 to-amber-700' : 'from-gray-400 to-gray-600',
      bg: feedbackStats.pending > 0 ? 'bg-amber-50' : 'bg-gray-50',
    },
    {
      label: '处理中',
      value: feedbackStats.processing,
      icon: AlertCircle,
      gradient: feedbackStats.processing > 0 ? 'from-blue-500 to-blue-700' : 'from-gray-400 to-gray-600',
      bg: feedbackStats.processing > 0 ? 'bg-blue-50' : 'bg-gray-50',
    },
    {
      label: '已解决',
      value: feedbackStats.resolved,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      label: '不予处理',
      value: feedbackStats.rejected,
      icon: AlertTriangle,
      gradient: 'from-gray-500 to-gray-700',
      bg: 'bg-gray-50',
    },
  ]

  const ranking = rankType === 'borrow' ? borrowRanking : discussRanking

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">欢迎回来 👋</h1>
          <p className="text-coffee-500 mt-1">今天是个读书的好日子</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-coffee-50 to-brass-400/10 border border-coffee-100">
          <Sparkles className="w-4 h-4 text-brass-500" />
          <span className="text-sm text-coffee-700">墨香书坊 · 让每本书都有故事</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              'relative overflow-hidden card p-5 group cursor-pointer',
              'hover:scale-[1.02] transition-transform duration-300'
            )}
          >
            <div className={cn('absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full -translate-y-8 translate-x-8 bg-gradient-to-br', stat.gradient)} />
            <div className="relative">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br text-white', stat.gradient)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl md:text-3xl font-serif font-bold text-coffee-900">{stat.value}</p>
              <p className="text-sm text-coffee-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {feedbackStats.pending > 0 && (
        <Link
          to="/feedbacks"
          className="card p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-coffee-900">有新的意见反馈待处理</p>
              <p className="text-sm text-coffee-600">当前有 <span className="font-bold text-amber-600">{feedbackStats.pending}</span> 条反馈等待处理</p>
            </div>
            <ChevronRight className="w-5 h-5 text-coffee-400 group-hover:text-coffee-600 transition-colors" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-coffee-700" />
              <h2 className="section-title">图书热度排行</h2>
            </div>
            <div className="flex p-1 rounded-lg bg-coffee-50">
              {(['borrow', 'discuss'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setRankType(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    rankType === type
                      ? 'bg-white text-coffee-800 shadow-sm'
                      : 'text-coffee-500 hover:text-coffee-700'
                  )}
                >
                  {type === 'borrow' ? '借阅榜' : '讨论榜'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {ranking.slice(0, 5).map((book, idx) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-coffee-50 transition-colors group"
              >
                <span className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center font-serif font-bold text-sm',
                  idx === 0 ? 'bg-brass-400 text-white' :
                  idx === 1 ? 'bg-coffee-300 text-white' :
                  idx === 2 ? 'bg-amber-600 text-white' :
                  'bg-coffee-100 text-coffee-600'
                )}>
                  {idx + 1}
                </span>
                {book.coverImage && (
                  <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded-md shadow-sm" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-coffee-900 truncate group-hover:text-coffee-700">{book.title}</p>
                  <p className="text-sm text-coffee-500">{book.author}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-coffee-800">
                    {rankType === 'borrow' ? book.borrowCount : book.discussCount}
                  </p>
                  <p className="text-xs text-coffee-400">{rankType === 'borrow' ? '次借阅' : '条短评'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-coffee-300 group-hover:text-coffee-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-coffee-700" />
            <h2 className="section-title">近期读书会</h2>
          </div>
          <div className="space-y-3">
            {meetups.map((meetup) => (
              <Link
                key={meetup.id}
                to={`/meetups/${meetup.id}`}
                className="block p-4 rounded-xl hover:bg-coffee-50 transition-colors group border border-coffee-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-coffee-900 truncate group-hover:text-coffee-700">{meetup.title}</p>
                      <span className={cn('badge border', meetupStatusColor[meetup.status])}>
                        {meetupStatusLabel[meetup.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-coffee-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(meetup.date)}
                      </span>
                      <span>{meetup.currentParticipants}/{meetup.maxParticipants}人</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-coffee-300 group-hover:text-coffee-500 transition-colors flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
            {meetups.length === 0 && (
              <p className="text-center text-coffee-400 py-8 text-sm">暂无活动</p>
            )}
          </div>
          <Link to="/meetups" className="mt-4 flex items-center justify-center gap-1 text-sm text-coffee-600 hover:text-coffee-800 transition-colors">
            查看全部活动
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h2 className="section-title">积分排行榜</h2>
          </div>
          <div className="space-y-2">
            {pointsRanking.slice(0, 8).map((reader, idx) => (
              <Link
                key={reader.nickname}
                to={`/readers/${encodeURIComponent(reader.nickname)}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-coffee-50 transition-colors group"
              >
                <span className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center font-serif font-bold text-xs flex-shrink-0',
                  idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                  idx === 1 ? 'bg-gradient-to-br from-coffee-300 to-coffee-500 text-white' :
                  idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                  'bg-coffee-100 text-coffee-500'
                )}>
                  {idx + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">{reader.nickname.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-coffee-900 truncate group-hover:text-coffee-700 text-sm">{reader.nickname}</p>
                    <span className={cn('badge border text-[10px] py-0 px-1.5', readerLevelColor[reader.level])}>
                      {readerLevelLabel[reader.level]}
                    </span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="font-bold text-coffee-800 text-sm">{reader.points}</p>
                    <p className="text-[10px] text-coffee-400">积分</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-coffee-300 group-hover:text-coffee-500 transition-colors" />
                </div>
              </Link>
            ))}
            {pointsRanking.length === 0 && (
              <p className="text-center text-coffee-400 py-8 text-sm">暂无数据</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
              <Book className="w-4 h-4 text-white" />
            </div>
            <h2 className="section-title">借阅量排行榜</h2>
          </div>
          <div className="space-y-2">
            {borrowCountRanking.slice(0, 8).map((reader, idx) => (
              <Link
                key={reader.nickname}
                to={`/readers/${encodeURIComponent(reader.nickname)}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-coffee-50 transition-colors group"
              >
                <span className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center font-serif font-bold text-xs flex-shrink-0',
                  idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                  idx === 1 ? 'bg-gradient-to-br from-coffee-300 to-coffee-500 text-white' :
                  idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                  'bg-coffee-100 text-coffee-500'
                )}>
                  {idx + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">{reader.nickname.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-coffee-900 truncate group-hover:text-coffee-700 text-sm">{reader.nickname}</p>
                    <span className={cn('badge border text-[10px] py-0 px-1.5', readerLevelColor[reader.level])}>
                      {readerLevelLabel[reader.level]}
                    </span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="font-bold text-coffee-800 text-sm">{reader.borrowCount}</p>
                    <p className="text-[10px] text-coffee-400">次借阅</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-coffee-300 group-hover:text-coffee-500 transition-colors" />
                </div>
              </Link>
            ))}
            {borrowCountRanking.length === 0 && (
              <p className="text-center text-coffee-400 py-8 text-sm">暂无数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <h2 className="section-title">本周热门笔记</h2>
        </div>
        {hotNotes.length === 0 ? (
          <div className="text-center py-12">
            <PenLine className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
            <p className="text-coffee-400">暂无热门笔记</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {hotNotes.map((note, idx) => (
              <Link
                key={note.id}
                to={`/books/${note.bookId}`}
                className="group relative p-4 rounded-xl bg-gradient-to-br from-coffee-50 to-brass-400/5 border border-coffee-100 hover:border-coffee-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center font-serif font-bold text-xs flex-shrink-0',
                    idx === 0 ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white' :
                    idx === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                    idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                    'bg-coffee-200 text-coffee-600'
                  )}>
                    {idx + 1}
                  </span>
                  {note.bookCover && (
                    <img src={note.bookCover} alt="" className="w-10 h-14 object-cover rounded shadow-sm" />
                  )}
                </div>
                <h3 className="font-medium text-coffee-800 text-sm line-clamp-2 mb-2 group-hover:text-coffee-600 transition-colors">
                  {note.title}
                </h3>
                <p className="text-xs text-coffee-500 line-clamp-2 mb-3">
                  {note.content}
                </p>
                <div className="flex items-center justify-between text-[10px] text-coffee-400">
                  <span className="truncate">{note.nickname}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3" />
                      {note.likeCount}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="w-3 h-3" />
                      {note.commentCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h2 className="section-title">社区动态</h2>
          <span className="text-xs text-coffee-400 ml-2">活跃的读书会讨论</span>
        </div>
        {hotDiscussionPosts.length === 0 ? (
          <div className="text-center py-12">
            <Coffee className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
            <p className="text-coffee-400">暂无社区动态</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {hotDiscussionPosts.map((post, idx) => (
              <Link
                key={post.id}
                to={`/meetups/${post.meetupId}`}
                className="group relative p-4 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100/30 border border-sky-100 hover:border-sky-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center font-serif font-bold text-xs flex-shrink-0',
                    idx === 0 ? 'bg-gradient-to-br from-sky-400 to-sky-600 text-white' :
                    idx === 1 ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-white' :
                    idx === 2 ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white' :
                    'bg-sky-200 text-sky-600'
                  )}>
                    {idx + 1}
                  </span>
                  <span className={cn('badge border text-[10px] py-0 px-1.5', 
                    post.meetupStatus ? meetupStatusColor[post.meetupStatus as keyof typeof meetupStatusColor] : 'bg-coffee-100 text-coffee-600 border-coffee-200'
                  )}>
                    {post.meetupStatus ? meetupStatusLabel[post.meetupStatus as keyof typeof meetupStatusLabel] : '读书会'}
                  </span>
                </div>
                <h3 className="font-medium text-coffee-800 text-sm line-clamp-2 mb-2 group-hover:text-coffee-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-coffee-500 line-clamp-2 mb-3">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-[10px] text-coffee-400">
                  <span className="truncate">{post.nickname}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="w-3 h-3" />
                      {post.replyCount}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-sky-100">
                  <p className="text-[10px] text-sky-600 truncate">
                    📚 {post.meetupTitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="section-title mb-4">最近入库</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {books.slice(-5).reverse().map((book) => (
            <Link key={book.id} to={`/books/${book.id}`} className="group">
              <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow mb-2 bg-coffee-100">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-coffee-400">
                    <Book className="w-12 h-12" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-coffee-900 truncate group-hover:text-coffee-700">{book.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('badge border text-[10px]', sourceTypeColor[book.sourceType])}>
                  {sourceTypeLabel[book.sourceType]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {overdueBorrows.length > 0 && (
        <div className="card p-6 border-2 border-red-200 bg-red-50/30">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="section-title text-red-800">逾期未还提醒</h2>
              <p className="text-sm text-red-600/80">共 {overdueBorrows.length} 本图书已逾期，请及时处理</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueBorrows.map((record) => {
              const days = calculateDaysRemaining(record.dueDate)
              return (
                <div
                  key={record.id}
                  className="relative p-4 rounded-xl border-2 border-red-300 bg-white hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 -mr-8 -mt-8 rounded-full" />
                  <div className="flex gap-3 relative">
                    <Link to={`/books/${record.bookId}`} className="flex-shrink-0">
                      <div className="w-16 h-22 rounded-md overflow-hidden bg-coffee-100 shadow-sm">
                        {record.book.coverImage ? (
                          <img src={record.book.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-coffee-400">
                            <Book className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/books/${record.bookId}`} className="block">
                        <p className="font-bold text-coffee-900 line-clamp-2 group-hover:text-coffee-700 mb-1">
                          {record.book.title}
                        </p>
                      </Link>
                      <p className="text-xs text-coffee-500 mb-2">{record.book.author}</p>
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-2 text-xs">
                          <User className="w-3 h-3 text-coffee-400" />
                          <span className="text-coffee-700 font-medium">{record.borrower}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CalendarClock className="w-3 h-3 text-red-500" />
                          <span className="text-red-600 font-semibold">逾期 {Math.abs(days)} 天</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-coffee-500">
                          <span>应还：{formatDate(record.dueDate)}</span>
                        </div>
                        {record.reminderCount > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="badge border bg-red-100 text-red-700 border-red-200 py-0.5 px-2">
                              已催 {record.reminderCount} 次
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/books/${record.bookId}`}
                          className="flex-1 text-xs py-2 rounded-lg bg-coffee-100 text-coffee-700 text-center hover:bg-coffee-200 transition-colors font-medium"
                        >
                          查看详情
                        </Link>
                        <button
                          onClick={(e) => handleSendReminder(record.bookId, e)}
                          disabled={sendingReminders[record.bookId]}
                          className={cn(
                            'flex-1 text-xs py-2 rounded-lg text-white text-center font-medium transition-all duration-200 inline-flex items-center justify-center gap-1.5 shadow-sm',
                            reminderSuccess === record.bookId
                              ? 'bg-forest-600'
                              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
                            sendingReminders[record.bookId] && 'opacity-70 cursor-not-allowed'
                          )}
                        >
                          {sendingReminders[record.bookId] ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              发送中
                            </span>
                          ) : reminderSuccess === record.bookId ? (
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              已发送
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <Megaphone className="w-3.5 h-3.5" />
                              催还
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="section-title">借阅管理</h2>
              <p className="text-sm text-coffee-500">当前借阅中 {activeBorrows.length} 本，逾期 {overdueBorrows.length} 本</p>
            </div>
          </div>
        </div>
        {activeBorrows.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
            <p className="text-coffee-400">暂无借阅中的图书</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b-2 border-coffee-100">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-coffee-600 uppercase tracking-wider">图书</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-coffee-600 uppercase tracking-wider">借阅人</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-coffee-600 uppercase tracking-wider">借阅日</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-coffee-600 uppercase tracking-wider">应还日</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-coffee-600 uppercase tracking-wider">状态</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-coffee-600 uppercase tracking-wider">催还</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-coffee-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-50">
                {activeBorrows.slice(0, 10).map((record) => {
                  const days = calculateDaysRemaining(record.dueDate)
                  const isOverdue = days < 0
                  const isWarning = days >= 0 && days <= 7
                  return (
                    <tr
                      key={record.id}
                      className={cn(
                        'transition-colors hover:bg-coffee-50/50',
                        isOverdue && 'bg-red-50/50'
                      )}
                    >
                      <td className="py-3 px-3">
                        <Link to={`/books/${record.bookId}`} className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded overflow-hidden bg-coffee-100 flex-shrink-0">
                            {record.book.coverImage ? (
                              <img src={record.book.coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-coffee-400">
                                <Book className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[180px]">
                            <p className="font-medium text-coffee-800 text-sm truncate">{record.book.title}</p>
                            <p className="text-xs text-coffee-500 truncate">{record.book.author}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-coffee-700 text-sm">{record.borrower}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-sm text-coffee-600">{formatDate(record.borrowDate)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={cn(
                          "text-sm font-medium",
                          isOverdue ? "text-red-600" : isWarning ? "text-amber-600" : "text-coffee-600"
                        )}>
                          {formatDate(record.dueDate)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={cn(
                          "badge border font-medium py-1 px-3",
                          isOverdue
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : isWarning
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-forest-100 text-forest-700 border-forest-200'
                        )}>
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              逾期 {Math.abs(days)} 天
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="w-3 h-3" />
                              剩余 {days} 天
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {record.reminderCount > 0 ? (
                          <span className="badge border bg-amber-100 text-amber-700 border-amber-200 py-1 px-2 text-xs">
                            {record.reminderCount} 次
                          </span>
                        ) : (
                          <span className="text-xs text-coffee-400">未催还</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/books/${record.bookId}`}
                            className="text-xs px-3 py-1.5 rounded-md bg-coffee-100 text-coffee-700 hover:bg-coffee-200 transition-colors font-medium"
                          >
                            查看
                          </Link>
                          <button
                            onClick={(e) => handleSendReminder(record.bookId, e)}
                            disabled={sendingReminders[record.bookId]}
                            className={cn(
                              "text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 inline-flex items-center gap-1",
                              reminderSuccess === record.bookId
                                ? 'bg-forest-600 text-white'
                                : isOverdue
                                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
                                  : 'bg-coffee-200 text-coffee-700 hover:bg-coffee-300',
                              sendingReminders[record.bookId] && 'opacity-70 cursor-not-allowed'
                            )}
                          >
                            {sendingReminders[record.bookId] ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : reminderSuccess === record.bookId ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Megaphone className="w-3.5 h-3.5" />
                            )}
                            {sendingReminders[record.bookId] ? '发送中' : reminderSuccess === record.bookId ? '已发送' : '催还'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
