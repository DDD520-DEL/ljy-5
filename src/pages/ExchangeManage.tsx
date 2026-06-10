import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ArrowLeftRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
} from 'lucide-react'
import { exchangeApi } from '@/lib/api'
import { formatDateTime, cn } from '@/lib/utils'
import type {
  ExchangeListing,
  ExchangeRequest,
  ExchangeRequestStatus,
  ExchangeListingWithRequests,
} from '../../shared/types'
import { BOOK_CONDITIONS } from '../../shared/types'

type TabKey = 'pending' | 'completed' | 'all'

const statusLabel: Record<ExchangeRequestStatus, string> = {
  pending: '待处理',
  accepted: '已接受',
  rejected: '已拒绝',
  completed: '已完成',
}

const statusColor: Record<ExchangeRequestStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-blue-100 text-blue-700 border-blue-200',
  rejected: 'bg-gray-100 text-gray-600 border-gray-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const listingStatusLabel: Record<ExchangeListing['status'], string> = {
  active: '进行中',
  exchanged: '已交换',
  cancelled: '已取消',
}

const listingStatusColor: Record<ExchangeListing['status'], string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  exchanged: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
}

function getConditionColor(condition: string): string {
  return BOOK_CONDITIONS.find(c => c.value === condition)?.color ?? 'bg-gray-100 text-gray-700 border-gray-200'
}

export default function ExchangeManage() {
  const [listings, setListings] = useState<ExchangeListingWithRequests[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('pending')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [activeListings, exchangedListings] = await Promise.all([
        exchangeApi.list({ status: 'active' }),
        exchangeApi.list({ status: 'exchanged' }),
      ])
      const allListings = [...activeListings, ...exchangedListings]
      const withRequests = await Promise.all(
        allListings.map(async (listing) => {
          try {
            const detail = await exchangeApi.get(listing.id)
            return detail
          } catch {
            return { ...listing, requests: [], requestCount: 0 } as ExchangeListingWithRequests
          }
        })
      )
      setListings(withRequests)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(requestId: number) {
    if (!confirm('确定接受此交换请求吗？')) return
    try {
      setActionLoading(requestId)
      await exchangeApi.acceptRequest(requestId)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(requestId: number) {
    if (!confirm('确定拒绝此交换请求吗？')) return
    try {
      setActionLoading(requestId)
      await exchangeApi.rejectRequest(requestId)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleComplete(requestId: number) {
    if (!confirm('确认完成交换？确认后双方将获得积分奖励。')) return
    try {
      setActionLoading(requestId)
      const result = await exchangeApi.completeRequest(requestId)
      const ownerPts = result.ownerPointsResult?.log.points ?? 10
      const requesterPts = result.requesterPointsResult?.log.points ?? 10
      alert(`交换完成！${result.listing.owner} 获得 ${ownerPts} 积分，${result.request.requester} 获得 ${requesterPts} 积分`)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredListings = listings.filter((listing) => {
    if (activeTab === 'pending') {
      return listing.requests.some(r => r.status === 'pending' || r.status === 'accepted')
    }
    if (activeTab === 'completed') {
      return listing.requests.some(r => r.status === 'completed')
    }
    return true
  })

  const pendingCount = listings.filter(l => l.requests.some(r => r.status === 'pending' || r.status === 'accepted')).length
  const completedCount = listings.filter(l => l.requests.some(r => r.status === 'completed')).length

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'pending', label: '待处理', count: pendingCount },
    { key: 'completed', label: '已完成', count: completedCount },
    { key: 'all', label: '全部', count: listings.length },
  ]

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">交换管理</h1>
          <p className="text-coffee-500 mt-1">审核交换请求、接受或拒绝交换，确认完成交换</p>
        </div>
        <button
          onClick={loadData}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-coffee-100 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-all',
              activeTab === tab.key
                ? 'border-coffee-700 text-coffee-900'
                : 'border-transparent text-coffee-400 hover:text-coffee-600'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
              activeTab === tab.key
                ? 'bg-coffee-700 text-white'
                : 'bg-coffee-100 text-coffee-500'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredListings.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-16 h-16 text-coffee-200 mx-auto mb-4" />
          <p className="text-coffee-400 font-medium">暂无交换记录</p>
          <p className="text-coffee-300 text-sm mt-1">当读者提交交换请求时，记录将显示在这里</p>
        </div>
      ) : (
        filteredListings.map((listing) => (
          <div key={listing.id} className="card p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-coffee-100 flex-shrink-0">
                {listing.bookCover ? (
                  <img src={listing.bookCover} alt={listing.bookTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-coffee-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-semibold text-coffee-900 truncate">{listing.bookTitle}</h3>
                <p className="text-sm text-coffee-500">{listing.bookAuthor}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-coffee-400">所有者：{listing.owner}</span>
                  <span className="badge border text-xs bg-coffee-50 text-coffee-600 border-coffee-200">
                    {listing.condition}
                  </span>
                </div>
              </div>
              <span className={cn('badge border text-xs', listingStatusColor[listing.status])}>
                {listingStatusLabel[listing.status]}
              </span>
            </div>

            {listing.requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-coffee-100">
                      <th className="text-left py-2 px-3 text-coffee-500 font-medium">请求人</th>
                      <th className="text-left py-2 px-3 text-coffee-500 font-medium">提供图书</th>
                      <th className="text-left py-2 px-3 text-coffee-500 font-medium">新旧程度</th>
                      <th className="text-left py-2 px-3 text-coffee-500 font-medium">留言</th>
                      <th className="text-left py-2 px-3 text-coffee-500 font-medium">状态</th>
                      <th className="text-left py-2 px-3 text-coffee-500 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listing.requests.map((req) => (
                      <tr key={req.id} className="border-b border-coffee-50 last:border-0 hover:bg-coffee-50/30 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-medium text-coffee-800">{req.requester}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <p className="text-coffee-800">{req.offeredBookTitle}</p>
                            <p className="text-xs text-coffee-400">{req.offeredBookAuthor}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={cn('badge border text-xs', getConditionColor(req.offeredBookCondition))}>
                            {req.offeredBookCondition}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-coffee-600 text-xs max-w-[200px] truncate block">
                            {req.message || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={cn('badge border text-xs', statusColor[req.status])}>
                            {statusLabel[req.status]}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {req.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAccept(req.id)}
                                  disabled={actionLoading === req.id}
                                  className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
                                  接受
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  disabled={actionLoading === req.id}
                                  className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1 inline" />
                                  拒绝
                                </button>
                              </>
                            )}
                            {req.status === 'accepted' && (
                              <button
                                onClick={() => handleComplete(req.id)}
                                disabled={actionLoading === req.id}
                                className="btn-primary text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
                                确认完成交换
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-coffee-400 text-sm">
                暂无交换请求
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
