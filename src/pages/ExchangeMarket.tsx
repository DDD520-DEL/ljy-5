import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, Book, ArrowLeftRight, User } from 'lucide-react'
import { exchangeApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ExchangeListing, ExchangeListingStatus, BookCondition } from '../../shared/types'
import { BOOK_CONDITIONS } from '../../shared/types'

type StatusFilter = 'all' | ExchangeListingStatus

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '在架' },
  { value: 'exchanged', label: '已交换' },
  { value: 'cancelled', label: '已取消' },
]

const STATUS_BADGE: Record<ExchangeListingStatus, { label: string; color: string }> = {
  active: { label: '在架', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  exchanged: { label: '已交换', color: 'bg-coffee-100 text-coffee-600 border-coffee-200' },
  cancelled: { label: '已取消', color: 'bg-red-50 text-red-700 border-red-200' },
}

function getConditionColor(condition: BookCondition): string {
  return BOOK_CONDITIONS.find((c) => c.value === condition)?.color ?? 'bg-coffee-100 text-coffee-700 border-coffee-200'
}

export default function ExchangeMarket() {
  const [listings, setListings] = useState<ExchangeListing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    loadListings()
  }, [])

  async function loadListings() {
    try {
      setLoading(true)
      const data = await exchangeApi.list()
      setListings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const set = new Set(listings.map((l) => l.category))
    return ['all', ...Array.from(set)]
  }, [listings])

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (statusFilter !== 'all' && listing.status !== statusFilter) return false
      if (categoryFilter !== 'all' && listing.category !== categoryFilter) return false
      if (conditionFilter !== 'all' && listing.condition !== conditionFilter) return false
      if (search) {
        const keyword = search.toLowerCase()
        const matchTitle = listing.bookTitle.toLowerCase().includes(keyword)
        const matchAuthor = listing.bookAuthor.toLowerCase().includes(keyword)
        const matchOwner = listing.owner.toLowerCase().includes(keyword)
        const matchWanted = listing.wantBookNames.some((n) => n.toLowerCase().includes(keyword))
        const matchWantCat = listing.wantCategories.some((c) => c.toLowerCase().includes(keyword))
        if (!matchTitle && !matchAuthor && !matchOwner && !matchWanted && !matchWantCat) return false
      }
      return true
    })
  }, [listings, statusFilter, categoryFilter, conditionFilter, search])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-9 bg-white rounded-lg w-48 animate-pulse" />
            <div className="h-5 bg-white rounded-lg w-32 animate-pulse" />
          </div>
          <div className="h-10 bg-white rounded-lg w-32 animate-pulse" />
        </div>
        <div className="card p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="h-10 bg-coffee-100 rounded-lg flex-1 animate-pulse" />
            <div className="h-10 bg-coffee-100 rounded-lg w-36 animate-pulse" />
            <div className="h-10 bg-coffee-100 rounded-lg w-36 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
          <h1 className="page-title">交换市场</h1>
          <p className="text-coffee-500 mt-1">发现心仪的图书，以书换书</p>
        </div>
        <Link to="/exchanges/new" className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          挂出图书
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
              placeholder="搜索书名、作者、持有人或想换的书..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
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
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="input-field pl-9 pr-8 appearance-none cursor-pointer"
              >
                <option value="all">全部品相</option>
                {BOOK_CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                statusFilter === opt.value
                  ? 'bg-coffee-700 text-white border-coffee-700'
                  : 'bg-white text-coffee-600 border-coffee-200 hover:border-coffee-400'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-coffee-50 flex items-center justify-center mx-auto mb-4">
            <ArrowLeftRight className="w-8 h-8 text-coffee-400" />
          </div>
          <p className="text-coffee-600 font-medium">没有找到匹配的交换图书</p>
          <p className="text-coffee-400 text-sm mt-1">试试调整筛选条件或搜索关键词</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}

function ListingCard({ listing }: { listing: ExchangeListing }) {
  const statusInfo = STATUS_BADGE[listing.status]

  return (
    <Link
      to={`/exchanges/${listing.id}`}
      className={cn(
        'card p-4 group cursor-pointer',
        'hover:-translate-y-1 hover:shadow-card transition-all duration-300'
      )}
    >
      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-coffee-100 mb-4 relative">
        {listing.bookCover ? (
          <img
            src={listing.bookCover}
            alt={listing.bookTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-coffee-300">
            <Book className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={cn('badge border', getConditionColor(listing.condition))}>
            {listing.condition}
          </span>
        </div>
        <div className="absolute top-2 left-2">
          <span className={cn('badge border', statusInfo.color)}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <h3 className="font-medium text-coffee-900 truncate group-hover:text-coffee-700 transition-colors line-clamp-1">
        {listing.bookTitle}
      </h3>
      <p className="text-sm text-coffee-500 mt-0.5 truncate">{listing.bookAuthor}</p>

      <div className="flex items-center gap-1.5 mt-2 text-sm text-coffee-600">
        <User className="w-3.5 h-3.5 text-coffee-400" />
        <span className="truncate">{listing.owner}</span>
      </div>

      {(listing.wantCategories.length > 0 || listing.wantBookNames.length > 0) && (
        <div className="mt-3 pt-3 border-t border-coffee-100">
          <div className="flex items-center gap-1.5 text-xs text-coffee-500 mb-2">
            <ArrowLeftRight className="w-3 h-3" />
            <span>想换</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {listing.wantCategories.map((cat) => (
              <span key={cat} className="badge bg-coffee-50 text-coffee-600 border border-coffee-200">
                {cat}
              </span>
            ))}
            {listing.wantBookNames.map((name) => (
              <span key={name} className="badge bg-brass-50 text-brass-700 border border-brass-200">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {listing.description && (
        <p className="text-sm text-coffee-400 mt-3 line-clamp-2">
          {listing.description}
        </p>
      )}
    </Link>
  )
}
