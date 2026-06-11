import { Star } from 'lucide-react'
import type { RatingStats } from '../../shared/types'
import { cn } from '@/lib/utils'

export function RatingDistribution({ stats }: { stats: RatingStats }) {
  const { distribution, average, totalCount } = stats
  const maxCount = Math.max(...Object.values(distribution), 1)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-4xl font-serif font-bold text-coffee-800">{average > 0 ? average.toFixed(1) : '-'}</p>
          <div className="flex items-center gap-0.5 mt-1 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-4 h-4',
                  average >= star
                    ? 'text-amber-400 fill-amber-400'
                    : average >= star - 0.5
                      ? 'text-amber-400 fill-amber-400/50'
                      : 'text-coffee-200'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-coffee-500 mt-1">{totalCount} 条评价</p>
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0
            const percent = maxCount > 0 ? (count / maxCount) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-coffee-600 w-8 text-right flex items-center justify-end gap-0.5">
                  {star}
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 h-4 bg-coffee-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs text-coffee-500 w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
