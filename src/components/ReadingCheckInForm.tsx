import { useState } from 'react'
import { BookOpen, Clock, PenLine, X, CheckCircle, Flame } from 'lucide-react'
import { readingCheckInApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ReadingCheckInStats } from '../../shared/types'

interface ReadingCheckInFormProps {
  nickname: string
  stats: ReadingCheckInStats
  onSuccess?: () => void
}

export default function ReadingCheckInForm({ nickname, stats, onSuccess }: ReadingCheckInFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number>(30)
  const [thoughts, setThoughts] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [todayCheckedIn, setTodayCheckedIn] = useState(false)

  const durationOptions = [15, 30, 45, 60, 90, 120]

  async function handleSubmit() {
    if (!bookTitle.trim()) {
      setError('请输入书名')
      return
    }
    if (durationMinutes <= 0) {
      setError('请选择阅读时长')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await readingCheckInApi.create({
        nickname,
        bookTitle: bookTitle.trim(),
        bookAuthor: bookAuthor.trim() || undefined,
        durationMinutes,
        thoughts: thoughts.trim() || undefined,
      })
      setTodayCheckedIn(true)
      setIsOpen(false)
      setBookTitle('')
      setBookAuthor('')
      setDurationMinutes(30)
      setThoughts('')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '打卡失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <div className="card p-6 bg-gradient-to-br from-emerald-50 via-white to-coffee-50">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-coffee-600">
                已连续打卡 <span className="font-bold text-orange-600 text-lg">{stats.userStreakDays}</span> 天
              </span>
            </div>
            <p className="text-coffee-500 text-sm">
              今日已有 <span className="font-semibold text-emerald-600">{stats.todayCheckInCount}</span> 位读者打卡
            </p>
          </div>

          {todayCheckedIn ? (
            <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-medium">
              <CheckCircle className="w-5 h-5" />
              今日已打卡
            </div>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <BookOpen className="w-5 h-5" />
              立即打卡
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-coffee-100">
              <h3 className="text-lg font-bold text-coffee-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                今日阅读打卡
              </h3>
              <button
                onClick={() => { setIsOpen(false); setError(null) }}
                className="p-1 rounded-lg hover:bg-coffee-50 transition-colors"
              >
                <X className="w-5 h-5 text-coffee-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1.5">
                  <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                  书名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="请输入今天读的书名"
                  className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1.5">
                  作者
                </label>
                <input
                  type="text"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="请输入作者（选填）"
                  className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  阅读时长（分钟） <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {durationOptions.map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDurationMinutes(mins)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        durationMinutes === mins
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'
                      )}
                    >
                      {mins >= 60 ? `${mins / 60}小时` : `${mins}分钟`}
                    </button>
                  ))}
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                    min="1"
                    placeholder="自定义"
                    className="w-20 px-3 py-2 rounded-lg border border-coffee-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-center text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-1.5">
                  <PenLine className="w-3.5 h-3.5 inline mr-1" />
                  阅读心得
                </label>
                <textarea
                  value={thoughts}
                  onChange={(e) => setThoughts(e.target.value)}
                  placeholder="今天读了这本书有什么感想？（选填，最多200字）"
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none"
                />
                <p className="text-xs text-coffee-400 text-right mt-1">{thoughts.length}/200</p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-5 border-t border-coffee-100">
              <button
                onClick={() => { setIsOpen(false); setError(null) }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-coffee-200 text-coffee-600 font-medium hover:bg-coffee-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all',
                  submitting
                    ? 'bg-emerald-300 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg'
                )}
              >
                {submitting ? '提交中...' : '完成打卡'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
