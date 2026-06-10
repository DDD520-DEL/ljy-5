import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  Gift,
  BookOpen,
  User,
  ChevronRight,
  Camera,
  ArrowRight,
  QrCode,
  X,
  Eye,
  Filter,
} from 'lucide-react'
import { donationApi } from '@/lib/api'
import { formatDateTime, cn, donationReviewStatusLabel, donationReviewStatusColor } from '@/lib/utils'
import type { DonationReview, ApproveDonationRequest } from '../../shared/types'

export default function DonationReviewPage() {
  const [reviews, setReviews] = useState<DonationReview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')
  const [selectedReview, setSelectedReview] = useState<DonationReview | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState<{
    book: { id: number; traceId: string; title: string }
    qrcode: { qrcode: string; traceId: string; traceUrl: string } | null
    pointsResult?: { levelUp: boolean; account: { points: number; level: string } }
  } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [approveForm, setApproveForm] = useState<ApproveDonationRequest>({})

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true)
      const data = activeTab === 'pending' ? await donationApi.pending() : await donationApi.all()
      setReviews(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  function openApproveModal(review: DonationReview) {
    setApproveForm({
      title: review.title,
      author: review.author,
      isbn: review.isbn,
      publisher: review.publisher,
      category: review.category,
      sourceInfo: review.sourceInfo,
      coverImage: review.coverImage,
      description: review.description,
      bookPhotos: [],
      reviewer: '管理员',
    })
    setSelectedReview(review)
    setShowApproveModal(true)
    setError(null)
  }

  function openRejectModal(review: DonationReview) {
    setSelectedReview(review)
    setRejectReason('')
    setShowRejectModal(true)
    setError(null)
  }

  async function handleApprove() {
    if (!selectedReview) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await donationApi.approve(selectedReview.id, approveForm)
      setShowApproveModal(false)
      setShowResultModal({
        book: { id: result.book.id, traceId: result.book.traceId, title: result.book.title },
        qrcode: result.qrcode,
        pointsResult: result.pointsResult ? {
          levelUp: result.pointsResult.levelUp,
          account: { points: result.pointsResult.account.points, level: result.pointsResult.account.level },
        } : undefined,
      })
      loadReviews()
    } catch (err) {
      setError(err instanceof Error ? err.message : '审核通过失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject() {
    if (!selectedReview) return
    if (!rejectReason.trim()) {
      setError('驳回原因不能为空')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await donationApi.reject(selectedReview.id, { reviewNote: rejectReason, reviewer: '管理员' })
      setShowRejectModal(false)
      loadReviews()
    } catch (err) {
      setError(err instanceof Error ? err.message : '驳回失败')
    } finally {
      setSubmitting(false)
    }
  }

  const pendingCount = reviews.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">捐赠审核</h1>
            <p className="text-coffee-500 text-sm">审核读者提交的捐赠图书申请</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
            activeTab === 'pending'
              ? 'bg-coffee-700 text-white shadow-md'
              : 'text-coffee-500 hover:text-coffee-700 hover:bg-coffee-50'
          )}
        >
          <Clock className="w-4 h-4" />
          待审核
          {pendingCount > 0 && activeTab === 'pending' && (
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-white/20">{pendingCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
            activeTab === 'all'
              ? 'bg-coffee-700 text-white shadow-md'
              : 'text-coffee-500 hover:text-coffee-700 hover:bg-coffee-50'
          )}
        >
          <Filter className="w-4 h-4" />
          全部记录
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-coffee-100 rounded w-1/3 mb-4" />
              <div className="h-4 bg-coffee-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-coffee-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card p-16 text-center">
          <Gift className="w-16 h-16 text-coffee-200 mx-auto mb-4" />
          <p className="text-coffee-500 font-medium">
            {activeTab === 'pending' ? '暂无待审核的捐赠申请' : '暂无捐赠审核记录'}
          </p>
          <p className="text-coffee-400 text-sm mt-1">
            读者提交的捐赠图书将在这里等待您的审核
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div
              key={review.id}
              className={cn(
                'card p-6 transition-all hover:shadow-md',
                review.status === 'pending' && 'border-l-4 border-l-amber-400'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-serif font-bold text-coffee-900 text-lg">{review.title}</h3>
                    <span className={cn('badge border', donationReviewStatusColor[review.status])}>
                      {donationReviewStatusLabel[review.status]}
                    </span>
                  </div>
                  <p className="text-coffee-600 mb-2">{review.author}</p>
                  {review.description && (
                    <p className="text-coffee-500 text-sm mb-3 line-clamp-2">{review.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-coffee-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      捐赠者: {review.donor}
                    </span>
                    {review.donorContact && (
                      <span>联系方式: {review.donorContact}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {review.category}
                    </span>
                    {review.isbn && <span>ISBN: {review.isbn}</span>}
                    {review.publisher && <span>出版社: {review.publisher}</span>
                    }
                  </div>

                  {review.sourceInfo && (
                    <p className="text-coffee-400 text-sm mt-2">来源备注: {review.sourceInfo}</p>
                  )}

                  <div className="flex items-center gap-3 mt-3 text-xs text-coffee-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      提交于 {formatDateTime(review.createdAt)}
                    </span>
                    {review.reviewedAt && (
                      <span>审核于 {formatDateTime(review.reviewedAt)}</span>
                    )}
                    {review.reviewer && <span>审核人: {review.reviewer}</span>}
                  </div>

                  {review.status === 'rejected' && review.reviewNote && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">驳回原因：</span>
                        {review.reviewNote}
                      </p>
                    </div>
                  )}

                  {review.status === 'approved' && review.bookId && (
                    <div className="mt-3">
                      <Link
                        to={`/books/${review.bookId}`}
                        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        查看已入库图书
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                {review.coverImage && (
                  <img
                    src={review.coverImage}
                    alt={review.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-sm border border-coffee-100 flex-shrink-0"
                  />
                )}
              </div>

              {review.status === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-coffee-100">
                  <button
                    onClick={() => openApproveModal(review)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    审核通过
                  </button>
                  <button
                    onClick={() => openRejectModal(review)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    驳回
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showApproveModal && selectedReview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-coffee-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-coffee-900">审核通过 - 确认图书信息</h2>
                <p className="text-sm text-coffee-500 mt-1">可在此修正或补充书籍信息，审核通过后将正式入库</p>
              </div>
              <button onClick={() => setShowApproveModal(false)} className="p-2 hover:bg-coffee-50 rounded-lg transition-colors">
                <X className="w-5 h-5 text-coffee-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">书名</label>
                  <input
                    type="text"
                    className="input-field"
                    value={approveForm.title || ''}
                    onChange={(e) => setApproveForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">作者</label>
                  <input
                    type="text"
                    className="input-field"
                    value={approveForm.author || ''}
                    onChange={(e) => setApproveForm(prev => ({ ...prev, author: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">ISBN</label>
                  <input
                    type="text"
                    className="input-field"
                    value={approveForm.isbn || ''}
                    onChange={(e) => setApproveForm(prev => ({ ...prev, isbn: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">出版社</label>
                  <input
                    type="text"
                    className="input-field"
                    value={approveForm.publisher || ''}
                    onChange={(e) => setApproveForm(prev => ({ ...prev, publisher: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">分类</label>
                  <input
                    type="text"
                    className="input-field"
                    value={approveForm.category || ''}
                    onChange={(e) => setApproveForm(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">来源备注</label>
                  <input
                    type="text"
                    className="input-field"
                    value={approveForm.sourceInfo || ''}
                    onChange={(e) => setApproveForm(prev => ({ ...prev, sourceInfo: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="label">封面图片URL</label>
                <input
                  type="url"
                  className="input-field"
                  value={approveForm.coverImage || ''}
                  onChange={(e) => setApproveForm(prev => ({ ...prev, coverImage: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">实物照片URL（可多个，用逗号分隔）</label>
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-coffee-400 flex-shrink-0" />
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="https://..., https://..."
                    value={(approveForm.bookPhotos || []).join(', ')}
                    onChange={(e) => {
                      const photos = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      setApproveForm(prev => ({ ...prev, bookPhotos: photos }))
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="label">简介</label>
                <textarea
                  className="input-field min-h-[100px] resize-y"
                  value={approveForm.description || ''}
                  onChange={(e) => setApproveForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">审核人</label>
                <input
                  type="text"
                  className="input-field"
                  value={approveForm.reviewer || '管理员'}
                  onChange={(e) => setApproveForm(prev => ({ ...prev, reviewer: e.target.value }))}
                />
              </div>
            </div>

            <div className="p-6 border-t border-coffee-100 flex justify-end gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className={cn(
                  'btn-primary flex items-center gap-2',
                  submitting && 'opacity-60 cursor-not-allowed'
                )}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    确认通过并入库
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedReview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-coffee-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-coffee-900">驳回捐赠申请</h2>
                <p className="text-sm text-coffee-500 mt-1">请填写驳回原因通知捐赠者</p>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="p-2 hover:bg-coffee-50 rounded-lg transition-colors">
                <X className="w-5 h-5 text-coffee-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="p-4 bg-coffee-50 rounded-lg">
                <p className="font-medium text-coffee-800">{selectedReview.title}</p>
                <p className="text-sm text-coffee-600">{selectedReview.author} · 捐赠者: {selectedReview.donor}</p>
              </div>

              <div>
                <label className="label">驳回原因 <span className="text-red-500">*</span></label>
                <textarea
                  className="input-field min-h-[120px] resize-y"
                  placeholder="请说明驳回原因，以便捐赠者了解问题所在"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 border-t border-coffee-100 flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2',
                  submitting && 'opacity-60 cursor-not-allowed'
                )}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    确认驳回
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResultModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-coffee-900 mb-2">审核通过，图书已入库！</h2>
              <p className="text-coffee-500 mb-1">《{showResultModal.book.title}》</p>
              {showResultModal.pointsResult && (
                <p className="text-sm text-emerald-600 mb-4">
                  已为捐赠者发放 {20} 积分
                  {showResultModal.pointsResult.levelUp && ' 🎉 等级提升！'}
                </p>
              )}

              {showResultModal.qrcode && (
                <div className="bg-gradient-to-br from-coffee-50 to-brass-400/10 rounded-2xl p-6 mb-6 border border-coffee-100">
                  <div className="inline-block p-4 bg-white rounded-xl shadow-sm mb-4">
                    <img
                      src={showResultModal.qrcode.qrcode}
                      alt="溯源二维码"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4 text-coffee-500" />
                    <span className="text-sm text-coffee-600">溯源ID：</span>
                    <code className="px-2.5 py-1 bg-coffee-100 rounded-md text-sm font-mono text-coffee-800">
                      {showResultModal.qrcode.traceId}
                    </code>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to={`/books/${showResultModal.book.id}`}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  查看图书
                </Link>
                <Link
                  to={`/trace/${showResultModal.book.traceId}`}
                  className="btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  查看溯源
                </Link>
                <button
                  onClick={() => setShowResultModal(null)}
                  className="btn-secondary"
                >
                  继续审核
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
