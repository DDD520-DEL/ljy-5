import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Book, Users, Eye, MessageSquare, TrendingUp, Calendar, Clock, ChevronRight, Sparkles, BookmarkPlus, Star, User, Heart, PenLine, Flame } from 'lucide-react'
import { bookApi, meetupApi, reservationApi, noteApi } from '@/lib/api'
import { formatDate, sourceTypeLabel, sourceTypeColor, meetupStatusLabel, meetupStatusColor, readerLevelLabel, readerLevelColor, cn } from '@/lib/utils'
import type { Book as BookType, Meetup, ReaderRanking, Note } from '../../shared/types'

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

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [allBooks, borrowRank, discussRank, allMeetups, resStats, pointsRank, borrowCountRank, hotNotesData] = await Promise.all([
        bookApi.list(),
        bookApi.ranking('borrow'),
        bookApi.ranking('discuss'),
        meetupApi.list(),
        reservationApi.stats(),
        bookApi.readerRanking('points', 8),
        bookApi.readerRanking('borrow', 8),
        noteApi.hot(5, 7),
      ])
      setBooks(allBooks)
      setBorrowRanking(borrowRank)
      setDiscussRanking(discussRank)
      setMeetups(allMeetups.slice(0, 5))
      setReservationCount(resStats.count)
      setPointsRanking(pointsRank)
      setBorrowCountRanking(borrowCountRank)
      setHotNotes(hotNotesData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
    </div>
  )
}
