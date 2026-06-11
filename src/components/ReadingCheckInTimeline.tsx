import { BookOpen, Clock, PenLine, Book } from 'lucide-react'
import type { ReadingCheckIn } from '../../shared/types'
import { cn } from '@/lib/utils'

interface ReadingCheckInTimelineProps {
  checkIns: ReadingCheckIn[]
}

export default function ReadingCheckInTimeline({ checkIns }: ReadingCheckInTimelineProps) {
  if (checkIns.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
        <p className="text-coffee-400">暂无打卡记录</p>
        <p className="text-xs text-coffee-300 mt-1">去首页开启你的第一次阅读打卡吧</p>
      </div>
    )
  }

  const grouped = new Map<string, ReadingCheckIn[]>()
  for (const checkIn of checkIns) {
    const date = checkIn.checkInDate
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)!.push(checkIn)
  }

  const sortedDates = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a))

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)

    if (target.getTime() === today.getTime()) return '今天'
    if (target.getTime() === yesterday.getTime()) return '昨天'

    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date, dateIdx) => {
        const dayCheckIns = grouped.get(date)!
        const totalMinutes = dayCheckIns.reduce((sum, c) => sum + c.durationMinutes, 0)
        return (
          <div key={date} className="relative pl-8">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-coffee-100" />
            <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 -translate-x-[5px]" />

            <div className="mb-3 flex items-center gap-3">
              <h4 className="font-bold text-coffee-800">{formatDate(date)}</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                <Clock className="w-3 h-3" />
                {formatDuration(totalMinutes)}
              </span>
              {dayCheckIns.length > 1 && (
                <span className="text-xs text-coffee-400">{dayCheckIns.length}次打卡</span>
              )}
            </div>

            <div className="space-y-3">
              {dayCheckIns.map((checkIn, idx) => (
                <div
                  key={checkIn.id}
                  className={cn(
                    'p-4 rounded-xl bg-white border border-coffee-100 hover:border-coffee-200 transition-colors',
                    idx === dayCheckIns.length - 1 && dateIdx === sortedDates.length - 1 ? '' : ''
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-16 rounded-md overflow-hidden bg-coffee-100 flex-shrink-0 shadow-sm">
                      {checkIn.bookCover ? (
                        <img src={checkIn.bookCover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-coffee-400">
                          <Book className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h5 className="font-semibold text-coffee-800 truncate">{checkIn.bookTitle}</h5>
                          {checkIn.bookAuthor && (
                            <p className="text-xs text-coffee-500">{checkIn.bookAuthor}</p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-coffee-50 text-coffee-600 text-xs flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatDuration(checkIn.durationMinutes)}
                        </span>
                      </div>
                      {checkIn.thoughts && (
                        <p className="text-sm text-coffee-600 leading-relaxed mt-2 flex items-start gap-1.5">
                          <PenLine className="w-3.5 h-3.5 text-coffee-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-3">{checkIn.thoughts}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
