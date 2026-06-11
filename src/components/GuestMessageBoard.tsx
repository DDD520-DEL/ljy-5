import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, RefreshCw, ChevronDown, User, Clock } from 'lucide-react'
import type { GuestMessage, PaginatedGuestMessages, GuestMessageStats } from '../../shared/types'
import { messageApi } from '../lib/api'
import { formatDateTime } from '../lib/utils'

const PAGE_SIZE = 5

export default function GuestMessageBoard() {
  const [messages, setMessages] = useState<GuestMessage[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [stats, setStats] = useState<GuestMessageStats | null>(null)

  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const errorTimeoutRef = useRef<number | null>(null)
  const successTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    loadMessages(true)
    loadStats()
  }, [])

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
    }
  }, [])

  async function loadStats() {
    try {
      const s = await messageApi.stats()
      setStats(s)
    } catch {
      // ignore
    }
  }

  async function loadMessages(reset: boolean = false) {
    if (reset) {
      setLoading(true)
      setPage(1)
    } else {
      setLoadingMore(true)
    }
    try {
      const targetPage = reset ? 1 : page + 1
      const result: PaginatedGuestMessages = await messageApi.list(targetPage, PAGE_SIZE)
      if (reset) {
        setMessages(result.messages)
      } else {
        setMessages(prev => [...prev, ...result.messages])
      }
      setTotal(result.total)
      setHasMore(result.hasMore)
      setPage(targetPage)
    } catch (err) {
      showError('加载留言失败，请稍后重试')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  function showError(msg: string) {
    setError(msg)
    setSuccessMsg('')
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    errorTimeoutRef.current = window.setTimeout(() => setError(''), 4000)
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setError('')
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
    successTimeoutRef.current = window.setTimeout(() => setSuccessMsg(''), 3000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim()) {
      showError('请填写昵称')
      return
    }
    if (!content.trim()) {
      showError('请填写留言内容')
      return
    }
    if (nickname.trim().length > 20) {
      showError('昵称长度不能超过20个字符')
      return
    }
    if (content.trim().length < 2) {
      showError('留言内容至少需要2个字符')
      return
    }
    if (content.trim().length > 500) {
      showError('留言内容不能超过500个字符')
      return
    }
    setSubmitting(true)
    try {
      await messageApi.create({
        nickname: nickname.trim(),
        content: content.trim(),
      })
      setNickname('')
      setContent('')
      showSuccess('留言提交成功！')
      loadMessages(true)
      loadStats()
    } catch (err: any) {
      showError(err?.message || '提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const limitReached = stats ? stats.todayCount >= stats.dailyLimit : false

  return (
    <section className="w-full bg-gradient-to-b from-amber-50/50 to-coffee-50/50 py-16 border-t border-coffee-100">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-coffee-600 mb-3">
            <MessageSquare className="w-6 h-6" />
            <h2 className="text-2xl md:text-3xl font-serif font-semibold">访客留言板</h2>
          </div>
          <p className="text-coffee-500 text-sm">
            无需登录，留下你想说的话与建议
            {stats && (
              <span className="ml-2 text-coffee-400">
                · 今日已发 {stats.todayCount}/{stats.dailyLimit} 条 · 共 {stats.total} 条留言
              </span>
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2">
                {successMsg}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入你的昵称（1-20字）"
                maxLength={20}
                disabled={submitting || limitReached}
                className="w-full px-4 py-2.5 border border-coffee-200 rounded-lg text-coffee-900 placeholder:text-coffee-300 focus:outline-none focus:ring-2 focus:ring-coffee-400/30 focus:border-coffee-400 disabled:bg-coffee-50 disabled:cursor-not-allowed transition"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-coffee-700">留言内容</label>
                <span className={`text-xs ${content.length > 450 ? 'text-amber-600' : 'text-coffee-400'}`}>
                  {content.length}/500
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                placeholder={limitReached ? '今日留言已达上限，请明天再来~' : '写下你想说的话（2-500字）'}
                rows={4}
                disabled={submitting || limitReached}
                className="w-full px-4 py-2.5 border border-coffee-200 rounded-lg text-coffee-900 placeholder:text-coffee-300 focus:outline-none focus:ring-2 focus:ring-coffee-400/30 focus:border-coffee-400 disabled:bg-coffee-50 disabled:cursor-not-allowed resize-none transition"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => loadMessages(true)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-sm text-coffee-500 hover:text-coffee-700 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </button>
              <button
                type="submit"
                disabled={submitting || limitReached}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-coffee-600 text-white rounded-lg font-medium hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    发表留言
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-3">
          {loading && (
            <div className="text-center text-coffee-400 py-8">加载中...</div>
          )}
          {!loading && messages.length === 0 && (
            <div className="text-center text-coffee-400 py-12 bg-white/60 rounded-2xl border border-coffee-100">
              暂无留言，来发表第一条吧~
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white rounded-xl p-5 border border-coffee-100 hover:border-coffee-200 transition shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-coffee-100 to-amber-100 flex items-center justify-center text-coffee-600">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-medium text-coffee-800">{msg.nickname}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-coffee-400">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-coffee-700 whitespace-pre-wrap break-words leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {hasMore && (
            <div className="text-center pt-2">
              <button
                onClick={() => loadMessages(false)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-coffee-600 hover:text-coffee-800 hover:bg-white/80 rounded-lg border border-coffee-200 transition disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    加载更多
                  </>
                )}
              </button>
            </div>
          )}
          {messages.length > 0 && !hasMore && (
            <p className="text-center text-xs text-coffee-400 pt-2">
              — 已显示全部 {total} 条留言 —
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
