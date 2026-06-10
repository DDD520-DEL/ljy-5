import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Star,
  MessageSquarePlus,
  Heart,
  Send,
  Library,
  CheckCircle,
  Megaphone,
  RotateCcw,
  AlertTriangle,
  Gift,
} from 'lucide-react'
import { traceApi, bookApi } from '@/lib/api'
import {
  formatDateTime,
  sourceTypeLabel,
  sourceTypeColor,
  renderStars,
  cn,
  traceActionLabel,
  traceActionColor,
} from '@/lib/utils'
import type { Book, TraceLog, Review } from '../../shared/types'

interface TraceData {
  book: Book
  traceLogs: TraceLog[]
  reviews: Review[]
}

export default function TraceView() {
  const { traceId } = useParams<{ traceId: string }>()
  const [data, setData] = useState<TraceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [nickname, setNickname] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    if (traceId) {
      loadTraceData(traceId)
    }
  }, [traceId])

  async function loadTraceData(id: string) {
    try {
      setLoading(true)
      setError(null)
      setNotFound(false)
      const result = await traceApi.get(id)
      setData(result)
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : '加载失败'
      if (message.includes('404') || message.includes('不存在') || message.includes('not found')) {
        setNotFound(true)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data || !nickname.trim() || rating === 0 || !content.trim()) return

    try {
      setSubmitting(true)
      await bookApi.addReview(data.book.id, {
        nickname: nickname.trim(),
        rating,
        content: content.trim(),
      })
      setSubmitSuccess(true)
      setNickname('')
      setRating(0)
      setContent('')
      if (traceId) {
        await loadTraceData(traceId)
      }
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="h-10 w-40 bg-white rounded-lg mb-6 animate-pulse" />
          <div className="card p-6 animate-pulse space-y-6">
            <div className="flex gap-6">
              <div className="w-32 h-44 bg-coffee-100 rounded-lg" />
              <div className="flex-1 space-y-3">
                <div className="h-7 bg-coffee-100 rounded w-3/4" />
                <div className="h-5 bg-coffee-100 rounded w-1/2" />
                <div className="h-5 bg-coffee-100 rounded w-24" />
                <div className="h-5 bg-coffee-100 rounded w-20" />
              </div>
            </div>
            <div className="h-4 bg-coffee-100 rounded w-full" />
            <div className="h-4 bg-coffee-100 rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-coffee-100 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-coffee-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-coffee-900 mb-2">
            溯源ID不存在
          </h1>
          <p className="text-coffee-500 mb-6">
            抱歉，未能找到该图书的溯源信息，请检查二维码或链接是否正确。
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 btn-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            返回墨香书坊
          </Link>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-coffee-900 mb-2">
            加载失败
          </h1>
          <p className="text-coffee-500 mb-6">{error}</p>
          <button
            onClick={() => traceId && loadTraceData(traceId)}
            className="btn-primary"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { book, traceLogs, reviews } = data

  return (
    <div className="min-h-screen py-6 px-4 pb-20" style={{ fontFamily: "'Noto Serif SC', Georgia, serif" }}>
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-coffee-600 hover:text-coffee-800 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>返回墨香书坊</span>
        </Link>

        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-36 flex-shrink-0 mx-auto sm:mx-0">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-coffee-100 to-coffee-200 shadow-lg">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-coffee-300">
                    <BookOpen className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-coffee-900 mb-2 leading-tight">
                {book.title}
              </h1>
              <p className="text-coffee-600 mb-3">作者：{book.author}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={cn('badge border', sourceTypeColor[book.sourceType])}>
                  {sourceTypeLabel[book.sourceType]}
                </span>
                <span className="badge border bg-coffee-50 text-coffee-700 border-coffee-200">
                  {book.category}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-coffee-500">
                <span className="flex items-center gap-1">
                  <Library className="w-4 h-4" />
                  被借阅 {book.borrowCount} 次
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquarePlus className="w-4 h-4" />
                  {book.discussCount} 条短评
                </span>
              </div>
            </div>
          </div>
          {book.description && (
            <div className="mt-6 pt-6 border-t border-coffee-100">
              <h2 className="section-title mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-coffee-500" />
                内容简介
              </h2>
              <p className="text-coffee-700 leading-relaxed whitespace-pre-wrap">
                {book.description}
              </p>
            </div>
          )}
        </div>

        <div className="card p-6 mb-6">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-coffee-500" />
            流转历史
          </h2>
          {traceLogs.length === 0 ? (
            <div className="text-center py-8 text-coffee-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>暂无流转记录</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-coffee-300 via-coffee-200 to-coffee-100" />
              <div className="space-y-5">
                {traceLogs.map((log) => (
                  <div key={log.id} className="relative pl-8">
                    <div className={cn(
                      "absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      log.action === '催还' ? 'bg-red-50 border-red-400' :
                      log.action === '借出' ? 'bg-coffee-50 border-coffee-500' :
                      log.action === '归还' ? 'bg-forest-50 border-forest-400' :
                      log.action === '捐赠' ? 'bg-amber-50 border-amber-400' :
                      'bg-white border-coffee-400'
                    )}>
                      {log.action === '催还' ? (
                        <Megaphone className="w-3 h-3 text-red-600" />
                      ) : log.action === '借出' ? (
                        <BookOpen className="w-3 h-3 text-coffee-600" />
                      ) : log.action === '归还' ? (
                        <RotateCcw className="w-3 h-3 text-forest-600" />
                      ) : log.action === '捐赠' ? (
                        <Gift className="w-3 h-3 text-amber-600" />
                      ) : (
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          log.action === '入库' ? 'bg-sky-500' : 'bg-coffee-500'
                        )} />
                      )}
                    </div>
                    <div className={cn(
                      "rounded-lg p-3",
                      log.action === '催还' ? 'bg-red-50/50 border border-red-100' : 'bg-coffee-50/50'
                    )}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={cn(
                          "badge border font-medium",
                          traceActionColor[log.action]
                        )}>
                          {traceActionLabel[log.action]}
                        </span>
                        <span className="text-xs text-coffee-400">
                          {formatDateTime(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-coffee-600">{log.description}</p>
                      {log.operator && (
                        <p className="text-xs text-coffee-400 mt-1">
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

        <div className="card p-6">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-coffee-500" />
            读者短评
            <span className="text-sm font-normal text-coffee-400">
              ({reviews.length})
            </span>
          </h2>

          <form onSubmit={handleSubmit} className="mb-6 bg-gradient-to-br from-coffee-50/80 to-amber-50/50 rounded-xl p-4 border border-coffee-100">
            {submitSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200">
                短评提交成功，感谢您的分享！
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="label">您的昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入昵称"
                  maxLength={20}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">评分</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          'w-7 h-7 transition-colors',
                          (hoverRating || rating) >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-coffee-200'
                        )}
                      />
                    </button>
                  ))}
                  {(hoverRating || rating) > 0 && (
                    <span className="ml-2 text-sm text-coffee-500">
                      {renderStars(hoverRating || rating)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="label">短评内容</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="写下您对这本书的感受..."
                  rows={3}
                  maxLength={500}
                  className="input-field resize-none"
                  required
                />
                <div className="text-right text-xs text-coffee-400 mt-1">
                  {content.length}/500
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting || !nickname.trim() || rating === 0 || !content.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitting ? '提交中...' : '发表短评'}
              </button>
            </div>
          </form>

          {reviews.length === 0 ? (
            <div className="text-center py-8 text-coffee-400">
              <MessageSquarePlus className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>暂无短评，来发表第一条吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-coffee-100 rounded-xl p-4 hover:shadow-soft transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-200 to-amber-200 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-coffee-500" />
                      </div>
                      <div>
                        <span className="font-medium text-coffee-800 text-sm">
                          {review.nickname}
                        </span>
                        <div className="text-amber-400 text-xs leading-none mt-0.5">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-coffee-400 flex-shrink-0">
                      {formatDateTime(review.createdAt)}
                    </span>
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
  )
}
