import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, Book, Grid3X3, List, Eye, MessageSquare } from 'lucide-react'
import { bookApi } from '@/lib/api'
import { sourceTypeLabel, sourceTypeColor, cn } from '@/lib/utils'
import type { Book as BookType, SourceType } from '../../shared/types'

type SourceFilter = 'all' | SourceType
type ViewMode = 'grid' | 'list'

export default function BookList() {
  const [books, setBooks] = useState<BookType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    loadBooks()
  }, [])

  async function loadBooks() {
    try {
      setLoading(true)
      const data = await bookApi.list()
      setBooks(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const set = new Set(books.map((b) => b.category))
    return ['all', ...Array.from(set)]
  }, [books])

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      if (sourceFilter !== 'all' && book.sourceType !== sourceFilter) return false
      if (categoryFilter !== 'all' && book.category !== categoryFilter) return false
      if (search) {
        const keyword = search.toLowerCase()
        const matchTitle = book.title.toLowerCase().includes(keyword)
        const matchAuthor = book.author.toLowerCase().includes(keyword)
        const matchTraceId = book.traceId.toLowerCase().includes(keyword)
        if (!matchTitle && !matchAuthor && !matchTraceId) return false
      }
      return true
    })
  }, [books, sourceFilter, categoryFilter, search])

  const sourceOptions: { value: SourceFilter; label: string }[] = [
    { value: 'all', label: '全部来源' },
    { value: 'donation', label: '个人捐赠' },
    { value: 'direct', label: '出版社直供' },
    { value: 'secondhand', label: '二手回收' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-12 bg-white rounded-lg flex-1 animate-pulse" />
          <div className="h-12 bg-white rounded-lg w-full md:w-40 animate-pulse" />
          <div className="h-12 bg-white rounded-lg w-full md:w-40 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="aspect-[3/4] bg-coffee-100 rounded-lg mb-4" />
              <div className="h-5 bg-coffee-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-coffee-100 rounded w-1/2 mb-3" />
              <div className="flex gap-2">
                <div className="h-5 bg-coffee-100 rounded-full w-16" />
                <div className="h-5 bg-coffee-100 rounded-full w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">图书库存</h1>
          <p className="text-coffee-500 mt-1">共 {filteredBooks.length} 本图书</p>
        </div>
        <Link to="/books/new" className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          入库新书
        </Link>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索书名、作者或溯源ID..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                className="input-field pl-9 pr-8 appearance-none cursor-pointer"
              >
                {sourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field pl-9 pr-8 appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? '全部分类' : cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:flex p-1 rounded-lg bg-coffee-50">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-all',
                  viewMode === 'grid'
                    ? 'bg-white text-coffee-800 shadow-sm'
                    : 'text-coffee-500 hover:text-coffee-700'
                )}
                title="网格视图"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-all',
                  viewMode === 'list'
                    ? 'bg-white text-coffee-800 shadow-sm'
                    : 'text-coffee-500 hover:text-coffee-700'
                )}
                title="列表视图"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sourceOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSourceFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                sourceFilter === opt.value
                  ? 'bg-coffee-700 text-white border-coffee-700'
                  : 'bg-white text-coffee-600 border-coffee-200 hover:border-coffee-400'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-coffee-50 flex items-center justify-center mx-auto mb-4">
            <Book className="w-8 h-8 text-coffee-400" />
          </div>
          <p className="text-coffee-600 font-medium">没有找到匹配的图书</p>
          <p className="text-coffee-400 text-sm mt-1">试试调整筛选条件或搜索关键词</p>
        </div>
      ) : (
        <>
          <div className="hidden md:hidden">
            {filteredBooks.map((book) => (
              <BookCardList key={book.id} book={book} />
            ))}
          </div>
          <div className={cn(
            'gap-4',
            viewMode === 'grid'
              ? 'hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'hidden sm:flex flex-col'
          )}>
            {filteredBooks.map((book) =>
              viewMode === 'grid' ? (
                <BookCardGrid key={book.id} book={book} />
              ) : (
                <BookCardList key={book.id} book={book} />
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}

function BookCardGrid({ book }: { book: BookType }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className={cn(
        'card p-4 group cursor-pointer',
        'hover:-translate-y-1 hover:shadow-card transition-all duration-300'
      )}
    >
      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-coffee-100 mb-4 relative">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-coffee-300">
            <Book className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={cn('badge border', sourceTypeColor[book.sourceType])}>
            {sourceTypeLabel[book.sourceType]}
          </span>
        </div>
      </div>
      <h3 className="font-medium text-coffee-900 truncate group-hover:text-coffee-700 transition-colors line-clamp-1">
        {book.title}
      </h3>
      <p className="text-sm text-coffee-500 mt-0.5 truncate">{book.author}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-coffee-400 bg-coffee-50 px-2 py-1 rounded">
          {book.category}
        </span>
        <div className="flex items-center gap-3 text-xs text-coffee-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {book.borrowCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {book.discussCount}
          </span>
        </div>
      </div>
    </Link>
  )
}

function BookCardList({ book }: { book: BookType }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className={cn(
        'card p-4 group cursor-pointer flex gap-4',
        'hover:shadow-card transition-all duration-300'
      )}
    >
      <div className="w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-coffee-100">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-coffee-300">
            <Book className="w-8 h-8" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-coffee-900 truncate group-hover:text-coffee-700 transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-coffee-500 mt-0.5">{book.author}</p>
          </div>
          <span className={cn('badge border flex-shrink-0', sourceTypeColor[book.sourceType])}>
            {sourceTypeLabel[book.sourceType]}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-coffee-400 bg-coffee-50 px-2 py-1 rounded">
            {book.category}
          </span>
          <div className="flex items-center gap-3 text-xs text-coffee-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {book.borrowCount} 次借阅
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {book.discussCount} 条讨论
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
