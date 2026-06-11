import { useState } from 'react'
import { X, Send, MessageSquarePlus, CheckCircle, Bug, Lightbulb, HelpCircle } from 'lucide-react'
import { feedbackApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { FeedbackType } from '../../shared/types'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  defaultNickname?: string
}

export default function FeedbackModal({ isOpen, onClose, defaultNickname }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('feature')
  const [content, setContent] = useState('')
  const [contact, setContact] = useState('')
  const [nickname, setNickname] = useState(defaultNickname || '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleClose() {
    if (!submitting) {
      setType('feature')
      setContent('')
      setContact('')
      setError('')
      setSubmitted(false)
      onClose()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || content.trim().length < 5) {
      setError('请填写至少 5 个字符的反馈内容')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      await feedbackApi.submit({
        type,
        content: content.trim(),
        contact: contact.trim() || undefined,
        nickname: nickname.trim() || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const typeOptions: { value: FeedbackType; icon: typeof Bug; label: string }[] = [
    { value: 'feature', icon: Lightbulb, label: '功能建议' },
    { value: 'bug', icon: Bug, label: 'Bug 上报' },
    { value: 'other', icon: HelpCircle, label: '其他' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-coffee-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center">
              <MessageSquarePlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-coffee-900">意见反馈</h2>
              <p className="text-sm text-coffee-500">您的建议对我们很重要</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-2 rounded-lg hover:bg-coffee-50 transition-colors text-coffee-400 hover:text-coffee-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-serif font-bold text-coffee-900 mb-2">提交成功！</h3>
            <p className="text-coffee-600 mb-6">
              感谢您的反馈，我们会认真处理每一条建议。
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-coffee-700 text-white rounded-xl font-medium hover:bg-coffee-800 transition-colors"
            >
              关闭
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-coffee-800 mb-2.5">
                反馈类型 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
                      type === option.value
                        ? 'border-coffee-500 bg-coffee-50 text-coffee-800'
                        : 'border-coffee-100 hover:border-coffee-200 text-coffee-500 hover:text-coffee-600'
                    )}
                  >
                    <option.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-800 mb-2.5">
                反馈内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  setError('')
                }}
                placeholder="请详细描述您的建议或遇到的问题..."
                rows={5}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border-2 bg-white transition-all duration-200 resize-none',
                  'focus:outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-500/10',
                  'placeholder:text-coffee-300',
                  error ? 'border-red-300' : 'border-coffee-100'
                )}
              />
              <div className="flex justify-between mt-1.5">
                {error && <p className="text-xs text-red-500">{error}</p>}
                <p className={cn('text-xs ml-auto', content.length >= 5 ? 'text-coffee-400' : 'text-coffee-300')}>
                  {content.length} / 至少 5 个字符
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-800 mb-2.5">
                联系方式 <span className="text-coffee-400 font-normal">（选填）</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="手机号或邮箱，方便我们联系您"
                className="w-full px-4 py-3 rounded-xl border-2 border-coffee-100 bg-white transition-all duration-200 focus:outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-500/10 placeholder:text-coffee-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-800 mb-2.5">
                您的昵称 <span className="text-coffee-400 font-normal">（选填）</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="让我们知道您是谁"
                className="w-full px-4 py-3 rounded-xl border-2 border-coffee-100 bg-white transition-all duration-200 focus:outline-none focus:border-coffee-500 focus:ring-4 focus:ring-coffee-500/10 placeholder:text-coffee-300"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-coffee-200 text-coffee-600 font-medium hover:bg-coffee-50 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting || content.trim().length < 5}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-coffee-600 to-coffee-800 text-white font-medium hover:from-coffee-700 hover:to-coffee-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-coffee-500/20"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    提交反馈
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
