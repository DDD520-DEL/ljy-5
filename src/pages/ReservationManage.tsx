import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ChevronUp,
  ChevronDown,
  XCircle,
  Users,
  Bell,
  Clock,
  RefreshCw,
  BookmarkPlus,
} from 'lucide-react'
import { reservationApi } from '@/lib/api'
import { formatDateTime, cn } from '@/lib/utils'
import type { Book, Reservation, ReservationStatus } from '../../shared/types'

interface ReservationWithBook {
  reservation: Reservation
  book: Book
}

const statusLabel: Record<ReservationStatus, string> = {
  waiting: '等待中',
  notified: '已通知',
  cancelled: '已取消',
  fulfilled: '已完成',
}

const statusColor: Record<ReservationStatus, string> = {
  waiting: 'bg-amber-100 text-amber-700 border-amber-200',
  notified: 'bg-sky-100 text-sky-700 border-sky-200',
  cancelled: 'bg-coffee-100 text-coffee-500 border-coffee-200',
  fulfilled: 'bg-forest-500/10 text-forest-600 border-forest-500/20',
}

export default function ReservationManage() {
  const [data, setData] = useState<ReservationWithBook[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const result = await reservationApi.listAll()
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(reservationId: number) {
    if (!confirm('确定取消此预约吗？')) return
    try {
      setActionLoading(reservationId)
      await reservationApi.cancel(reservationId)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReorder(reservationId: number, direction: 'up' | 'down') {
    try {
      setActionLoading(reservationId)
      await reservationApi.reorder(reservationId, direction)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  const bookGroups = data.reduce<Record<number, { book: Book; reservations: Reservation[] }>>((acc, item) => {
    if (!acc[item.book.id]) {
      acc[item.book.id] = { book: item.book, reservations: [] }
    }
    acc[item.book.id].reservations.push(item.reservation)
    return acc
  }, {})

  const filteredGroups = selectedBookId
    ? { [selectedBookId]: bookGroups[selectedBookId] }
    : bookGroups

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-white rounded-lg w-48 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6">
            <div className="h-6 bg-coffee-100 rounded w-1/3 mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="h-16 bg-coffee-50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const totalReservations = data.length
  const waitingCount = data.filter(d => d.reservation.status === 'waiting').length
  const notifiedCount = data.filter(d => d.reservation.status === 'notified').length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">预约排队管理</h1>
          <p className="text-coffee-500 mt-1">管理图书预约队列，调整顺序或取消预约</p>
        </div>
        <button
          onClick={loadData}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <BookmarkPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-coffee-900">{totalReservations}</p>
              <p className="text-sm text-coffee-500">总预约数</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-coffee-900">{waitingCount}</p>
              <p className="text-sm text-coffee-500">等待中</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-coffee-900">{notifiedCount}</p>
              <p className="text-sm text-coffee-500">已通知</p>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(bookGroups).length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedBookId(null)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              selectedBookId === null
                ? 'bg-coffee-700 text-white'
                : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'
            )}
          >
            全部图书
          </button>
          {Object.values(bookGroups).map(({ book }) => (
            <button
              key={book.id}
              onClick={() => setSelectedBookId(selectedBookId === book.id ? null : book.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                selectedBookId === book.id
                  ? 'bg-coffee-700 text-white'
                  : 'bg-coffee-50 text-coffee-600 hover:bg-coffee-100'
              )}
            >
              {book.title}
              <span className="ml-1 text-xs opacity-75">({bookGroups[book.id].reservations.length})</span>
            </button>
          ))}
        </div>
      )}

      {Object.keys(filteredGroups).length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-16 h-16 text-coffee-200 mx-auto mb-4" />
          <p className="text-coffee-400 font-medium">暂无预约记录</p>
          <p className="text-coffee-300 text-sm mt-1">当读者预约已被借出的图书时，预约记录将显示在这里</p>
        </div>
      ) : (
        Object.values(filteredGroups).map(({ book, reservations }) => (
          <div key={book.id} className="card p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-coffee-100 flex-shrink-0">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-coffee-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/books/${book.id}`} className="font-serif font-semibold text-coffee-900 hover:text-coffee-700 transition-colors">
                  {book.title}
                </Link>
                <p className="text-sm text-coffee-500">{book.author}</p>
              </div>
              <span className="badge bg-amber-100 text-amber-600 border border-amber-200">
                {reservations.length} 人排队
              </span>
            </div>

            <div className="space-y-3">
              {reservations
                .sort((a, b) => a.position - b.position)
                .map((res, index) => (
                <div
                  key={res.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
                    res.status === 'notified'
                      ? 'bg-sky-50/50 border-sky-200'
                      : 'bg-coffee-50/30 border-coffee-100 hover:border-coffee-200'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg',
                    res.status === 'notified'
                      ? 'bg-sky-500 text-white'
                      : 'bg-coffee-200 text-coffee-700'
                  )}>
                    {res.position}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-coffee-800">{res.nickname}</p>
                      <span className={cn('badge border text-xs', statusColor[res.status])}>
                        {res.status === 'notified' && <Bell className="w-3 h-3 mr-1" />}
                        {statusLabel[res.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-coffee-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(res.createdAt)}
                      </span>
                      {res.contact && (
                        <span>联系方式：{res.contact}</span>
                      )}
                      {res.notifiedAt && (
                        <span className="text-sky-500">通知时间：{formatDateTime(res.notifiedAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleReorder(res.id, 'up')}
                      disabled={actionLoading === res.id || index === 0}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                        index === 0 || actionLoading === res.id
                          ? 'text-coffee-200 cursor-not-allowed'
                          : 'text-coffee-500 hover:bg-coffee-100 hover:text-coffee-700'
                      )}
                      title="上移"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReorder(res.id, 'down')}
                      disabled={actionLoading === res.id || index === reservations.length - 1}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                        index === reservations.length - 1 || actionLoading === res.id
                          ? 'text-coffee-200 cursor-not-allowed'
                          : 'text-coffee-500 hover:bg-coffee-100 hover:text-coffee-700'
                      )}
                      title="下移"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel(res.id)}
                      disabled={actionLoading === res.id}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                        actionLoading === res.id
                          ? 'text-coffee-200 cursor-not-allowed'
                          : 'text-red-400 hover:bg-red-50 hover:text-red-600'
                      )}
                      title="取消预约"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
