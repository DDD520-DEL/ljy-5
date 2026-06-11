import { useState, useEffect } from 'react'
import { Trophy, BookOpen, MessageSquare, Crown, Award, Medal, Sparkles } from 'lucide-react'
import { starsApi } from '@/lib/api'
import type { MonthlyStarsResult, MonthlyStar } from '../../shared/types'
import { cn } from '@/lib/utils'

const avatarColors = [
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-blue-500',
  'from-purple-400 to-violet-500',
]

function getAvatarColor(nickname: string): string {
  let hash = 0
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function getInitial(nickname: string): string {
  return nickname.charAt(0).toUpperCase()
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return { icon: Crown, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' }
  }
  if (rank === 2) {
    return { icon: Award, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' }
  }
  if (rank === 3) {
    return { icon: Medal, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' }
  }
  return null
}

function StarCard({ star, type }: { star: MonthlyStar; type: 'borrow' | 'review' }) {
  const rankBadge = getRankBadge(star.rank)
  const StatIcon = type === 'borrow' ? BookOpen : MessageSquare
  const statLabel = type === 'borrow' ? '本' : '篇'

  return (
    <div
      className={cn(
        'group relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        star.rank === 1
          ? 'bg-gradient-to-b from-amber-50 to-white border-amber-200 shadow-md'
          : star.rank === 2
            ? 'bg-gradient-to-b from-slate-50 to-white border-slate-200'
            : star.rank === 3
              ? 'bg-gradient-to-b from-orange-50 to-white border-orange-200'
              : 'bg-white border-coffee-100'
      )}
    >
      {rankBadge && (
        <div className={cn('absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md', rankBadge.bg, rankBadge.border, 'border')}>
          <rankBadge.icon className={cn('w-4 h-4', rankBadge.color)} />
        </div>
      )}

      <div className="relative mb-3">
        <div
          className={cn(
            'w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xl font-bold shadow-inner',
            getAvatarColor(star.nickname)
          )}
        >
          {getInitial(star.nickname)}
        </div>
        {star.rank === 1 && (
          <Sparkles className="absolute -top-1 -left-1 w-5 h-5 text-amber-400 fill-amber-400/30" />
        )}
      </div>

      <p className="font-semibold text-coffee-800 text-sm text-center truncate max-w-full">
        {star.nickname}
      </p>

      <div className="flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-coffee-50 text-coffee-600">
        <StatIcon className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">
          {star.count} {statLabel}
        </span>
      </div>

      <div className="mt-2 text-[11px] text-coffee-400 font-medium">
        第 {star.rank} 名
      </div>
    </div>
  )
}

export default function MonthlyStarsWall() {
  const [data, setData] = useState<MonthlyStarsResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStars() {
      try {
        setLoading(true)
        const result = await starsApi.getLatest()
        setData(result)
      } catch (err) {
        console.error('加载月度之星失败:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStars()
  }, [])

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-pulse">
            <div className="w-32 h-8 bg-coffee-100 rounded mx-auto mb-4" />
            <div className="w-48 h-6 bg-coffee-100 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-coffee-100 rounded w-1/3 mb-6 mx-auto" />
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="aspect-square bg-coffee-100 rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!data) {
    return null
  }

  const monthLabel = `${data.year}年${data.month}月`

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-amber-50/50 via-white to-coffee-50/30">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-amber-200 mb-4 shadow-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-700 font-medium">月度荣誉榜</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-coffee-900 mb-3">
            阅读之星展示墙
          </h2>
          <p className="text-coffee-600 max-w-xl mx-auto">
            {monthLabel} · 表彰热爱阅读、积极分享的优秀读者
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-coffee-800">月度借阅之星</h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {data.borrowStars.length > 0 ? (
                data.borrowStars.map((star) => (
                  <StarCard key={star.id} star={star} type="borrow" />
                ))
              ) : (
                <div className="col-span-5 text-center py-8 text-coffee-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无数据</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-coffee-800">月度评论之星</h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {data.reviewStars.length > 0 ? (
                data.reviewStars.map((star) => (
                  <StarCard key={star.id} star={star} type="review" />
                ))
              ) : (
                <div className="col-span-5 text-center py-8 text-coffee-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无数据</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-xs text-coffee-400">
            每月1日自动更新上月榜单 · 数据统计截至 {monthLabel}月末
          </p>
        </div>
      </div>
    </section>
  )
}
