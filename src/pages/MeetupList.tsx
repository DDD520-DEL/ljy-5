import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Plus, Filter, CalendarDays } from 'lucide-react'
import { meetupApi } from '@/lib/api'
import { meetupStatusLabel, meetupStatusColor, formatDate, cn } from '@/lib/utils'
import type { Meetup, MeetupStatus } from '../../shared/types'

type FilterStatus = 'all' | MeetupStatus

export default function MeetupList() {
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  useEffect(() => {
    loadMeetups()
  }, [filterStatus])

  async function loadMeetups() {
    try {
      setLoading(true)
      const data = await meetupApi.list(filterStatus === 'all' ? undefined : filterStatus)
      setMeetups(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'upcoming', label: '即将开始' },
    { value: 'ongoing', label: '进行中' },
    { value: 'finished', label: '已结束' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-white rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">读书会活动</h1>
          <p className="text-coffee-500 mt-1">发现并参与精彩的读书分享活动</p>
        </div>
        <Link to="/meetups/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          发起活动
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-coffee-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">筛选：</span>
        </div>
        <div className="flex p-1 rounded-lg bg-coffee-50 flex-wrap gap-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                filterStatus === option.value
                  ? 'bg-white text-coffee-800 shadow-sm'
                  : 'text-coffee-500 hover:text-coffee-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {meetups.length === 0 ? (
        <div className="card p-16 text-center">
          <CalendarDays className="w-16 h-16 text-coffee-300 mx-auto mb-4" />
          <p className="text-coffee-600 font-medium mb-1">暂无活动</p>
          <p className="text-coffee-400 text-sm mb-4">
            {filterStatus === 'all' ? '还没有任何读书会活动' : `当前状态下没有活动`}
          </p>
          <Link to="/meetups/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            发起第一个活动
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetups.map((meetup) => {
            const progress = Math.min(
              (meetup.currentParticipants / meetup.maxParticipants) * 100,
              100
            )

            return (
              <Link
                key={meetup.id}
                to={`/meetups/${meetup.id}`}
                className={cn(
                  'card overflow-hidden group cursor-pointer',
                  'hover:scale-[1.03] hover:shadow-xl transition-all duration-300'
                )}
              >
                <div className="relative h-48 bg-gradient-to-br from-coffee-100 to-coffee-200 overflow-hidden">
                  {meetup.coverImage ? (
                    <img
                      src={meetup.coverImage}
                      alt={meetup.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CalendarDays className="w-16 h-16 text-coffee-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={cn('badge border', meetupStatusColor[meetup.status])}>
                      {meetupStatusLabel[meetup.status]}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-5 space-y-4">
                  <h3 className="font-serif font-bold text-lg text-coffee-900 line-clamp-1 group-hover:text-coffee-700 transition-colors">
                    {meetup.title}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-coffee-600">
                      <Calendar className="w-4 h-4 text-coffee-400 flex-shrink-0" />
                      <span>{formatDate(meetup.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-coffee-600">
                      <MapPin className="w-4 h-4 text-coffee-400 flex-shrink-0" />
                      <span className="line-clamp-1">{meetup.location}</span>
                    </div>
                  </div>

                  <p className="text-sm text-coffee-500 line-clamp-2 min-h-[2.5rem]">
                    {meetup.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-coffee-600">
                        <Users className="w-4 h-4 text-coffee-400" />
                        <span>报名人数</span>
                      </div>
                      <span className="font-medium text-coffee-800">
                        {meetup.currentParticipants}/{meetup.maxParticipants}
                      </span>
                    </div>
                    <div className="h-2 bg-coffee-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          'bg-gradient-to-r from-coffee-500 via-coffee-600 to-brass-500'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
