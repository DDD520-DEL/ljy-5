import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookPlus, Upload, CheckCircle, QrCode, ArrowRight, X } from 'lucide-react'
import { bookApi } from '@/lib/api'
import { sourceTypeLabel, cn } from '@/lib/utils'
import type { SourceType, CreateBookRequest } from '../../shared/types'

type FormState = Omit<CreateBookRequest, 'sourceType'> & { sourceType: SourceType }

const initialForm: FormState = {
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  category: '',
  sourceType: 'donation',
  sourceInfo: '',
  coverImage: '',
  description: '',
}

export default function BookAdd() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    bookId: number
    traceId: string
    qrcode: string
    traceUrl: string
  } | null>(null)

  const sourceTypes: SourceType[] = ['donation', 'direct', 'secondhand']

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSourceTypeChange(type: SourceType) {
    setForm((prev) => ({ ...prev, sourceType: type }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) {
      setError('请输入书名')
      return
    }
    if (!form.author.trim()) {
      setError('请输入作者')
      return
    }
    if (!form.category.trim()) {
      setError('请输入分类')
      return
    }

    setSubmitting(true)
    try {
      const result = await bookApi.create(form)
      const qrData = await bookApi.qrcode(result.book.id)
      setSuccess({
        bookId: result.book.id,
        traceId: result.book.traceId,
        qrcode: qrData.qrcode,
        traceUrl: qrData.traceUrl,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建图书失败')
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setForm(initialForm)
    setSuccess(null)
    setError(null)
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-coffee-900 mb-2">图书入库成功！</h2>
          <p className="text-coffee-500 mb-6">已生成溯源二维码，可用于追踪图书流转信息</p>

          <div className="bg-gradient-to-br from-coffee-50 to-brass-400/10 rounded-2xl p-6 mb-6 border border-coffee-100">
            <div className="inline-block p-4 bg-white rounded-xl shadow-sm mb-4">
              {success.qrcode && (
                <img
                  src={success.qrcode}
                  alt="溯源二维码"
                  className="w-48 h-48 object-contain"
                />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-coffee-500" />
                <span className="text-sm text-coffee-600">溯源ID：</span>
                <code className="px-2.5 py-1 bg-coffee-100 rounded-md text-sm font-mono text-coffee-800">
                  {success.traceId}
                </code>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/trace/${success.traceId}`}
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'btn-primary'
              )}
            >
              <ArrowRight className="w-4 h-4" />
              查看溯源页面
            </Link>
            <button
              onClick={handleReset}
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'btn-secondary'
              )}
            >
              <BookPlus className="w-4 h-4" />
              继续添加
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center">
            <BookPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">图书入库</h1>
            <p className="text-coffee-500 text-sm">录入新图书信息，生成溯源二维码</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="section-title">基本信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">书名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入书名"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div>
              <label className="label">作者 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入作者"
                value={form.author}
                onChange={(e) => handleChange('author', e.target.value)}
              />
            </div>
            <div>
              <label className="label">ISBN</label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入ISBN"
                value={form.isbn}
                onChange={(e) => handleChange('isbn', e.target.value)}
              />
            </div>
            <div>
              <label className="label">出版社</label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入出版社"
                value={form.publisher}
                onChange={(e) => handleChange('publisher', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">分类 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="如：文学、历史、科技、哲学…"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="space-y-4">
          <h3 className="section-title">来源信息</h3>
          <div>
            <label className="label">来源类型 <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {sourceTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSourceTypeChange(type)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                    form.sourceType === type
                      ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm'
                      : 'bg-white text-coffee-600 border-coffee-200 hover:border-coffee-400 hover:bg-coffee-50'
                  )}
                >
                  {sourceTypeLabel[type]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">来源备注</label>
            <textarea
              className="input-field min-h-[80px] resize-y"
              placeholder="补充说明来源详情，如捐赠人姓名、回收渠道等"
              value={form.sourceInfo}
              onChange={(e) => handleChange('sourceInfo', e.target.value)}
            />
          </div>
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="space-y-4">
          <h3 className="section-title">附加信息</h3>
          <div>
            <label className="label">封面图片URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                className="input-field flex-1"
                placeholder="https://..."
                value={form.coverImage}
                onChange={(e) => handleChange('coverImage', e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary px-4 flex items-center gap-1"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">上传</span>
              </button>
            </div>
            {form.coverImage && (
              <div className="mt-3">
                <img
                  src={form.coverImage}
                  alt="封面预览"
                  className="w-24 h-32 object-cover rounded-lg shadow-sm border border-coffee-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label className="label">简介</label>
            <textarea
              className="input-field min-h-[120px] resize-y"
              placeholder="图书内容简介、推荐语等"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              'btn-primary flex items-center justify-center gap-2',
              submitting && 'opacity-60 cursor-not-allowed'
            )}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                确认入库
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
