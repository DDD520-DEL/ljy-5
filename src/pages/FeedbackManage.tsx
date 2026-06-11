import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Search, Clock, User, Phone, Mail, Check, X, Send, ChevronDown, Loader2 } from 'lucide-react'
import { feedbackApi } from '@/lib/api'
import { cn, formatDateTime } from '@/lib/utils'
import { FEEDBACK_TYPES, FEEDBACK_STATUS, type Feedback, type FeedbackStatus, type FeedbackType } from '../../shared/types'

export default function FeedbackManage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all')
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<FeedbackStatus>('pending')
  const [replyContent, setReplyContent] = useState('')
  const [updating, setUpdating] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [stats, setStats] = useState<{ total: number; pending: number; processing: number; resolved: number; rejected: number } | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [listData, statsData] = await Promise.all([
        feedbackApi.list(filterStatus === 'all' ? undefined : { status: filterStatus, type: filterType === 'all' ? undefined : filterType }),
        feedbackApi.stats(),
      ])
      setFeedbacks(listData)
      setStats(statsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterType])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (!searchKeyword.trim()) return true
    const keyword = searchKeyword.toLowerCase()
    return (
      f.content.toLowerCase().includes(keyword) ||
      (f.nickname && f.nickname.toLowerCase().includes(keyword)) ||
      (f.contact && f.contact.toLowerCase().includes(keyword))
    )
  })

  function openDetail(feedback: Feedback) {
    setSelectedFeedback(feedback)
    setUpdateStatus(feedback.status)
    setReplyContent(feedback.reply || '')
    setShowDetailModal(true)
  }

  function closeDetail() {
    setShowDetailModal(false)
    setSelectedFeedback(null)
    setReplyContent('')
    setShowStatusDropdown(false)
  }

  async function handleUpdateStatus() {
    if (!selectedFeedback) return
    if (updateStatus === 'resolved' && !replyContent.trim()) {
      alert('标记为已解决时必须填写回复内容')
      return
    }

    try {
      setUpdating(true)
      const result = await feedbackApi.updateStatus(selectedFeedback.id, {
        status: updateStatus,
        reply: updateStatus === 'resolved' ? replyContent.trim() : undefined,
        operator: '书店管理员',
      })
      setFeedbacks(prev => prev.map(f => f.id === result.feedback.id ? result.feedback : f))
      if (stats) {
        const newStats = await feedbackApi.stats()
        setStats(newStats)
      }
      closeDetail()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setUpdating(false)
    }
  }

  const statusOptions = [
    { value: 'pending', label: '待处理', color: 'text-amber-600' },
    { value: 'processing', label: '处理中', color: 'text-blue-600' },
    { value: 'resolved', label: '已解决', color: 'text-emerald-600' },
    { value: 'rejected', label: '不予处理', color: 'text-gray-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">意见反馈管理</h1>
          <p className="text-coffee-500 mt-1">
            处理读者的意见和建议
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-coffee-900">{stats.total}</p>
              <p className="text-xs text-coffee-500">总反馈数</p>
            </div>
          </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-amber-700">{stats.pending}</p>
                <p className="text-xs text-coffee-500">待处理</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-blue-700">{stats.processing}</p>
                <p className="text-xs text-coffee-500">处理中</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-emerald-700">{stats.resolved}</p>
                <p className="text-xs text-coffee-500">已解决</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-gray-700">{stats.rejected}</p>
                <p className="text-xs text-coffee-500">不予处理</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索反馈内容、昵称、联系方式..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-coffee-100 bg-white text-sm focus:outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-500/10"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FeedbackType | 'all')}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border-2 border-coffee-100 bg-white text-sm focus:outline-none focus:border-coffee-500"
            >
              <option value="all">全部类型</option>
              <option value="feature">功能建议</option>
              <option value="bug">Bug 上报</option>
              <option value="other">其他</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FeedbackStatus | 'all')}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border-2 border-coffee-100 bg-white text-sm focus:outline-none focus:border-coffee-500"
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="resolved">已解决</option>
              <option value="rejected">不予处理</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-coffee-200 border-t-coffee-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-coffee-500">加载中...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
            <p className="text-coffee-500">暂无反馈数据</p>
          </div>
        ) : (
          <div className="divide-y divide-coffee-50">
            {filteredFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                onClick={() => openDetail(feedback)}
                className="p-5 hover:bg-coffee-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('badge border', FEEDBACK_TYPES[feedback.type].color)}>
                        {FEEDBACK_TYPES[feedback.type].label}
                      </span>
                      <span className={cn('badge border', FEEDBACK_STATUS[feedback.status].color)}>
                        {FEEDBACK_STATUS[feedback.status].label}
                      </span>
                      {feedback.nickname && (
                        <span className="inline-flex items-center gap-1 text-xs text-coffee-500">
                          <User className="w-3 h-3" />
                          {feedback.nickname}
                        </span>
                      )}
                    </div>
                    <p className="text-coffee-800 line-clamp-2 mb-2">{feedback.content}</p>
                    <div className="flex items-center gap-4 text-xs text-coffee-400">
                      <span>{formatDateTime(feedback.createdAt)}</span>
                      {feedback.contact && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {feedback.contact}
                        </span>
                      )}
                      {feedback.reply && (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <Check className="w-3 h-3" />
                          已回复
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={closeDetail}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-coffee-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-coffee-900">反馈详情</h2>
                  <p className="text-sm text-coffee-500">#{selectedFeedback.id}</p>
                </div>
              </div>
              <button
                onClick={closeDetail}
                className="p-2 rounded-lg hover:bg-coffee-50 transition-colors text-coffee-400 hover:text-coffee-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className={cn('badge border px-3 py-1', FEEDBACK_TYPES[selectedFeedback.type].color)}>
                  {FEEDBACK_TYPES[selectedFeedback.type].label}
                </span>
                <span className={cn('badge border px-3 py-1', FEEDBACK_STATUS[selectedFeedback.status].color)}>
                  {FEEDBACK_STATUS[selectedFeedback.status].label}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-800 mb-2">反馈内容</label>
                <div className="p-4 bg-coffee-50 rounded-xl">
                  <p className="text-coffee-800 whitespace-pre-wrap">{selectedFeedback.content}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-600 mb-1.5">提交时间</label>
                  <p className="text-coffee-800">{formatDateTime(selectedFeedback.createdAt)}</p>
                </div>
                {selectedFeedback.nickname && (
                  <div>
                    <label className="block text-sm font-medium text-coffee-600 mb-1.5">昵称</label>
                    <p className="text-coffee-800">{selectedFeedback.nickname}</p>
                  </div>
                )}
                {selectedFeedback.contact && (
                  <div>
                    <label className="block text-sm font-medium text-coffee-600 mb-1.5">
                      {selectedFeedback.contact.includes('@') ? (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          邮箱
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          联系方式
                        </span>
                      )}
                    </label>
                    <p className="text-coffee-800">{selectedFeedback.contact}</p>
                  </div>
                )}
              </div>

              {selectedFeedback.reply && (
                <div>
                  <label className="block text-sm font-medium text-coffee-800 mb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      管理员回复
                    </span>
                  </label>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-coffee-800">{selectedFeedback.reply}</p>
                    <p className="text-xs text-coffee-400 mt-2">
                      回复于 {formatDateTime(selectedFeedback.repliedAt!)} · {selectedFeedback.repliedBy}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-coffee-100">
                <label className="block text-sm font-medium text-coffee-800 mb-3">更新处理状态</label>

                <div className="space-y-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-coffee-100 bg-white text-left hover:border-coffee-300 transition-colors"
                    >
                      <span className={cn(
                        'font-medium',
                        statusOptions.find(o => o.value === updateStatus)?.color
                      )}>
                        {statusOptions.find(o => o.value === updateStatus)?.label}
                      </span>
                      <ChevronDown className={cn('w-4 h-4 text-coffee-400 transition-transform', showStatusDropdown && 'rotate-180')} />
                    </button>

                    {showStatusDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border-2 border-coffee-100 shadow-lg z-10 overflow-hidden">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setUpdateStatus(option.value as FeedbackStatus)
                              setShowStatusDropdown(false)
                            }}
                            className={cn(
                              'w-full px-4 py-3 text-left hover:bg-coffee-50 transition-colors flex items-center justify-between',
                              updateStatus === option.value && 'bg-coffee-50'
                            )}
                          >
                            <span className={option.color}>{option.label}</span>
                            {updateStatus === option.value && (
                              <Check className="w-4 h-4 text-coffee-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {updateStatus === 'resolved' && (
                    <div>
                      <label className="block text-sm font-medium text-coffee-800 mb-2">
                        回复内容 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="请输入回复内容..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border-2 border-coffee-100 bg-white transition-all duration-200 resize-none focus:outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-500/10 placeholder:text-coffee-300"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeDetail}
                      disabled={updating}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-coffee-200 text-coffee-600 font-medium hover:bg-coffee-50 transition-colors disabled:opacity-50"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updating || (updateStatus === 'resolved' && !replyContent.trim())}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-medium hover:from-coffee-700 hover:to-coffee-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-coffee-500/20"
                    >
                      {updating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          保存
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
