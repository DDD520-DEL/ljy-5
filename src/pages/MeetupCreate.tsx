import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarPlus,
  Book,
  MapPin,
  Users,
  Upload,
  ArrowLeft,
  Save,
  Image,
  CheckCircle,
  ArrowRight,
  X,
  Search,
  ChevronDown,
  Minus,
  Plus,
} from 'lucide-react'
import { meetupApi, bookApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Book as BookType, CreateMeetupRequest } from '../../shared/types'

type FormState = CreateMeetupRequest

const initialForm: FormState = {
  title: '',
  description: '',
  bookId: undefined,
  date: '',
  location: '',
  maxParticipants: 10,
  coverImage: '',
}

export default function MeetupCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(initialForm)
  const [books, setBooks] = useState<BookType[]>([])
  const [booksLoading, setBooksLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ meetupId: number } | null>(null)
  const [bookSearch, setBookSearch] = useState('')
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null)

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate(`/meetups/${success.meetupId}`)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [success, navigate])

  async function loadBooks() {
    try {
      setBooksLoading(true)
      const data = await bookApi.list()
      setBooks(data)
    } catch (err) {
      console.error('Failed to load books:', err)
    } finally {
      setBooksLoading(false)
    }
  }

  function handleChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleMaxParticipantsChange(delta: number) {
    setForm((prev) => ({
      ...prev,
      maxParticipants: Math.max(1, Math.min(100, prev.maxParticipants + delta)),
    }))
  }

  function handleSelectBook(book: BookType) {
    setSelectedBook(book)
    handleChange('bookId', book.id)
    setBookDropdownOpen(false)
    setBookSearch('')
  }

  function handleClearBook() {
    setSelectedBook(null)
    handleChange('bookId', undefined)
    setBookSearch('')
  }

  const filteredBooks = books.filter((book) => {
    if (!bookSearch.trim()) return true
    const search = bookSearch.toLowerCase()
    return (
      book.title.toLowerCase().includes(search) ||
      book.author.toLowerCase().includes(search)
    )
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) {
      setError('请输入活动标题')
      return
    }
    if (!form.description.trim()) {
      setError('请输入活动描述')
      return
    }
    if (!form.date) {
      setError('请选择活动时间')
      return
    }
    if (!form.location.trim()) {
      setError('请输入活动地点')
      return
    }
    if (!form.maxParticipants || form.maxParticipants < 1) {
      setError('请设置有效的人数上限')
      return
    }

    setSubmitting(true)
    try {
      const createdMeetup = await meetupApi.create({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        coverImage: form.coverImage?.trim() || undefined,
      })
      setSuccess({ meetupId: createdMeetup.id })
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建活动失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-coffee-900 mb-2">活动创建成功！</h2>
          <p className="text-coffee-500 mb-6">即将跳转到活动详情页面...</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(`/meetups/${success.meetupId}`)}
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'btn-primary'
              )}
            >
              <ArrowRight className="w-4 h-4" />
              立即查看
            </button>
            <button
              onClick={() => {
                setSuccess(null)
                setForm(initialForm)
                setSelectedBook(null)
              }}
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'btn-secondary'
              )}
            >
              <CalendarPlus className="w-4 h-4" />
              继续创建
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary inline-flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center">
            <CalendarPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">发起读书会</h1>
            <p className="text-coffee-500 text-sm">创建一个新的读书分享活动</p>
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
          <h3 className="section-title flex items-center gap-2">
          <CalendarPlus className="w-4 h-4" />
            基本信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">活动标题 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入活动标题"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">活动描述 <span className="text-red-500">*</span></label>
              <textarea
                className="input-field min-h-[120px] resize-y"
                placeholder="介绍本次活动的主题、内容、形式等..."
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Book className="w-4 h-4" />
            推荐图书
          </h3>
          <div className="relative">
            <label className="label">选择本期推荐图书 <span className="text-coffee-400 text-xs">（选填）</span></label>
            {selectedBook ? (
              <div className="flex gap-3 p-3 rounded-lg border border-coffee-200 bg-coffee-50">
                <div className="w-14 h-20 flex-shrink-0 rounded-md overflow-hidden bg-coffee-100">
                  {selectedBook.coverImage ? (
                    <img
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-coffee-300">
                        <Book className="w-6 h-6" />
                      </div>
                    )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="font-medium text-coffee-900">{selectedBook.title}</p>
                  <p className="text-sm text-coffee-500">{selectedBook.author}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClearBook}
                  className="p-1.5 rounded-md hover:bg-coffee-100 text-coffee-400 hover:text-coffee-600 transition-colors self-start"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div
                  className={cn(
                    'input-field flex items-center gap-2 cursor-pointer',
                    bookDropdownOpen && 'border-coffee-500 ring-2 ring-coffee-100'
                  )}
                  onClick={() => setBookDropdownOpen(!bookDropdownOpen)}
                >
                  <Search className="w-4 h-4 text-coffee-400" />
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none text-sm"
                    placeholder={booksLoading ? '加载图书中...' : '搜索或选择一本图书...'}
                    value={bookSearch}
                    onChange={(e) => {
                      setBookSearch(e.target.value)
                      setBookDropdownOpen(true)
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setBookDropdownOpen(true)
                    }}
                    disabled={booksLoading}
                  />
                  <ChevronDown
                    className={cn(
                    'w-4 h-4 text-coffee-400 transition-transform',
                    bookDropdownOpen && 'rotate-180'
                  )}
                  />
                </div>
                {bookDropdownOpen && !booksLoading && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg border border-coffee-200 bg-white shadow-lg">
                    {filteredBooks.length === 0 ? (
                      <div className="p-4 text-center text-coffee-400 text-sm">
                        未找到匹配的图书
                      </div>
                    ) : (
                      filteredBooks.map((book) => (
                        <div
                          key={book.id}
                          className="flex gap-2 p-3 hover:bg-coffee-50 cursor-pointer border-b border-coffee-100 last:border-b-0"
                          onClick={() => handleSelectBook(book)}
                        >
                          <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-coffee-100">
                            {book.coverImage ? (
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-coffee-300">
                                <Book className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-coffee-900 truncate">
                              {book.title}
                            </p>
                            <p className="text-xs text-coffee-500 truncate">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            活动安排
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">活动时间 <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
            <div>
              <label className="label">活动地点 <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="请输入活动地点"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">人数上限 <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMaxParticipantsChange(-1)}
                  className="w-10 h-10 rounded-lg border border-coffee-200 bg-white flex items-center justify-center text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  className="input-field text-center flex-1"
                  min={1}
                  max={100}
                  value={form.maxParticipants}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    handleChange('maxParticipants', Math.max(1, Math.min(100, val)))
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleMaxParticipantsChange(1)}
                  className="w-10 h-10 rounded-lg border border-coffee-200 bg-white flex items-center justify-center text-coffee-600 hover:bg-coffee-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-coffee-400">
                <Users className="w-3.5 h-3.5" />
                <span>可设置 1-100 人</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Image className="w-4 h-4" />
            封面图片
          </h3>
          <div>
            <label className="label">封面图片URL <span className="text-coffee-400 text-xs">（选填）</span></label>
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
                  className="w-full h-48 object-cover rounded-lg shadow-sm border border-coffee-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => navigate('/meetups')}
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
                创建中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                创建活动
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
