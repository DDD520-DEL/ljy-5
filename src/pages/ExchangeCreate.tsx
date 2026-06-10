import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  X,
  Book,
  Search,
  ChevronDown,
  CheckCircle,
  ArrowRight,
  Repeat,
  User,
  Phone,
  BookOpen,
  Star,
  MessageSquare,
} from 'lucide-react'
import { exchangeApi, bookApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Book as BookType, CreateExchangeListingRequest, BookCondition } from '../../shared/types'
import { BOOK_CONDITIONS } from '../../shared/types'

const CATEGORIES = ['文学小说', '科幻小说', '历史社科', '哲学思想', '儿童文学', '艺术', '摄影', '其他']

interface FormState {
  owner: string
  ownerContact: string
  bookId: number | undefined
  bookTitle: string
  bookAuthor: string
  bookCover: string
  category: string
  condition: BookCondition
  wantCategories: string[]
  wantBookNames: string
  description: string
}

const initialForm: FormState = {
  owner: '',
  ownerContact: '',
  bookId: undefined,
  bookTitle: '',
  bookAuthor: '',
  bookCover: '',
  category: '',
  condition: '八成新',
  wantCategories: [],
  wantBookNames: '',
  description: '',
}

export default function ExchangeCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(initialForm)
  const [books, setBooks] = useState<BookType[]>([])
  const [booksLoading, setBooksLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ listingId: number } | null>(null)
  const [bookSearch, setBookSearch] = useState('')
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null)

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/exchanges')
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

  function handleSelectBook(book: BookType) {
    setSelectedBook(book)
    setForm((prev) => ({
      ...prev,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      category: book.category,
      bookCover: book.coverImage || '',
    }))
    setBookDropdownOpen(false)
    setBookSearch('')
  }

  function handleClearBook() {
    setSelectedBook(null)
    setForm((prev) => ({
      ...prev,
      bookId: undefined,
      bookTitle: '',
      bookAuthor: '',
      category: '',
      bookCover: '',
    }))
    setBookSearch('')
  }

  function toggleWantCategory(cat: string) {
    setForm((prev) => ({
      ...prev,
      wantCategories: prev.wantCategories.includes(cat)
        ? prev.wantCategories.filter((c) => c !== cat)
        : [...prev.wantCategories, cat],
    }))
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

    if (!form.owner.trim()) {
      setError('请输入挂单人昵称')
      return
    }
    if (!form.bookTitle.trim()) {
      setError('请输入书名')
      return
    }
    if (!form.bookAuthor.trim()) {
      setError('请输入作者')
      return
    }
    if (!form.category.trim()) {
      setError('请选择分类')
      return
    }

    const wantBookNamesList = form.wantBookNames
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean)

    if (form.wantCategories.length === 0 && wantBookNamesList.length === 0) {
      setError('请至少选择一个想换的图书类型或填写想换的具体书名')
      return
    }

    setSubmitting(true)
    try {
      const payload: CreateExchangeListingRequest = {
        owner: form.owner.trim(),
        ownerContact: form.ownerContact.trim() || undefined,
        bookId: form.bookId,
        bookTitle: form.bookTitle.trim(),
        bookAuthor: form.bookAuthor.trim(),
        bookCover: form.bookCover.trim() || undefined,
        category: form.category,
        condition: form.condition,
        wantCategories: form.wantCategories,
        wantBookNames: wantBookNamesList,
        description: form.description.trim() || undefined,
      }
      const created = await exchangeApi.create(payload)
      setSuccess({ listingId: created.id })
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建交换挂单失败')
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
          <h2 className="text-2xl font-serif font-bold text-coffee-900 mb-2">挂单成功！</h2>
          <p className="text-coffee-500 mb-6">即将跳转到交换列表页面...</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/exchanges')}
              className={cn('inline-flex items-center justify-center gap-2', 'btn-primary')}
            >
              <ArrowRight className="w-4 h-4" />
              查看交换列表
            </button>
            <button
              onClick={() => {
                setSuccess(null)
                setForm(initialForm)
                setSelectedBook(null)
              }}
              className={cn('inline-flex items-center justify-center gap-2', 'btn-secondary')}
            >
              <Repeat className="w-4 h-4" />
              继续挂单
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
            <Repeat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">挂出图书</h1>
            <p className="text-coffee-500 text-sm">发布图书交换信息，以书换书</p>
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
            <User className="w-4 h-4" />
            挂单信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">挂单人昵称 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入您的昵称"
                value={form.owner}
                onChange={(e) => handleChange('owner', e.target.value)}
              />
            </div>
            <div>
              <label className="label">联系方式 <span className="text-coffee-400 text-xs">（选填）</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="方便其他读者联系您"
                  value={form.ownerContact}
                  onChange={(e) => handleChange('ownerContact', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Book className="w-4 h-4" />
            图书信息
          </h3>

          <div>
            <label className="label">从馆藏选择 <span className="text-coffee-400 text-xs">（选填，选择后自动填充）</span></label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">书名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入书名"
                value={form.bookTitle}
                onChange={(e) => handleChange('bookTitle', e.target.value)}
              />
            </div>
            <div>
              <label className="label">作者 <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入作者"
                value={form.bookAuthor}
                onChange={(e) => handleChange('bookAuthor', e.target.value)}
              />
            </div>
            <div>
              <label className="label">分类 <span className="text-red-500">*</span></label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">请选择分类</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">封面图片URL <span className="text-coffee-400 text-xs">（选填）</span></label>
              <input
                type="url"
                className="input-field"
                placeholder="https://..."
                value={form.bookCover}
                onChange={(e) => handleChange('bookCover', e.target.value)}
              />
            </div>
          </div>
          {form.bookCover && (
            <div>
              <img
                src={form.bookCover}
                alt="封面预览"
                className="w-24 h-32 object-cover rounded-lg shadow-sm border border-coffee-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Star className="w-4 h-4" />
            新旧程度
          </h3>
          <div className="flex flex-wrap gap-2">
            {BOOK_CONDITIONS.map((cond) => (
              <label
                key={cond.value}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer',
                  form.condition === cond.value
                    ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm'
                    : 'bg-white text-coffee-600 border-coffee-200 hover:border-coffee-400 hover:bg-coffee-50'
                )}
              >
                <input
                  type="radio"
                  name="condition"
                  value={cond.value}
                  checked={form.condition === cond.value}
                  onChange={() => handleChange('condition', cond.value)}
                  className="sr-only"
                />
                {cond.label}
              </label>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            想换的图书
          </h3>
          <div>
            <label className="label">想换的图书类型 <span className="text-coffee-400 text-xs">（可多选）</span></label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleWantCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                    form.wantCategories.includes(cat)
                      ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm'
                      : 'bg-white text-coffee-600 border-coffee-200 hover:border-coffee-400 hover:bg-coffee-50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">想换的具体书名 <span className="text-coffee-400 text-xs">（多个书名用逗号分隔）</span></label>
            <input
              type="text"
              className="input-field"
              placeholder="如：百年孤独，三体，人类简史"
              value={form.wantBookNames}
              onChange={(e) => handleChange('wantBookNames', e.target.value)}
            />
          </div>
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            补充说明
          </h3>
          <textarea
            className="input-field min-h-[100px] resize-y"
            placeholder="补充描述图书状况、交换偏好等..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        <div className="w-full h-px bg-coffee-100" />

        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => navigate('/exchanges')}
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
                <Save className="w-4 h-4" />
                发布挂单
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
