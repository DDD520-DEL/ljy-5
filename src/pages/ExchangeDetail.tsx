import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Book,
  User,
  Clock,
  Tag,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react'
import { exchangeApi } from '@/lib/api'
import { formatDateTime, cn } from '@/lib/utils'
import type {
  ExchangeListingWithRequests,
  ExchangeRequest,
  BookCondition,
  BOOK_CONDITIONS as BookConditionsType,
  ExchangeListingStatus,
} from '../../shared/types'
import { BOOK_CONDITIONS } from '../../shared/types'

const STATUS_LABEL: Record<ExchangeListingStatus, string> = {
  active: '交换中',
  exchanged: '已交换',
  cancelled: '已取消',
}

const STATUS_COLOR: Record<ExchangeListingStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  exchanged: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const REQUEST_STATUS_LABEL: Record<ExchangeRequest['status'], string> = {
  pending: '待处理',
  accepted: '已接受',
  rejected: '已拒绝',
  completed: '已完成',
}

const REQUEST_STATUS_COLOR: Record<ExchangeRequest['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
}

function getConditionColor(condition: BookCondition): string {
  return BOOK_CONDITIONS.find(c => c.value === condition)?.color ?? 'bg-gray-100 text-gray-700 border-gray-200'
}

export default function ExchangeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [listing, setListing] = useState<ExchangeListingWithRequests | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requester, setRequester] = useState('')
  const [requesterContact, setRequesterContact] = useState('')
  const [offeredTitle, setOfferedTitle] = useState('')
  const [offeredAuthor, setOfferedAuthor] = useState('')
  const [offeredCategory, setOfferedCategory] = useState('')
  const [offeredCondition, setOfferedCondition] = useState<BookCondition>('八成新')
  const [offeredCover, setOfferedCover] = useState('')
  const [message, setMessage] = useState('')
  const [submittingRequest, setSubmittingRequest] = useState(false)

  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const isAdmin = true

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await exchangeApi.get(Number(id))
      setListing(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id, loadData])

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!listing || !requester.trim() || !offeredTitle.trim() || !offeredAuthor.trim() || !offeredCategory.trim()) return

    try {
      setSubmittingRequest(true)
      await exchangeApi.createRequest(listing.id, {
        requester: requester.trim(),
        requesterContact: requesterContact.trim() || undefined,
        offeredBookTitle: offeredTitle.trim(),
        offeredBookAuthor: offeredAuthor.trim(),
        offeredBookCategory: offeredCategory.trim(),
        offeredBookCondition: offeredCondition,
        offeredBookCover: offeredCover.trim() || undefined,
        message: message.trim() || undefined,
      })
      setShowRequestForm(false)
      setRequester('')
      setRequesterContact('')
      setOfferedTitle('')
      setOfferedAuthor('')
      setOfferedCategory('')
      setOfferedCondition('八成新')
      setOfferedCover('')
      setMessage('')
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmittingRequest(false)
    }
  }

  async function handleAcceptRequest(requestId: number) {
    if (!confirm('确认接受此交换请求？')) return
    try {
      setActionLoading(requestId)
      await exchangeApi.acceptRequest(requestId)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRejectRequest(requestId: number) {
    if (!confirm('确认拒绝此交换请求？')) return
    try {
      setActionLoading(requestId)
      await exchangeApi.rejectRequest(requestId)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCompleteRequest(requestId: number) {
    if (!confirm('确认完成此交换？确认后将更新双方积分。')) return
    try {
      setActionLoading(requestId)
      await exchangeApi.completeRequest(requestId)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancelListing() {
    if (!listing) return
    if (!confirm('确认取消此交换挂单？取消后将无法恢复。')) return
    try {
      await exchangeApi.cancel(listing.id)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-white rounded-lg w-24 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="card p-6">
              <div className="aspect-[3/4] bg-coffee-100 rounded-lg animate-pulse mb-4" />
              <div className="h-7 bg-coffee-100 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-4 bg-coffee-100 rounded w-1/2 mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-coffee-100 rounded animate-pulse" />
                <div className="h-4 bg-coffee-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-6">
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

  if (error || !listing) {
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
          <p className="text-coffee-600 font-medium mb-1">{error || '挂单不存在'}</p>
          <button
            onClick={() => navigate('/exchanges')}
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            返回交换列表
          </button>
        </div>
      </div>
    )
  }

  const isOwner = true

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
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-coffee-100 mb-4 relative">
              {listing.bookCover ? (
                <img
                  src={listing.bookCover}
                  alt={listing.bookTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-coffee-300">
                  <Book className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={cn('badge border text-sm px-3 py-1', STATUS_COLOR[listing.status])}>
                  {STATUS_LABEL[listing.status]}
                </span>
              </div>
            </div>

            <h1 className="page-title text-xl mb-1">{listing.bookTitle}</h1>
            <p className="text-coffee-500 mb-4 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {listing.bookAuthor}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-coffee-100">
                <span className="text-sm text-coffee-500">分类</span>
                <span className="badge bg-coffee-100 text-coffee-700 border border-coffee-200">{listing.category}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-coffee-100">
                <span className="text-sm text-coffee-500">新旧程度</span>
                <span className={cn('badge border', getConditionColor(listing.condition))}>
                  {listing.condition}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-coffee-100">
                <span className="text-sm text-coffee-500">所有者</span>
                <Link
                  to={`/readers/${encodeURIComponent(listing.owner)}`}
                  className="text-sm text-coffee-800 font-medium hover:text-coffee-600 transition-colors flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  {listing.owner}
                </Link>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-coffee-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  发布时间
                </span>
                <span className="text-sm text-coffee-800">{formatDateTime(listing.createdAt)}</span>
              </div>
            </div>
          </div>

          {(listing.wantCategories.length > 0 || listing.wantBookNames.length > 0) && (
            <div className="card p-6">
              <h3 className="section-title flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4" />
                想换的图书
              </h3>
              {listing.wantCategories.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-coffee-400 mb-2">偏好分类</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.wantCategories.map((cat, i) => (
                      <span key={i} className="badge bg-amber-50 text-amber-700 border border-amber-200">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {listing.wantBookNames.length > 0 && (
                <div>
                  <p className="text-xs text-coffee-400 mb-2">指定书名</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.wantBookNames.map((name, i) => (
                      <span key={i} className="badge bg-sky-50 text-sky-700 border border-sky-200">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {listing.description && (
            <div className="card p-6">
              <h3 className="section-title flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4" />
                描述
              </h3>
              <p className="text-coffee-700 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {listing.status === 'active' && (
            <button
              onClick={handleCancelListing}
              className="btn-secondary w-full inline-flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <XCircle className="w-4 h-4" />
              取消挂单
            </button>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          {(isOwner || isAdmin) && listing.requests.length > 0 && (
            <div className="card p-6">
              <h3 className="section-title flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4" />
                交换请求
                <span className="badge bg-coffee-100 text-coffee-600 ml-2">
                  {listing.requestCount} 条
                </span>
              </h3>
              <div className="space-y-4">
                {listing.requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-coffee-100 bg-coffee-50/30"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-coffee-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-coffee-600" />
                        </div>
                        <div>
                          <p className="font-medium text-coffee-800 text-sm">{req.requester}</p>
                          <p className="text-xs text-coffee-400">{formatDateTime(req.createdAt)}</p>
                        </div>
                      </div>
                      <span className={cn('badge border text-xs', REQUEST_STATUS_COLOR[req.status])}>
                        {REQUEST_STATUS_LABEL[req.status]}
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-coffee-100 mb-3">
                      <p className="text-xs text-coffee-400 mb-2">提供的图书</p>
                      <div className="flex items-start gap-3">
                        {req.offeredBookCover && (
                          <img
                            src={req.offeredBookCover}
                            alt={req.offeredBookTitle}
                            className="w-12 h-16 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-coffee-800 text-sm">{req.offeredBookTitle}</p>
                          <p className="text-xs text-coffee-500">{req.offeredBookAuthor}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="badge bg-coffee-50 text-coffee-600 border border-coffee-200 text-xs">
                              {req.offeredBookCategory}
                            </span>
                            <span className={cn('badge border text-xs', getConditionColor(req.offeredBookCondition))}>
                              {req.offeredBookCondition}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {req.message && (
                      <p className="text-sm text-coffee-600 mb-3 bg-white rounded-lg p-3 border border-coffee-100">
                        {req.message}
                      </p>
                    )}

                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          disabled={actionLoading === req.id}
                          className={cn(
                            'flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all',
                            actionLoading === req.id
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-emerald-500 text-white hover:bg-emerald-600'
                          )}
                        >
                          <CheckCircle className="w-4 h-4" />
                          接受
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          disabled={actionLoading === req.id}
                          className={cn(
                            'flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all border',
                            actionLoading === req.id
                              ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                              : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                          )}
                        >
                          <XCircle className="w-4 h-4" />
                          拒绝
                        </button>
                      </div>
                    )}

                    {req.status === 'accepted' && isAdmin && (
                      <button
                        onClick={() => handleCompleteRequest(req.id)}
                        disabled={actionLoading === req.id}
                        className={cn(
                          'w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all',
                          actionLoading === req.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-coffee-600 text-white hover:bg-coffee-700'
                        )}
                      >
                        <CheckCircle className="w-4 h-4" />
                        确认完成
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(isOwner || isAdmin) && listing.requests.length === 0 && (
            <div className="card p-6">
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
                <p className="text-coffee-400">暂无交换请求</p>
              </div>
            </div>
          )}

          {listing.status === 'active' && (
            <div className="card p-6">
              <button
                onClick={() => setShowRequestForm(!showRequestForm)}
                className="w-full flex items-center justify-between py-2"
              >
                <h3 className="section-title flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  发起交换请求
                </h3>
                {showRequestForm ? (
                  <ChevronUp className="w-5 h-5 text-coffee-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-coffee-400" />
                )}
              </button>

              {showRequestForm && (
                <form onSubmit={handleSubmitRequest} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">你的昵称 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={requester}
                        onChange={(e) => setRequester(e.target.value)}
                        placeholder="请输入昵称"
                        disabled={submittingRequest}
                        className={cn('input-field', submittingRequest && 'opacity-50 cursor-not-allowed')}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">联系方式</label>
                      <input
                        type="text"
                        value={requesterContact}
                        onChange={(e) => setRequesterContact(e.target.value)}
                        placeholder="手机号/微信号（选填）"
                        disabled={submittingRequest}
                        className={cn('input-field', submittingRequest && 'opacity-50 cursor-not-allowed')}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-coffee-50/50 border border-coffee-100 space-y-4">
                    <p className="text-sm font-medium text-coffee-700 flex items-center gap-1.5">
                      <Book className="w-4 h-4" />
                      提供的图书信息
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">书名 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={offeredTitle}
                          onChange={(e) => setOfferedTitle(e.target.value)}
                          placeholder="请输入书名"
                          disabled={submittingRequest}
                          className={cn('input-field', submittingRequest && 'opacity-50 cursor-not-allowed')}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">作者 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={offeredAuthor}
                          onChange={(e) => setOfferedAuthor(e.target.value)}
                          placeholder="请输入作者"
                          disabled={submittingRequest}
                          className={cn('input-field', submittingRequest && 'opacity-50 cursor-not-allowed')}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">分类 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={offeredCategory}
                          onChange={(e) => setOfferedCategory(e.target.value)}
                          placeholder="如：文学、科技"
                          disabled={submittingRequest}
                          className={cn('input-field', submittingRequest && 'opacity-50 cursor-not-allowed')}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">新旧程度 <span className="text-red-500">*</span></label>
                        <select
                          value={offeredCondition}
                          onChange={(e) => setOfferedCondition(e.target.value as BookCondition)}
                          disabled={submittingRequest}
                          className={cn('input-field', submittingRequest && 'opacity-50 cursor-not-allowed')}
                          required
                        >
                          {BOOK_CONDITIONS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">封面URL</label>
                      <input
                        type="text"
                        value={offeredCover}
                        onChange={(e) => setOfferedCover(e.target.value)}
                        placeholder="图书封面图片链接（选填）"
                        disabled={submittingRequest}
                        className={cn('input-field', submittingRequest && 'opacity-50 cursor-not-allowed')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">留言</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="给挂单者留言（选填）"
                      rows={3}
                      disabled={submittingRequest}
                      className={cn('input-field resize-none', submittingRequest && 'opacity-50 cursor-not-allowed')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingRequest || !requester.trim() || !offeredTitle.trim() || !offeredAuthor.trim() || !offeredCategory.trim()}
                    className={cn(
                      'btn-primary w-full inline-flex items-center justify-center gap-2',
                      (submittingRequest || !requester.trim() || !offeredTitle.trim() || !offeredAuthor.trim() || !offeredCategory.trim()) && 'opacity-50 cursor-not-allowed hover:bg-coffee-700 hover:translate-y-0'
                    )}
                  >
                    {submittingRequest ? (
                      <>提交中...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        提交交换请求
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
