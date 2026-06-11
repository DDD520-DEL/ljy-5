import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Plus, Book, Grid3X3, List, Eye, MessageSquare, Tag, X, BookmarkPlus, Star } from 'lucide-react'
import { bookApi } from '@/lib/api'
import { sourceTypeLabel, sourceTypeColor, cn } from '@/lib/utils'
import type { Book as BookType, SourceType, TagStat } from '../../shared/types'
import { BookshelfSelector } from '@/components/BookshelfSelector'
import { useReaderStore } from '@/hooks/useReaderStore'

type SourceFilter = 'all' | SourceType
type ViewMode = 'grid' | 'list'

export default function BookList() {
  const [searchParams] = useSearchParams()
  const [books, setBooks] = useState<BookType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [tagStats, setTagStats] = useState<TagStat[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const currentNickname = useReaderStore(s => s.nickname)
  const [selectorBook, setSelectorBook] = useState<BookType | null>(null)

  useEffect(() => {
    loadBooks()
    loadTagStats()
  }, [])

  useEffect(() => {
    const tagParam = searchParams.get('tag')
    if (tagParam) {
      setSelectedTag(tagParam)
    }
  }, [searchParams])

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

  async function loadTagStats() {
    try {
      const stats = await bookApi.tagStats()
      setTagStats(stats)
    } catch (err) {
      console.error(err)
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
      if (selectedTag && (!book.tags || !book.tags.includes(selectedTag))) return false
      if (search) {
        const keyword = search.toLowerCase()
        const matchTitle = book.title.toLowerCase().includes(keyword)
        const matchAuthor = book.author.toLowerCase().includes(keyword)
        const matchTraceId = book.traceId.toLowerCase().includes(keyword)
        if (!matchTitle && !matchAuthor && !matchTraceId) return false
      }
      return true
    })
  }, [books, sourceFilter, categoryFilter, search, selectedTag])

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

      {tagStats.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-coffee-500" />
            <h3 className="text-sm font-medium text-coffee-700">标签云</h3>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-coffee-700 text-white hover:bg-coffee-800 transition-colors"
              >
                {selectedTag}
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {tagStats.map((stat) => {
              const minSize = 0.75
              const maxSize = 1.5
              const maxCount = Math.max(...tagStats.map(s => s.count))
              const ratio = maxCount > 1 ? (stat.count - 1) / (maxCount - 1) : 0
              const size = minSize + ratio * (maxSize - minSize)
              const isSelected = selectedTag === stat.tag
              return (
                <button
                  key={stat.tag}
                  onClick={() => setSelectedTag(isSelected ? null : stat.tag)}
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200 border',
                    isSelected
                      ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm'
                      : 'bg-gradient-to-r from-coffee-50 to-brass-400/5 text-coffee-700 border-coffee-200 hover:border-coffee-400 hover:shadow-sm'
                  )}
                  style={{ fontSize: `${size}rem` }}
                >
                  {stat.tag}
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    isSelected ? 'bg-white/20' : 'bg-coffee-100 text-coffee-500'
                  )}>
                    {stat.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

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
              <BookCardList key={book.id} book={book} onAddBookshelf={() => setSelectorBook(book)} />
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
                <BookCardGrid key={book.id} book={book} onAddBookshelf={() => setSelectorBook(book)} />
              ) : (
                <BookCardList key={book.id} book={book} onAddBookshelf={() => setSelectorBook(book)} />
              )
            )}
          </div>
        </>
      )}

      <BookshelfSelector
        book={selectorBook!}
        nickname={currentNickname}
        open={!!selectorBook}
        onClose={() => setSelectorBook(null)}
      />
    </div>
  )
}

function BookCardGrid({ book, onAddBookshelf }: { book: BookType; onAddBookshelf: () => void }) {
  return (
    <div
      className={cn(
        'card p-4 group',
        'hover:-translate-y-1 hover:shadow-card transition-all duration-300'
      )}
    >
      <Link to={`/books/${book.id}`} className="block">
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
        {book.averageRating != null && book.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-coffee-700">{book.averageRating.toFixed(1)}</span>
            {book.reviewCount != null && (
              <span className="text-xs text-coffee-400">({book.reviewCount})</span>
            )}
          </div>
        )}
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-coffee-50 to-brass-400/10 text-coffee-600 border border-coffee-100">
                {tag}
              </span>
            ))}
            {book.tags.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-coffee-400">+{book.tags.length - 3}</span>
            )}
          </div>
        )}
      </Link>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-coffee-400 bg-coffee-50 px-2 py-1 rounded">
          {book.category}
        </span>
        <div className="flex items-center gap-2">
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
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddBookshelf()
            }}
            className="p-1.5 rounded-lg text-coffee-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="加入书单"
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function BookCardList({ book, onAddBookshelf }: { book: BookType; onAddBookshelf: () => void }) {
  return (
    <div
      className={cn(
        'card p-4 group flex gap-4',
        'hover:shadow-card transition-all duration-300'
      )}
    >
      <Link to={`/books/${book.id}`} className="w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-coffee-100">
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
      </Link>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/books/${book.id}`} className="min-w-0 flex-1">
            <h3 className="font-medium text-coffee-900 truncate group-hover:text-coffee-700 transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-coffee-500 mt-0.5">{book.author}</p>
            {book.averageRating != null && book.averageRating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-coffee-700">{book.averageRating.toFixed(1)}</span>
                {book.reviewCount != null && (
                  <span className="text-xs text-coffee-400">({book.reviewCount})</span>
                )}
              </div>
            )}
          </Link>
          <span className={cn('badge border flex-shrink-0', sourceTypeColor[book.sourceType])}>
            {sourceTypeLabel[book.sourceType]}
          </span>
        </div>
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-coffee-50 to-brass-400/10 text-coffee-600 border border-coffee-100">
                {tag}
              </span>
            ))}
            {book.tags.length > 4 && (
              <span className="text-[10px] px-1 py-0.5 text-coffee-400">+{book.tags.length - 4}</span>
            )}
          </div>
        )}
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
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddBookshelf()
              }}
              className="p-1.5 rounded-lg text-coffee-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="加入书单"
            >
              <BookmarkPlus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
