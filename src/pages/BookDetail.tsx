import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Calendar,
  User,
  QrCode,
  BookOpen,
  Clock,
  Star,
  MessageSquarePlus,
  Eye,
  CheckCircle,
  Send,
  ArrowLeft,
  Book,
  BarChart3,
  MessageSquare,
  X,
  BookmarkPlus,
  RotateCcw,
  Users,
  Bell,
  AlertCircle,
} from 'lucide-react'
import { bookApi, reservationApi } from '@/lib/api'
import {
  formatDateTime,
  sourceTypeLabel,
  sourceTypeColor,
  renderStars,
  cn,
} from '@/lib/utils'
import type { Book as BookType, TraceLog, Review, Reservation } from '../../shared/types'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [book, setBook] = useState<BookType | null>(null)
  const [traceLogs, setTraceLogs] = useState<TraceLog[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [qrcodeData, setQrcodeData] = useState<{ qrcode: string; traceId: string; traceUrl: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nickname, setNickname] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const [borrowing, setBorrowing] = useState(false)
  const [borrowSuccess, setBorrowSuccess] = useState(false)

  const [showQrcode, setShowQrcode] = useState(false)

  const [isBorrowed, setIsBorrowed] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [resNickname, setResNickname] = useState('')
  const [resContact, setResContact] = useState('')
  const [submittingReservation, setSubmittingReservation] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [returning, setReturning] = useState(false)
  const [returnSuccess, setReturnSuccess] = useState(false)
  const [notifiedName, setNotifiedName] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const bookId = Number(id)

      const [bookData, traceData, reviewsData, qrcodeDataResult, statusData, reservationsData] = await Promise.all([
        bookApi.get(bookId),
        bookApi.trace(bookId),
        bookApi.reviews(bookId),
        bookApi.qrcode(bookId),
        bookApi.status(bookId),
        reservationApi.listByBook(bookId),
      ])

      setBook(bookData)
      setTraceLogs(traceData)
      setReviews(reviewsData)
      setQrcodeData(qrcodeDataResult)
      setIsBorrowed(statusData.borrowed)
      setReservations(reservationsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!book || !nickname.trim() || rating === 0 || !content.trim()) return

    try {
      setSubmittingReview(true)
      await bookApi.addReview(book.id, {
        nickname: nickname.trim(),
        rating,
        content: content.trim(),
      })
      setReviewSuccess(true)
      setNickname('')
      setRating(0)
      setContent('')
      setTimeout(() => setReviewSuccess(false), 3000)
      const [bookData, reviewsData] = await Promise.all([
        bookApi.get(book.id),
        bookApi.reviews(book.id),
      ])
      setBook(bookData)
      setReviews(reviewsData)
    } catch (err) {
      alert(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmittingReview(false)
    }
  }

  async function handleBorrow() {
    if (!book) return
    try {
      setBorrowing(true)
      await bookApi.borrow(book.id)
      setBorrowSuccess(true)
      setIsBorrowed(true)
      setTimeout(() => setBorrowSuccess(false), 3000)
      const bookData = await bookApi.get(book.id)
      setBook(bookData)
      const traceData = await bookApi.trace(book.id)
      setTraceLogs(traceData)
    } catch (err) {
      alert(err instanceof Error ? err.message : '登记失败')
    } finally {
      setBorrowing(false)
    }
  }

  async function handleReturn() {
    if (!book) return
    try {
      setReturning(true)
      const result = await bookApi.returnBook(book.id)
      setReturnSuccess(true)
      setIsBorrowed(false)
      if (result.notifiedReservation) {
        setNotifiedName(result.notifiedReservation.nickname)
      }
      setTimeout(() => {
        setReturnSuccess(false)
        setNotifiedName(null)
      }, 5000)
      const [bookData, traceData, statusData, reservationsData] = await Promise.all([
        bookApi.get(book.id),
        bookApi.trace(book.id),
        bookApi.status(book.id),
        reservationApi.listByBook(book.id),
      ])
      setBook(bookData)
      setTraceLogs(traceData)
      setIsBorrowed(statusData.borrowed)
      setReservations(reservationsData)
    } catch (err) {
      alert(err instanceof Error ? err.message : '归还失败')
    } finally {
      setReturning(false)
    }
  }

  async function handleReservation(e: React.FormEvent) {
    e.preventDefault()
    if (!book || !resNickname.trim()) return
    try {
      setSubmittingReservation(true)
      await reservationApi.create(book.id, {
        nickname: resNickname.trim(),
        contact: resContact.trim() || undefined,
      })
      setReservationSuccess(true)
      setResNickname('')
      setResContact('')
      setTimeout(() => setReservationSuccess(false), 3000)
      const reservationsData = await reservationApi.listByBook(book.id)
      setReservations(reservationsData)
    } catch (err) {
      alert(err instanceof Error ? err.message : '预约失败')
    } finally {
      setSubmittingReservation(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-white rounded-lg w-24 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-6">
              <div className="aspect-[3/4] bg-coffee-100 rounded-lg animate-pulse mb-4" />
              <div className="h-7 bg-coffee-100 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-4 bg-coffee-100 rounded w-1/2 mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-coffee-100 rounded animate-pulse" />
                <div className="h-4 bg-coffee-100 rounded animate-pulse" />
                <div className="h-4 bg-coffee-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6">
              <div className="h-6 bg-coffee-100 rounded w-1/3 mb-4 animate-pulse" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-coffee-100 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-coffee-100 rounded w-1/4 animate-pulse" />
                      <div className="h-4 bg-coffee-100 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="card p-6">
              <div className="h-6 bg-coffee-100 rounded w-1/3 mb-4 animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-coffee-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !book) {
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
          <BookOpen className="w-16 h-16 text-coffee-300 mx-auto mb-4" />
          <p className="text-coffee-600 font-medium mb-1">{error || '图书不存在'}</p>
          <button
            onClick={() => navigate('/books')}
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            返回图书列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-6">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-coffee-100 mb-4 relative">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-coffee-300">
                  <Book className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={cn('badge border text-sm px-3 py-1', sourceTypeColor[book.sourceType])}>
                  {sourceTypeLabel[book.sourceType]}
                </span>
              </div>
            </div>

            <h1 className="page-title text-xl mb-1">{book.title}</h1>
            <p className="text-coffee-500 mb-4 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {book.author}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-coffee-100">
                <span className="text-sm text-coffee-500">ISBN</span>
                <span className="text-sm text-coffee-800 font-medium">{book.isbn || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-coffee-100">
                <span className="text-sm text-coffee-500">出版社</span>
                <span className="text-sm text-coffee-800 font-medium">{book.publisher || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-coffee-100">
                <span className="text-sm text-coffee-500">分类</span>
                <span className="text-sm text-coffee-800 font-medium">{book.category}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-coffee-500">溯源ID</span>
                <span className="text-sm text-coffee-800 font-mono bg-coffee-50 px-2 py-0.5 rounded">
                  {book.traceId}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="section-title flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" />
              热度统计
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 text-center">
                <div className="w-10 h-10 rounded-full bg-coffee-100 flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-5 h-5 text-coffee-600" />
                </div>
                <p className="text-2xl font-serif font-bold text-coffee-800">{book.borrowCount}</p>
                <p className="text-xs text-coffee-500 mt-0.5">借阅热度</p>
              </div>
              <div className="p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 text-center">
                <div className="w-10 h-10 rounded-full bg-coffee-100 flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-5 h-5 text-coffee-600" />
                </div>
                <p className="text-2xl font-serif font-bold text-coffee-800">{book.discussCount}</p>
                <p className="text-xs text-coffee-500 mt-0.5">讨论热度</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="section-title flex items-center gap-2 mb-4">
              <QrCode className="w-4 h-4" />
              溯源二维码
            </h3>
            <button
              onClick={() => setShowQrcode(true)}
              className="w-full aspect-square rounded-xl bg-coffee-50 border-2 border-dashed border-coffee-200 flex flex-col items-center justify-center text-coffee-500 hover:border-coffee-400 hover:text-coffee-700 transition-all duration-200"
            >
              <QrCode className="w-12 h-12 mb-2" />
              <span className="text-sm font-medium">点击查看二维码</span>
            </button>
            {qrcodeData && (
              <p className="text-xs text-coffee-400 mt-3 text-center break-all">
                {qrcodeData.traceUrl}
              </p>
            )}
          </div>

          {isBorrowed && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium text-red-600">此书已被借出</span>
            </div>
          )}

          {!isBorrowed && borrowSuccess ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-forest-500/10 border border-forest-500/20">
              <div className="w-10 h-10 rounded-full bg-forest-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-forest-500" />
              </div>
              <div>
                <p className="font-medium text-forest-600">登记成功！</p>
                <p className="text-sm text-forest-500/80">借阅记录已更新</p>
              </div>
            </div>
          ) : !isBorrowed ? (
            <button
              onClick={handleBorrow}
              disabled={borrowing}
              className={cn(
                'btn-primary w-full inline-flex items-center justify-center gap-2 py-3 text-base',
                borrowing && 'opacity-50 cursor-not-allowed hover:bg-coffee-700 hover:translate-y-0'
              )}
            >
              {borrowing ? (
                <>登记中...</>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  登记借阅
                </>
              )}
            </button>
          ) : null}

          {isBorrowed && returnSuccess ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-forest-500/10 border border-forest-500/20">
                <div className="w-10 h-10 rounded-full bg-forest-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-forest-500" />
                </div>
                <div>
                  <p className="font-medium text-forest-600">归还成功！</p>
                  <p className="text-sm text-forest-500/80">图书已重新可借</p>
                </div>
              </div>
              {notifiedName && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50 border border-sky-200">
                  <Bell className="w-5 h-5 text-sky-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sky-700">已通知预约人</p>
                    <p className="text-sm text-sky-600">{notifiedName} 已收到借阅通知</p>
                  </div>
                </div>
              )}
            </div>
          ) : isBorrowed ? (
            <button
              onClick={handleReturn}
              disabled={returning}
              className={cn(
                'btn-secondary w-full inline-flex items-center justify-center gap-2 py-3 text-base border-forest-500/30 text-forest-600 hover:bg-forest-500/5',
                returning && 'opacity-50 cursor-not-allowed'
              )}
            >
              {returning ? (
                <>归还中...</>
              ) : (
                <>
                  <RotateCcw className="w-5 h-5" />
                  登记归还
                </>
              )}
            </button>
          ) : null}

          {isBorrowed && !reservationSuccess && (
            <div className="card p-6 border-coffee-200">
              <h3 className="section-title flex items-center gap-2 mb-4 text-base">
                <BookmarkPlus className="w-4 h-4" />
                预约排队
              </h3>
              <p className="text-sm text-coffee-500 mb-4">
                此书当前已被借出，您可以提交预约申请排队等待。
              </p>
              <form onSubmit={handleReservation} className="space-y-3">
                <div>
                  <label className="label">昵称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={resNickname}
                    onChange={(e) => setResNickname(e.target.value)}
                    placeholder="请输入您的昵称"
                    disabled={submittingReservation}
                    className={cn('input-field', submittingReservation && 'opacity-50 cursor-not-allowed')}
                    required
                  />
                </div>
                <div>
                  <label className="label">联系方式</label>
                  <input
                    type="text"
                    value={resContact}
                    onChange={(e) => setResContact(e.target.value)}
                    placeholder="手机号/微信号（选填）"
                    disabled={submittingReservation}
                    className={cn('input-field', submittingReservation && 'opacity-50 cursor-not-allowed')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReservation || !resNickname.trim()}
                  className={cn(
                    'w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all duration-200 bg-amber-500 text-white hover:bg-amber-600 hover:-translate-y-0.5 hover:shadow-lg',
                    (submittingReservation || !resNickname.trim()) && 'opacity-50 cursor-not-allowed hover:bg-amber-500 hover:translate-y-0 hover:shadow-none'
                  )}
                >
                  {submittingReservation ? (
                    <>提交中...</>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      提交预约
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {isBorrowed && reservationSuccess && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <BookmarkPlus className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-700">预约成功！</p>
                <p className="text-sm text-amber-600/80">书归还后将第一时间通知您</p>
              </div>
            </div>
          )}

          {isBorrowed && reservations.length > 0 && (
            <div className="card p-6 border-coffee-200">
              <h3 className="section-title flex items-center gap-2 mb-4 text-base">
                <Users className="w-4 h-4" />
                预约队列
                <span className="badge bg-amber-100 text-amber-600 ml-2">
                  {reservations.length} 人排队
                </span>
              </h3>
              <div className="space-y-2">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border',
                      res.status === 'notified'
                        ? 'bg-sky-50 border-sky-200'
                        : 'bg-coffee-50/50 border-coffee-100'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                      res.status === 'notified'
                        ? 'bg-sky-500 text-white'
                        : 'bg-coffee-200 text-coffee-700'
                    )}>
                      {res.position}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-coffee-800 truncate">{res.nickname}</p>
                      <p className="text-xs text-coffee-400">{formatDateTime(res.createdAt)}</p>
                    </div>
                    {res.status === 'notified' && (
                      <span className="badge bg-sky-100 text-sky-600 border border-sky-200">
                        <Bell className="w-3 h-3 mr-1" />
                        已通知
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6">
            <h3 className="section-title flex items-center gap-2 mb-6">
              <Clock className="w-4 h-4" />
              流转历史
            </h3>

            {traceLogs.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                <p className="text-coffee-400">暂无流转记录</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-coffee-300 via-coffee-200 to-coffee-100" />
                <div className="space-y-6">
                  {traceLogs.map((log, index) => (
                    <div key={log.id} className="relative pl-14">
                      <div className={cn(
                        'absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center border-2',
                        index === 0
                          ? 'bg-coffee-700 border-coffee-700 text-white'
                          : 'bg-white border-coffee-200 text-coffee-500'
                      )}>
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 hover:border-coffee-200 transition-colors duration-200">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="badge bg-coffee-100 text-coffee-700 font-medium">
                            {log.action}
                          </span>
                          <span className="text-xs text-coffee-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-coffee-700 text-sm leading-relaxed">{log.description}</p>
                        {log.operator && (
                          <p className="text-xs text-coffee-500 mt-2 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            操作人：{log.operator}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6">
            <h3 className="section-title flex items-center gap-2 mb-4">
              <MessageSquarePlus className="w-4 h-4" />
              发表短评
            </h3>

            {reviewSuccess ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-forest-500/10 border border-forest-500/20">
                <div className="w-10 h-10 rounded-full bg-forest-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-forest-500" />
                </div>
                <div>
                  <p className="font-medium text-forest-600">评论成功！</p>
                  <p className="text-sm text-forest-500/80">感谢您的反馈</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="label">昵称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="请输入您的昵称"
                    disabled={submittingReview}
                    className={cn('input-field', submittingReview && 'opacity-50 cursor-not-allowed')}
                    required
                  />
                </div>

                <div>
                  <label className="label">评分 <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={submittingReview}
                        className={cn(
                          'p-1 transition-all duration-150',
                          submittingReview && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Star
                          className={cn(
                            'w-7 h-7 transition-colors duration-150',
                            (hoverRating || rating) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-coffee-300'
                          )}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-coffee-500">{renderStars(rating)}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">评论内容 <span className="text-red-500">*</span></label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="分享您的阅读感受..."
                    rows={4}
                    disabled={submittingReview}
                    className={cn('input-field resize-none', submittingReview && 'opacity-50 cursor-not-allowed')}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview || !nickname.trim() || rating === 0 || !content.trim()}
                  className={cn(
                    'btn-primary w-full inline-flex items-center justify-center gap-2',
                    (submittingReview || !nickname.trim() || rating === 0 || !content.trim()) && 'opacity-50 cursor-not-allowed hover:bg-coffee-700 hover:translate-y-0'
                  )}
                >
                  {submittingReview ? (
                    <>提交中...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      发表评论
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="card p-6">
            <h3 className="section-title flex items-center gap-2 mb-4">
              <Star className="w-4 h-4" />
              读者短评
              <span className="badge bg-coffee-100 text-coffee-600 ml-2">
                {reviews.length} 条
              </span>
            </h3>

            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                <p className="text-coffee-400">暂无评论，来抢沙发吧</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 hover:border-coffee-200 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-medium">
                            {review.nickname.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-coffee-800">{review.nickname}</p>
                          <p className="text-xs text-coffee-400">{formatDateTime(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 flex-shrink-0">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                        {Array.from({ length: 5 - review.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-coffee-200" />
                        ))}
                      </div>
                    </div>
                    <p className="text-coffee-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showQrcode && qrcodeData && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQrcode(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title text-xl">溯源二维码</h3>
              <button
                onClick={() => setShowQrcode(false)}
                className="w-9 h-9 rounded-full hover:bg-coffee-100 flex items-center justify-center text-coffee-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-56 h-56 rounded-xl bg-coffee-50 border-2 border-coffee-100 flex items-center justify-center p-4 mb-4">
                {qrcodeData.qrcode.startsWith('data:') || qrcodeData.qrcode.startsWith('http') ? (
                  <img
                    src={qrcodeData.qrcode}
                    alt="溯源二维码"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-coffee-400">
                    <QrCode className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">二维码数据</p>
                  </div>
                )}
              </div>

              <div className="w-full text-center space-y-2">
                <p className="text-sm font-medium text-coffee-800">{book.title}</p>
                <p className="text-xs text-coffee-500 font-mono bg-coffee-50 px-3 py-1.5 rounded-lg break-all">
                  {qrcodeData.traceId}
                </p>
                <p className="text-xs text-coffee-400 break-all">
                  {qrcodeData.traceUrl}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
