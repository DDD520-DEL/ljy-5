import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  Heart,
  ImagePlus,
  ChevronDown,
  ChevronUp,
  PenLine,
  Lock,
  Globe,
  AlertTriangle,
  Megaphone,
  CalendarClock,
  Tag,
} from 'lucide-react'
import { bookApi, reservationApi, noteApi } from '@/lib/api'
import { BookshelfSelector } from '@/components/BookshelfSelector'
import { RatingDistribution } from '@/components/RatingDistribution'
import { useReaderStore } from '@/hooks/useReaderStore'
import {
  formatDateTime,
  formatDate,
  sourceTypeLabel,
  sourceTypeColor,
  renderStars,
  readerLevelLabel,
  readerLevelColor,
  noteVisibilityLabel,
  noteVisibilityColor,
  traceActionLabel,
  traceActionColor,
  calculateDaysRemaining,
  cn,
} from '@/lib/utils'
import type { Book as BookType, TraceLog, Review, Reservation, ReviewWithLevel, Note, NoteComment, NoteVisibility, BookBorrowStatus, RatingStats } from '../../shared/types'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentNickname = useReaderStore(s => s.nickname)

  const [book, setBook] = useState<BookType | null>(null)
  const [showBookshelfSelector, setShowBookshelfSelector] = useState(false)
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
  const [borrowerName, setBorrowerName] = useState('')
  const [borrowDays, setBorrowDays] = useState(30)
  const [fulfilledReservationName, setFulfilledReservationName] = useState<string | null>(null)

  const [showQrcode, setShowQrcode] = useState(false)

  const [isBorrowed, setIsBorrowed] = useState(false)
  const [borrowStatus, setBorrowStatus] = useState<BookBorrowStatus | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [resNickname, setResNickname] = useState('')
  const [resContact, setResContact] = useState('')
  const [submittingReservation, setSubmittingReservation] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [returning, setReturning] = useState(false)
  const [returnSuccess, setReturnSuccess] = useState(false)
  const [notifiedName, setNotifiedName] = useState<string | null>(null)

  const [sendingReminder, setSendingReminder] = useState(false)
  const [reminderSuccess, setReminderSuccess] = useState(false)

  const [detailTab, setDetailTab] = useState<'trace' | 'notes'>('trace')
  const [notes, setNotes] = useState<Note[]>([])
  const [showNoteEditor, setShowNoteEditor] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteImages, setNoteImages] = useState<string[]>([])
  const [noteVisibility, setNoteVisibility] = useState<NoteVisibility>('public')
  const [noteNickname, setNoteNickname] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [noteSuccess, setNoteSuccess] = useState(false)
  const [expandedNote, setExpandedNote] = useState<number | null>(null)
  const [noteComments, setNoteComments] = useState<Record<number, NoteComment[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [commentNicknames, setCommentNicknames] = useState<Record<number, string>>({})
  const [submittingComments, setSubmittingComments] = useState<Record<number, boolean>>({})
  const [likedNotes, setLikedNotes] = useState<Record<number, boolean>>({})
  const [likingNotes, setLikingNotes] = useState<Record<number, boolean>>({})
  const [likeNickname, setLikeNickname] = useState('')

  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null)

  async function refreshLikedNotes(noteList: Note[], nickname: string) {
    if (!nickname.trim() || noteList.length === 0) {
      setLikedNotes({})
      return
    }
    try {
      const likedResults = await Promise.all(
        noteList.map(note => noteApi.hasLiked(note.id, nickname.trim()))
      )
      const likedMap: Record<number, boolean> = {}
      noteList.forEach((note, index) => {
        likedMap[note.id] = likedResults[index].liked
      })
      setLikedNotes(likedMap)
    } catch (err) {
      console.error('初始化点赞状态失败:', err)
    }
  }

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const bookId = Number(id)

      const [bookData, traceData, reviewsData, qrcodeDataResult, statusData, reservationsData, notesData, statsData] = await Promise.all([
        bookApi.get(bookId),
        bookApi.trace(bookId),
        bookApi.reviews(bookId),
        bookApi.qrcode(bookId),
        bookApi.status(bookId),
        reservationApi.listByBook(bookId),
        noteApi.listByBook(bookId),
        bookApi.ratingStats(bookId),
      ])

      setBook(bookData)
      setTraceLogs(traceData)
      setReviews(reviewsData)
      setQrcodeData(qrcodeDataResult)
      setIsBorrowed(statusData.borrowed)
      setBorrowStatus(statusData.borrowStatus || null)
      setReservations(reservationsData)
      setNotes(notesData)
      setRatingStats(statsData)

      if (likeNickname.trim()) {
        refreshLikedNotes(notesData, likeNickname)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [id, likeNickname])

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id, loadData])

  useEffect(() => {
    if (notes.length > 0 && likeNickname.trim()) {
      refreshLikedNotes(notes, likeNickname)
    } else {
      setLikedNotes({})
    }
  }, [likeNickname, notes])

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
      const statsData = await bookApi.ratingStats(book.id)
      setBook(bookData)
      setReviews(reviewsData)
      setRatingStats(statsData)
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
      const result = await bookApi.borrow(book.id, { 
        borrower: borrowerName.trim() || undefined,
        borrowDays: borrowDays,
      })
      setBorrowSuccess(true)
      setIsBorrowed(true)
      if (result.fulfilledReservation) {
        setFulfilledReservationName(result.fulfilledReservation.nickname)
      }
      setTimeout(() => {
        setBorrowSuccess(false)
        setFulfilledReservationName(null)
      }, 5000)
      setBorrowerName('')
      setBorrowDays(30)
      const [bookData, traceData, statusData, reservationsData] = await Promise.all([
        bookApi.get(book.id),
        bookApi.trace(book.id),
        bookApi.status(book.id),
        reservationApi.listByBook(book.id),
      ])
      setBook(bookData)
      setTraceLogs(traceData)
      setIsBorrowed(statusData.borrowed)
      setBorrowStatus(statusData.borrowStatus || null)
      setReservations(reservationsData)
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
      setBorrowStatus(null)
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
      setBorrowStatus(statusData.borrowStatus || null)
      setReservations(reservationsData)
    } catch (err) {
      alert(err instanceof Error ? err.message : '归还失败')
    } finally {
      setReturning(false)
    }
  }

  async function handleReminder() {
    if (!book) return
    try {
      setSendingReminder(true)
      await bookApi.reminder(book.id)
      setReminderSuccess(true)
      setTimeout(() => setReminderSuccess(false), 3000)
      const [traceData, statusData] = await Promise.all([
        bookApi.trace(book.id),
        bookApi.status(book.id),
      ])
      setTraceLogs(traceData)
      setBorrowStatus(statusData.borrowStatus || null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '催还失败')
    } finally {
      setSendingReminder(false)
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

  async function handleSubmitNote(e: React.FormEvent) {
    e.preventDefault()
    if (!book || !noteNickname.trim() || !noteTitle.trim() || !noteContent.trim()) return

    try {
      setSubmittingNote(true)
      await noteApi.create({
        bookId: book.id,
        nickname: noteNickname.trim(),
        title: noteTitle.trim(),
        content: noteContent.trim(),
        images: noteImages,
        visibility: noteVisibility,
      })
      setNoteSuccess(true)
      setNoteTitle('')
      setNoteContent('')
      setNoteImages([])
      setShowNoteEditor(false)
      setTimeout(() => setNoteSuccess(false), 3000)
      const notesData = await noteApi.listByBook(book.id, noteNickname.trim())
      setNotes(notesData)
    } catch (err) {
      alert(err instanceof Error ? err.message : '发布失败')
    } finally {
      setSubmittingNote(false)
    }
  }

  async function handleToggleLike(noteId: number) {
    if (!likeNickname.trim()) {
      alert('请先在上方输入您的昵称')
      return
    }
    try {
      setLikingNotes(prev => ({ ...prev, [noteId]: true }))
      const result = await noteApi.like(noteId, likeNickname.trim())
      setLikedNotes(prev => ({ ...prev, [noteId]: result.liked }))
      setNotes(prev => prev.map(n => n.id === noteId ? result.note : n))
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setLikingNotes(prev => ({ ...prev, [noteId]: false }))
    }
  }

  async function handleLoadComments(noteId: number) {
    if (noteComments[noteId]) {
      setExpandedNote(expandedNote === noteId ? null : noteId)
      return
    }
    try {
      const comments = await noteApi.getComments(noteId)
      setNoteComments(prev => ({ ...prev, [noteId]: comments }))
      setExpandedNote(noteId)
    } catch (err) {
      alert(err instanceof Error ? err.message : '加载评论失败')
    }
  }

  async function handleAddComment(noteId: number) {
    const nickname = commentNicknames[noteId] || ''
    const content = commentInputs[noteId] || ''
    if (!nickname.trim() || !content.trim()) {
      alert('请填写昵称和评论内容')
      return
    }
    try {
      setSubmittingComments(prev => ({ ...prev, [noteId]: true }))
      const result = await noteApi.addComment(noteId, {
        nickname: nickname.trim(),
        content: content.trim(),
      })
      setNoteComments(prev => ({ ...prev, [noteId]: [...(prev[noteId] || []), result.comment] }))
      setNotes(prev => prev.map(n => n.id === noteId ? result.note : n))
      setCommentInputs(prev => ({ ...prev, [noteId]: '' }))
    } catch (err) {
      alert(err instanceof Error ? err.message : '评论失败')
    } finally {
      setSubmittingComments(prev => ({ ...prev, [noteId]: false }))
    }
  }

  function handleAddImage() {
    const url = prompt('请输入图片URL:')
    if (url && url.trim()) {
      setNoteImages(prev => [...prev, url.trim()])
    }
  }

  function handleRemoveImage(index: number) {
    setNoteImages(prev => prev.filter((_, i) => i !== index))
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
              {book.tags && book.tags.length > 0 && (
                <div className="pt-2 border-t border-coffee-100 mt-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-coffee-500" />
                    <span className="text-sm text-coffee-500">标签</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {book.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/books?tag=${encodeURIComponent(tag)}`}
                        className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-coffee-50 to-brass-400/10 text-coffee-700 border border-coffee-200 hover:border-coffee-400 hover:shadow-sm transition-all"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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

          {ratingStats && ratingStats.totalCount > 0 && (
            <div className="card p-6">
              <h3 className="section-title flex items-center gap-2 mb-4">
                <Star className="w-4 h-4" />
                评分分布
              </h3>
              <RatingDistribution stats={ratingStats} />
            </div>
          )}

          <div className="card p-6">
            <h3 className="section-title flex items-center gap-2 mb-4">
              <BookmarkPlus className="w-4 h-4" />
              收藏到书单
            </h3>
            <button
              onClick={() => {
                if (!currentNickname) {
                  alert('请先在右上角选择读者身份')
                  return
                }
                setShowBookshelfSelector(true)
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <BookmarkPlus className="w-5 h-5" />
              加入我的书单
            </button>
            {currentNickname && (
              <p className="text-xs text-coffee-400 mt-2 text-center">
                当前身份：<span className="font-medium text-coffee-600">{currentNickname}</span>
              </p>
            )}
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

          {isBorrowed && borrowStatus?.borrowRecord && (
            <div className={cn(
              "p-4 rounded-xl border",
              borrowStatus.isOverdue 
                ? "bg-red-50 border-red-200" 
                : borrowStatus.daysRemaining !== undefined && borrowStatus.daysRemaining <= 7
                  ? "bg-amber-50 border-amber-200"
                  : "bg-coffee-50 border-coffee-200"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  borrowStatus.isOverdue 
                    ? "bg-red-100" 
                    : borrowStatus.daysRemaining !== undefined && borrowStatus.daysRemaining <= 7
                      ? "bg-amber-100"
                      : "bg-coffee-100"
                )}>
                  {borrowStatus.isOverdue ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CalendarClock className="w-5 h-5 text-coffee-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={cn(
                      "font-semibold",
                      borrowStatus.isOverdue ? "text-red-700" : "text-coffee-800"
                    )}>
                      {borrowStatus.isOverdue ? "已逾期" : "借阅中"}
                    </p>
                    {borrowStatus.borrowRecord.reminderCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                        已催还 {borrowStatus.borrowRecord.reminderCount} 次
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-coffee-600">
                        <User className="w-3.5 h-3.5" />
                        借阅人：{borrowStatus.borrowRecord.borrower}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-coffee-600">
                        <Calendar className="w-3.5 h-3.5" />
                        借阅日期：{formatDate(borrowStatus.borrowRecord.borrowDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-coffee-600">
                        <Clock className="w-3.5 h-3.5" />
                        应还日期：{formatDate(borrowStatus.borrowRecord.dueDate)}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-coffee-100/50">
                      {borrowStatus.isOverdue ? (
                        <p className="font-medium text-red-600">
                          已逾期 {borrowStatus.overdueDays} 天，请尽快归还
                        </p>
                      ) : borrowStatus.daysRemaining !== undefined && borrowStatus.daysRemaining <= 7 ? (
                        <p className="font-medium text-amber-600">
                          还剩 {borrowStatus.daysRemaining} 天到期
                        </p>
                      ) : (
                        <p className="font-medium text-forest-600">
                          剩余 {borrowStatus.daysRemaining} 天
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleReminder}
                  disabled={sendingReminder}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    sendingReminder 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600 hover:shadow-md"
                  )}
                >
                  {sendingReminder ? (
                    <>发送中...</>
                  ) : (
                    <>
                      <Megaphone className="w-4 h-4" />
                      发送催还提醒
                    </>
                  )}
                </button>
              </div>
              {reminderSuccess && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">催还提醒已发送（站内通知 + 邮件）</p>
                </div>
              )}
            </div>
          )}

          {isBorrowed && (!borrowStatus?.borrowRecord) && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium text-red-600">此书已被借出</span>
            </div>
          )}

          {!isBorrowed && borrowSuccess ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-forest-500/10 border border-forest-500/20">
                <div className="w-10 h-10 rounded-full bg-forest-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-forest-500" />
                </div>
                <div>
                  <p className="font-medium text-forest-600">登记成功！</p>
                  <p className="text-sm text-forest-500/80">借阅记录已更新</p>
                </div>
              </div>
              {fulfilledReservationName && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-emerald-700">预约已完成</p>
                    <p className="text-sm text-emerald-600">{fulfilledReservationName} 的预约状态已更新为已完成</p>
                  </div>
                </div>
              )}
            </div>
          ) : !isBorrowed ? (
            <div className="space-y-3">
              <div>
                <label className="label">借阅人姓名</label>
                <input
                  type="text"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="请输入借阅人姓名（如被通知预约人，将自动完成预约）"
                  disabled={borrowing}
                  className={cn('input-field', borrowing && 'opacity-50 cursor-not-allowed')}
                />
              </div>
              <div>
                <label className="label">借阅期限</label>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 14, 30, 60].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setBorrowDays(days)}
                      disabled={borrowing}
                      className={cn(
                        'py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                        borrowDays === days
                          ? 'bg-coffee-600 text-white border-coffee-600 shadow-sm'
                          : 'bg-white text-coffee-600 border-coffee-200 hover:border-coffee-400 hover:bg-coffee-50'
                      )}
                    >
                      {days} 天
                    </button>
                  ))}
                </div>
              </div>
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
            </div>
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
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 border-b border-coffee-100">
              <button
                onClick={() => setDetailTab('trace')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap',
                  detailTab === 'trace'
                    ? 'bg-coffee-700 text-white shadow-md'
                    : 'text-coffee-500 hover:text-coffee-700 hover:bg-coffee-50'
                )}
              >
                <Clock className="w-4 h-4" />
                流转历史
              </button>
              <button
                onClick={() => setDetailTab('notes')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap',
                  detailTab === 'notes'
                    ? 'bg-coffee-700 text-white shadow-md'
                    : 'text-coffee-500 hover:text-coffee-700 hover:bg-coffee-50'
                )}
              >
                <PenLine className="w-4 h-4" />
                读者笔记
                {notes.filter(n => n.visibility === 'public').length > 0 && (
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-xs',
                    detailTab === 'notes' ? 'bg-white/20' : 'bg-coffee-100'
                  )}>
                    {notes.filter(n => n.visibility === 'public').length}
                  </span>
                )}
              </button>
            </div>

            {detailTab === 'trace' && (
              <>
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
                              : log.action === '催还'
                                ? 'bg-red-50 border-red-300 text-red-600'
                                : log.action === '借出'
                                  ? 'bg-coffee-50 border-coffee-300 text-coffee-600'
                                  : log.action === '归还'
                                    ? 'bg-forest-50 border-forest-300 text-forest-600'
                                    : 'bg-white border-coffee-200 text-coffee-500'
                          )}>
                            {log.action === '催还' ? (
                              <Megaphone className="w-5 h-5" />
                            ) : log.action === '借出' ? (
                              <BookOpen className="w-5 h-5" />
                            ) : log.action === '归还' ? (
                              <RotateCcw className="w-5 h-5" />
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                          </div>
                          <div className={cn(
                            "p-4 rounded-xl border hover:border-coffee-200 transition-colors duration-200",
                            log.action === '催还' 
                              ? "bg-red-50/50 border-red-100"
                              : "bg-coffee-50/50 border-coffee-100"
                          )}>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className={cn(
                                "badge font-medium border",
                                traceActionColor[log.action]
                              )}>
                                {traceActionLabel[log.action]}
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
              </>
            )}

            {detailTab === 'notes' && (
              <div className="space-y-4">
                {noteSuccess && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-forest-500/10 border border-forest-500/20">
                    <div className="w-10 h-10 rounded-full bg-forest-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-forest-500" />
                    </div>
                    <div>
                      <p className="font-medium text-forest-600">发布成功！</p>
                      <p className="text-sm text-forest-500/80">感谢您的分享</p>
                    </div>
                  </div>
                )}

                {!showNoteEditor ? (
                  <button
                    onClick={() => setShowNoteEditor(true)}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-coffee-200 hover:border-coffee-400 hover:bg-coffee-50/50 transition-all duration-200 text-coffee-500 hover:text-coffee-700"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <PenLine className="w-5 h-5" />
                      <span className="font-medium">写读书笔记</span>
                    </div>
                  </button>
                ) : (
                  <form onSubmit={handleSubmitNote} className="space-y-4 p-4 rounded-xl bg-coffee-50/50 border border-coffee-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-coffee-800 flex items-center gap-2">
                        <PenLine className="w-4 h-4" />
                        写读书笔记
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowNoteEditor(false)}
                        className="text-coffee-400 hover:text-coffee-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div>
                      <label className="label">昵称 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={noteNickname}
                        onChange={(e) => setNoteNickname(e.target.value)}
                        placeholder="请输入您的昵称"
                        disabled={submittingNote}
                        className={cn('input-field', submittingNote && 'opacity-50 cursor-not-allowed')}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">笔记标题 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="给您的笔记起个标题..."
                        disabled={submittingNote}
                        className={cn('input-field', submittingNote && 'opacity-50 cursor-not-allowed')}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">笔记内容 <span className="text-red-500">*</span></label>
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="分享您的阅读感受、摘抄、感悟..."
                        rows={6}
                        disabled={submittingNote}
                        className={cn('input-field resize-none', submittingNote && 'opacity-50 cursor-not-allowed')}
                        required
                      />
                    </div>

                    <div>
                      <label className="label">配图</label>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleAddImage}
                          disabled={submittingNote}
                          className={cn(
                            'w-full p-3 rounded-lg border-2 border-dashed border-coffee-200 hover:border-coffee-400 hover:bg-coffee-50 transition-all text-coffee-500 hover:text-coffee-700 text-sm',
                            submittingNote && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <ImagePlus className="w-4 h-4 inline mr-1" />
                          添加图片URL
                        </button>
                        {noteImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {noteImages.map((img, idx) => (
                              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-coffee-100">
                                <img src={img} alt={`配图${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="label">可见性</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNoteVisibility('public')}
                          className={cn(
                            'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 border',
                            noteVisibility === 'public'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white text-coffee-500 border-coffee-200 hover:border-coffee-300'
                          )}
                        >
                          <Globe className="w-4 h-4" />
                          公开
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteVisibility('private')}
                          className={cn(
                            'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 border',
                            noteVisibility === 'private'
                              ? 'bg-coffee-100 text-coffee-700 border-coffee-300'
                              : 'bg-white text-coffee-500 border-coffee-200 hover:border-coffee-300'
                          )}
                        >
                          <Lock className="w-4 h-4" />
                          私密
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingNote || !noteNickname.trim() || !noteTitle.trim() || !noteContent.trim()}
                      className={cn(
                        'btn-primary w-full inline-flex items-center justify-center gap-2',
                        (submittingNote || !noteNickname.trim() || !noteTitle.trim() || !noteContent.trim()) && 'opacity-50 cursor-not-allowed hover:bg-coffee-700 hover:translate-y-0'
                      )}
                    >
                      {submittingNote ? (
                        <>发布中...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          发布笔记
                        </>
                      )}
                    </button>
                  </form>
                )}

                {notes.length > 0 && (
                  <div className="p-4 rounded-xl bg-coffee-50/50 border border-coffee-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-coffee-500" />
                      <span className="text-sm font-medium text-coffee-700">点赞用户身份</span>
                    </div>
                    <input
                      type="text"
                      value={likeNickname}
                      onChange={(e) => setLikeNickname(e.target.value)}
                      placeholder="请输入您的昵称以记录点赞身份"
                      className="input-field"
                    />
                    {likeNickname.trim() && (
                      <p className="text-xs text-coffee-500 mt-2">
                        已识别身份：<span className="font-medium text-coffee-700">{likeNickname.trim()}</span>
                      </p>
                    )}
                  </div>
                )}

                {notes.length === 0 ? (
                  <div className="text-center py-12">
                    <PenLine className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                    <p className="text-coffee-400">暂无笔记，来写第一篇吧</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 hover:border-coffee-200 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <Link to={`/readers/${encodeURIComponent(note.nickname)}`} className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity">
                              <span className="text-white text-sm font-medium">
                                {note.nickname.charAt(0)}
                              </span>
                            </Link>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Link to={`/readers/${encodeURIComponent(note.nickname)}`} className="text-sm font-medium text-coffee-800 hover:text-coffee-600 transition-colors">
                                  {note.nickname}
                                </Link>
                              </div>
                              <p className="text-xs text-coffee-400">{formatDateTime(note.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={cn('badge border text-[10px]', noteVisibilityColor[note.visibility])}>
                              {noteVisibilityLabel[note.visibility]}
                            </span>
                          </div>
                        </div>

                        <h4 className="font-medium text-coffee-800 mb-2">{note.title}</h4>
                        <p className="text-coffee-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3 mb-3">
                          {note.content}
                        </p>

                        {note.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {note.images.slice(0, 3).map((img, idx) => (
                              <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-coffee-100">
                                <img src={img} alt={`配图${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {note.images.length > 3 && (
                              <div className="aspect-square rounded-lg overflow-hidden bg-coffee-200 flex items-center justify-center">
                                <span className="text-coffee-600 text-sm font-medium">+{note.images.length - 3}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-2 border-t border-coffee-100">
                          <button
                            onClick={() => handleToggleLike(note.id)}
                            disabled={likingNotes[note.id]}
                            className={cn(
                              'flex items-center gap-1 text-sm transition-colors',
                              likedNotes[note.id]
                                ? 'text-rose-500'
                                : 'text-coffee-500 hover:text-rose-500'
                            )}
                          >
                            <Heart className={cn('w-4 h-4', likedNotes[note.id] && 'fill-rose-500')} />
                            <span>{note.likeCount}</span>
                          </button>
                          <button
                            onClick={() => handleLoadComments(note.id)}
                            className="flex items-center gap-1 text-sm text-coffee-500 hover:text-coffee-700 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{note.commentCount}</span>
                            {expandedNote === note.id ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                          <div className="flex items-center gap-1 text-xs text-coffee-400 ml-auto">
                            <Eye className="w-3 h-3" />
                            <span>{note.viewCount}</span>
                          </div>
                        </div>

                        {expandedNote === note.id && noteComments[note.id] && (
                          <div className="mt-4 pt-4 border-t border-coffee-100 space-y-3">
                            <div className="space-y-2">
                              {noteComments[note.id]!.map((comment) => (
                                <div key={comment.id} className="flex gap-2">
                                  <div className="w-7 h-7 rounded-full bg-coffee-200 flex items-center justify-center flex-shrink-0">
                                    <span className="text-coffee-600 text-xs font-medium">
                                      {comment.nickname.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-medium text-coffee-700">{comment.nickname}</span>
                                      <span className="text-[10px] text-coffee-400">{formatDateTime(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-coffee-600">{comment.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2 pt-2">
                              <input
                                type="text"
                                value={commentNicknames[note.id] || ''}
                                onChange={(e) => setCommentNicknames(prev => ({ ...prev, [note.id]: e.target.value }))}
                                placeholder="昵称"
                                disabled={submittingComments[note.id]}
                                className={cn('input-field flex-1 text-sm py-2', submittingComments[note.id] && 'opacity-50 cursor-not-allowed')}
                              />
                              <input
                                type="text"
                                value={commentInputs[note.id] || ''}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [note.id]: e.target.value }))}
                                placeholder="说点什么..."
                                disabled={submittingComments[note.id]}
                                className={cn('input-field flex-[2] text-sm py-2', submittingComments[note.id] && 'opacity-50 cursor-not-allowed')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddComment(note.id)
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleAddComment(note.id)}
                                disabled={submittingComments[note.id]}
                                className={cn(
                                  'px-3 py-2 rounded-lg bg-coffee-700 text-white text-sm hover:bg-coffee-800 transition-colors',
                                  submittingComments[note.id] && 'opacity-50 cursor-not-allowed'
                                )}
                              >
                                发送
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                        <Link to={`/readers/${encodeURIComponent(review.nickname)}`} className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity">
                          <span className="text-white text-sm font-medium">
                            {review.nickname.charAt(0)}
                          </span>
                        </Link>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link to={`/readers/${encodeURIComponent(review.nickname)}`} className="text-sm font-medium text-coffee-800 hover:text-coffee-600 transition-colors">
                              {review.nickname}
                            </Link>
                            {(review as ReviewWithLevel).level && (
                              <span className={cn('badge border text-[10px]', readerLevelColor[(review as ReviewWithLevel).level!])}>
                                {readerLevelLabel[(review as ReviewWithLevel).level!]}
                              </span>
                            )}
                          </div>
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

      <BookshelfSelector
        book={book!}
        nickname={currentNickname}
        open={showBookshelfSelector}
        onClose={() => setShowBookshelfSelector(false)}
      />
    </div>
  )
}
