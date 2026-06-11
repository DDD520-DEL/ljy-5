import { useMemo } from 'react'
import type { ReadingCheckInHeatmapData } from '../../shared/types'

interface ReadingHeatmapProps {
  data: ReadingCheckInHeatmapData[]
  months?: number
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

function getLevelColor(duration: number): string {
  if (duration === 0) return 'bg-coffee-50'
  if (duration < 30) return 'bg-emerald-200'
  if (duration < 60) return 'bg-emerald-400'
  if (duration < 120) return 'bg-emerald-500'
  return 'bg-emerald-700'
}

export default function ReadingHeatmap({ data, months = 6 }: ReadingHeatmapProps) {
  const heatmapData = useMemo(() => {
    const dataMap = new Map<string, ReadingCheckInHeatmapData>()
    for (const d of data) {
      dataMap.set(d.date, d)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endDate = new Date(today)
    const startDate = new Date(today)
    startDate.setMonth(startDate.getMonth() - (months - 1))
    startDate.setDate(1)

    const firstDay = startDate.getDay()
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
    const totalCells = Math.ceil((firstDay + totalDays) / 7) * 7

    const cells: Array<{
      date: Date | null
      dateStr: string
      duration: number
      count: number
      isCurrentMonth: boolean
    }> = []

    for (let i = 0; i < firstDay; i++) {
      cells.push({ date: null, dateStr: '', duration: 0, count: 0, isCurrentMonth: false })
    }

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayData = dataMap.get(dateStr)
      cells.push({
        date: currentDate,
        dateStr,
        duration: dayData?.durationMinutes || 0,
        count: dayData?.count || 0,
        isCurrentMonth: currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear(),
      })
    }

    while (cells.length < totalCells) {
      cells.push({ date: null, dateStr: '', duration: 0, count: 0, isCurrentMonth: false })
    }

    const weekCount = cells.length / 7
    const monthLabels: Array<{ name: string; col: number }> = []
    let lastMonth = -1
    for (let col = 0; col < weekCount; col++) {
      const cell = cells[col * 7]
      if (cell.date && cell.date.getDate() <= 7) {
        const month = cell.date.getMonth()
        if (month !== lastMonth) {
          monthLabels.push({ name: MONTH_NAMES[month], col })
          lastMonth = month
        }
      }
    }

    return { cells, weekCount, monthLabels }
  }, [data, months])

  return (
    <div className="p-4 bg-white rounded-xl border border-coffee-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-coffee-800">阅读热力图</h3>
        <div className="flex items-center gap-2 text-xs text-coffee-500">
          <span>少</span>
          <div className="w-3 h-3 rounded-sm bg-coffee-50 border border-coffee-100" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <div className="w-3 h-3 rounded-sm bg-emerald-700" />
          <span>多</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex mb-1 ml-6">
            {heatmapData.monthLabels.map((label, idx) => (
              <div
                key={idx}
                className="text-[10px] text-coffee-500"
                style={{ marginLeft: idx === 0 ? `${label.col * 14}px` : `${(label.col - heatmapData.monthLabels[idx - 1].col) * 14}px` }}
              >
                {label.name}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col gap-1 mr-1">
              {WEEKDAYS.map((day, idx) => (
                <div key={day} className="h-3 text-[10px] text-coffee-400 flex items-center justify-end pr-1" style={{ minWidth: '18px' }}>
                  {idx % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${heatmapData.weekCount}, 12px)` }}>
              {heatmapData.cells.map((cell, idx) => (
                <div
                  key={idx}
                  title={cell.date ? `${cell.dateStr}: ${cell.duration}分钟` : ''}
                  className={`w-3 h-3 rounded-sm ${cell.date ? getLevelColor(cell.duration) : 'bg-transparent'} ${cell.isCurrentMonth && cell.date ? 'ring-1 ring-coffee-300' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
