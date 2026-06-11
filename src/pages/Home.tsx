import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, QrCode, Heart, MapPin, Clock, Coffee, Sparkles, ChevronRight, BookMarked, Star, User, Tag, Eye, Globe, MessageSquare } from 'lucide-react'
import FeedbackModal from '@/components/FeedbackModal'
import NotificationCenter from '@/components/NotificationCenter'
import { bookApi, bookshelfApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Book as BookType, Bookshelf } from '../../shared/types'

export default function Home() {
  const [nickname, setNickname] = useState<string>('爱读书的猫')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [recommendBooks, setRecommendBooks] = useState<BookType[]>([])
  const [recommendReason, setRecommendReason] = useState('')
  const [recommendLoading, setRecommendLoading] = useState(true)
  const [popularBookshelves, setPopularBookshelves] = useState<Bookshelf[]>([])
  const [bookshelvesLoading, setBookshelvesLoading] = useState(true)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setRecommendLoading(true)
        const result = await bookApi.recommend(nickname, 6)
        setRecommendBooks(result.books)
        setRecommendReason(result.reason)
      } catch (err) {
        console.error(err)
      } finally {
        setRecommendLoading(false)
      }
    }
    loadRecommendations()
  }, [nickname])

  useEffect(() => {
    async function loadPopularBookshelves() {
      try {
        setBookshelvesLoading(true)
        const result = await bookshelfApi.listPublic({ limit: 4, sort: 'popular' })
        setPopularBookshelves(result)
      } catch (err) {
        console.error(err)
      } finally {
        setBookshelvesLoading(false)
      }
    }
    loadPopularBookshelves()
  }, [])

  const readerNicknames = [
    '爱读书的猫',
    '夜读者',
    '小王子的玫瑰',
    '书虫阿明',
    '追风筝的人',
    '文字的力量',
    '夜读者',
  ]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const features = [
    {
      icon: QrCode,
      title: '图书溯源',
      description: '每一本书都有独一无二的溯源档案，记录它的旅程故事',
      color: 'from-coffee-500 to-coffee-700',
    },
    {
      icon: BookMarked,
      title: '前任读者短评',
      description: '穿越时空与读过这本书的人对话，感受文字的温度',
      color: 'from-brass-400 to-brass-600',
    },
    {
      icon: Users,
      title: '线下读书会',
      description: '和志同道合的朋友围坐一起，分享阅读的喜悦与感动',
      color: 'from-forest-500 to-forest-600',
    },
    {
      icon: Heart,
      title: '独立书店精神',
      description: '我们相信每一本书都有灵魂，每一位读者都值得被尊重',
      color: 'from-rose-500 to-rose-700',
    },
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-coffee-100">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-coffee-900">墨香书坊</h1>
              <p className="text-[10px] text-coffee-500 -mt-0.5">溯源与读书会</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/books"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors"
            >
              浏览馆藏
            </Link>
            <Link
              to="/meetups"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors"
            >
              读书会
            </Link>
            <Link
              to="/dashboard"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors"
            >
              管理后台
            </Link>

            <div className="flex items-center gap-1 ml-2">
              <NotificationCenter nickname={nickname} variant="home" />

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coffee-50 hover:bg-coffee-100 transition-colors"
                >
                  <User className="w-4 h-4 text-coffee-600" />
                  <span className="text-sm text-coffee-700 max-w-[100px] truncate">{nickname}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-coffee-100 py-2 animate-fade-in z-50">
                    <div className="px-3 py-2 border-b border-coffee-50">
                      <p className="text-xs text-coffee-500">切换身份（模拟读者）</p>
                    </div>
                    <div className="py-1 max-h-60 overflow-y-auto">
                      {readerNicknames.map((name) => (
                        <button
                          key={name}
                          onClick={() => {
                            setNickname(name)
                            setShowUserMenu(false)
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm transition-colors',
                            nickname === name
                              ? 'bg-coffee-50 text-coffee-800 font-medium'
                              : 'text-coffee-600 hover:bg-coffee-50'
                          )}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2 border-t border-coffee-50">
                      <Link
                        to={`/readers/${encodeURIComponent(nickname)}`}
                        className="block text-sm text-coffee-600 hover:text-coffee-800"
                        onClick={() => setShowUserMenu(false)}
                      >
                        查看个人主页
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-20 px-4 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coffee-50 via-amber-50/50 to-coffee-100" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brass-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-forest-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative container max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-coffee-200 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-brass-500" />
            <span className="text-sm text-coffee-700">欢迎来到墨香书坊</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-coffee-900 mb-6 leading-tight">
            让每一本书
            <br />
            <span className="bg-gradient-to-r from-coffee-700 via-brass-500 to-coffee-700 bg-clip-text text-transparent">
              都有故事
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-coffee-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            一家有温度的独立书店。我们相信，书籍不仅仅是纸张与油墨的组合，
            更是一段段流转的记忆。扫码溯源，遇见这本书的前世今生。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-coffee-700 text-white rounded-xl font-medium hover:bg-coffee-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <BookOpen className="w-5 h-5" />
              浏览馆藏
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/meetups"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-coffee-700 border border-coffee-300 rounded-xl font-medium hover:bg-coffee-50 transition-all duration-300 hover:shadow-md"
            >
              <Users className="w-5 h-5" />
              参加读书会
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { label: '馆藏图书', value: '5000+' },
              { label: '读书会', value: '200+' },
              { label: '注册会员', value: '1200+' },
              { label: '成立年份', value: '2015' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4">
                <p className="text-3xl md:text-4xl font-serif font-bold text-coffee-800">{stat.value}</p>
                <p className="text-sm text-coffee-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-coffee-900 mb-4">
              我们的特色
            </h2>
            <p className="text-coffee-600 max-w-xl mx-auto">
              墨香书坊不仅仅是一家书店，更是一个有温度的文化空间
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="group relative p-8 bg-white rounded-2xl border border-coffee-100 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-coffee-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-coffee-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute top-6 right-6 text-5xl font-serif font-bold text-coffee-50 opacity-30 group-hover:opacity-50 transition-opacity">
                  0{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-4 bg-gradient-to-b from-coffee-50 to-white">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-coffee-200 mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 text-brass-500" />
              <span className="text-sm text-coffee-700">个性化推荐</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-coffee-900 mb-3">
              猜你喜欢
            </h2>
            <p className="text-coffee-600 max-w-xl mx-auto">
              {recommendReason || '根据您的阅读偏好为您精选'}
            </p>
          </div>

          {recommendLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-coffee-100 rounded-lg mb-2" />
                  <div className="h-4 bg-coffee-100 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-coffee-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recommendBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="group"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-coffee-100 mb-3 relative shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-coffee-300">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <h4 className="font-medium text-coffee-900 text-sm truncate group-hover:text-coffee-700 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-xs text-coffee-500 truncate mt-0.5">{book.author}</p>
                  {book.tags && book.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {book.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-coffee-50 text-coffee-600 border border-coffee-100">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-coffee-400">
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      {book.borrowCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
              <p className="text-coffee-400">暂无推荐，快去借阅几本书吧</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-coffee-700 border border-coffee-300 rounded-xl hover:bg-coffee-50 transition-all duration-300"
            >
              浏览全部馆藏
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-coffee-50/50 to-white">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-200 mb-4 shadow-sm">
              <BookMarked className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-700">精选书单</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-coffee-900 mb-3">
              热门公开书单
            </h2>
            <p className="text-coffee-600 max-w-xl mx-auto">
              发现其他读者精心整理的书单，找到你的下一本好书
            </p>
          </div>

          {bookshelvesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-coffee-100 rounded-xl mb-3" />
                  <div className="h-5 bg-coffee-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-coffee-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-coffee-100 rounded w-full mb-3" />
                  <div className="flex gap-4">
                    <div className="h-3 bg-coffee-100 rounded w-12" />
                    <div className="h-3 bg-coffee-100 rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : popularBookshelves.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularBookshelves.map((bookshelf) => (
                <Link
                  key={bookshelf.id}
                  to={`/bookshelves/${bookshelf.id}`}
                  className="group"
                >
                  <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 mb-4 relative shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    {bookshelf.coverImage ? (
                      <img
                        src={bookshelf.coverImage}
                        alt={bookshelf.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500">
                        <BookMarked className="w-12 h-12 text-white/80" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-medium text-emerald-700 border border-emerald-200">
                        <Globe className="w-3 h-3" />
                        公开
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-coffee-800 truncate group-hover:text-indigo-600 transition-colors">
                      {bookshelf.name}
                    </h4>
                  </div>
                  <p className="text-xs text-coffee-500 mb-2">by {bookshelf.nickname}</p>
                  {bookshelf.description && (
                    <p className="text-sm text-coffee-600 line-clamp-2 mb-3">
                      {bookshelf.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-coffee-500">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {bookshelf.bookCount} 本
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {bookshelf.likeCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookMarked className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
              <p className="text-coffee-400">暂无公开书单</p>
            </div>
          )}
        </div>
      </section>
      
      <section className="py-20 px-4 bg-gradient-to-b from-white to-coffee-50">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coffee-100 text-coffee-700 text-sm mb-6">
                <BookOpen className="w-4 h-4" />
                关于我们
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-coffee-900 mb-6 leading-tight">
                一家藏在巷子里的
                <br />
                <span className="text-brass-500">十年独立书店</span>
              </h2>
              <div className="space-y-4 text-coffee-600 leading-relaxed">
                <p>
                  墨香书坊成立于2015年，坐落在城市最有烟火气的老巷子里。
                  我们相信，阅读是一场穿越时空的对话，而每一本流转的书，
                  都承载着无数读者的情感与记忆。
                </p>
                <p>
                  在这里，你可以找到刚出版的新书，也可以偶遇带着前任读者
                  批注与温度的旧书。我们记录每本书的来源与流转，让你知道
                  你正在读的这本书，曾经被谁爱过。
                </p>
                <p>
                  每周我们都会举办线下读书会，和志同道合的朋友围坐在一起，
                  就着咖啡与茶香，聊书、聊生活、聊我们所处的这个时代。
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-coffee-600">
                  <MapPin className="w-4 h-4 text-brass-500" />
                  <span className="text-sm">文化路12号巷内50米</span>
                </div>
                <div className="flex items-center gap-2 text-coffee-600">
                  <Clock className="w-4 h-4 text-brass-500" />
                  <span className="text-sm">每日 10:00 - 21:00</span>
                </div>
                <div className="flex items-center gap-2 text-coffee-600">
                  <Coffee className="w-4 h-4 text-brass-500" />
                  <span className="text-sm">提供手冲咖啡与茶饮</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20independent%20bookstore%20interior%20warm%20lighting%20wooden%20shelves%20people%20reading%20comfortable%20armchairs%20plants%20vintage%20style&image_size=portrait_4_3"
                  alt="墨香书坊内景"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-coffee-100 max-w-[200px]">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-brass-400 text-brass-400" />
                  ))}
                </div>
                <p className="text-sm text-coffee-800 font-medium">
                  "城市里最温暖的角落"
                </p>
                <p className="text-xs text-coffee-500 mt-1">— 读者留言</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 bg-coffee-800">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
            准备好开始你的阅读之旅了吗？
          </h2>
          <p className="text-coffee-200 mb-8 max-w-xl mx-auto">
            走进墨香书坊，翻开一本书，遇见一段跨越时空的对话。
            也许下一个留下故事的人，就是你。
          </p>
          <Link
            to="/books/new"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brass-500 text-white rounded-xl font-medium hover:bg-brass-600 transition-all duration-300 hover:shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
            捐赠你的旧书
          </Link>
        </div>
      </section>
      
      <footer className="py-8 px-4 bg-coffee-900">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-brass-400" />
            <span className="font-serif font-bold text-white">墨香书坊</span>
          </div>
          <div className="flex items-center justify-center gap-6 mb-4">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="inline-flex items-center gap-1.5 text-sm text-coffee-300 hover:text-brass-400 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              意见反馈
            </button>
          </div>
          <p className="text-coffee-400 text-xs">
            © 2026 墨香书坊 · 让每一本书都有故事
          </p>
        </div>
      </footer>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        defaultNickname={nickname}
      />
    </div>
  )
}
