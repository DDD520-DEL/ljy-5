import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Users,
  Image,
  FileText,
  ChevronDown,
  ChevronRight,
  Archive,
  Filter,
  Clock,
  BookOpen,
} from 'lucide-react'
import { meetupApi } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import type { Meetup } from '../../shared/types'

interface MonthGroup {
  year: number
  month: number
  label: string
  meetups: Meetup[]
}

export default function MeetupArchive() {
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    async function loadYears() {
      try {
        const data = await meetupApi.getArchiveYears()
        setYears(data)
        if (data.length > 0 && !selectedYear) {
          setSelectedYear(data[0])
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadYears()
  }, [])

  useEffect(() => {
    async function loadMeetups() {
      try {
        setLoading(true)
        const data = await meetupApi.list('finished', selectedYear || undefined)
        setMeetups(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadMeetups()
  }, [selectedYear])

  const monthGroups = useMemo(() => {
    const groups: MonthGroup[] = []
    const map = new Map<string, Meetup[]>()

    for (const meetup of meetups) {
      const date = new Date(meetup.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(meetup)
    }

    const monthNames = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月',
    ]

    const keys = [...map.keys()].sort().reverse()
    for (const key of keys) {
      const [yearStr, monthStr] = key.split('-')
      const year = parseInt(yearStr)
      const month = parseInt(monthStr)
      groups.push({
        year,
        month,
        label: `${year}年 ${monthNames[month]}`,
        meetups: map.get(key)!,
      })
    }

    return groups
  }, [meetups])

  useEffect(() => {
    const allKeys = monthGroups.map(g => `${g.year}-${g.month}`)
    setExpandedMonths(new Set(allKeys))
  }, [monthGroups])

  function toggleMonth(key: string) {
    setExpandedMonths(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function expandAll() {
    setExpandedMonths(new Set(monthGroups.map(g => `${g.year}-${g.month}`)))
  }

  function collapseAll() {
    setExpandedMonths(new Set())
  }

  if (loading && meetups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white">
        <div className="container max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-coffee-100 rounded-lg w-1/3" />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-20 bg-coffee-100 rounded-lg" />
              ))}
            </div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-coffee-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-coffee-100">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-coffee-900">墨香书坊</h1>
              <p className="text-[10px] text-coffee-500 -mt-0.5">溯源与读书会</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/meetups"
              className="text-sm text-coffee-600 hover:text-coffee-800 transition-colors"
            >
              返回读书会
            </Link>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-coffee-200 mb-6 shadow-sm">
            <Archive className="w-4 h-4 text-coffee-500" />
            <span className="text-sm text-coffee-700">往期回顾</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-coffee-900 mb-4">
            读书会往期回顾
          </h1>
          <p className="text-coffee-600 max-w-xl mx-auto">
            回顾每一场精彩的读书会，重温那些关于书与人的温暖时光
          </p>
        </div>

        {years.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-coffee-500" />
              <span className="text-sm font-medium text-coffee-600">年份筛选</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    selectedYear === year
                      ? 'bg-coffee-700 text-white shadow-md'
                      : 'bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-50 hover:border-coffee-300'
                  )}
                >
                  {year}年
                </button>
              ))}
            </div>
          </div>
        )}

        {monthGroups.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={expandAll}
              className="text-xs text-coffee-500 hover:text-coffee-700 transition-colors"
            >
              全部展开
            </button>
            <span className="text-coffee-300">|</span>
            <button
              onClick={collapseAll}
              className="text-xs text-coffee-500 hover:text-coffee-700 transition-colors"
            >
              全部折叠
            </button>
            <span className="text-xs text-coffee-400 ml-auto">
              共 {meetups.length} 场活动
            </span>
          </div>
        )}

        {meetups.length === 0 ? (
          <div className="text-center py-20">
            <Archive className="w-16 h-16 text-coffee-200 mx-auto mb-4" />
            <p className="text-coffee-500 font-medium mb-1">暂无往期活动</p>
            <p className="text-coffee-400 text-sm">
              {selectedYear ? `${selectedYear}年还没有已结束的读书会活动` : '还没有任何已结束的读书会活动'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {monthGroups.map(group => {
              const groupKey = `${group.year}-${group.month}`
              const isExpanded = expandedMonths.has(groupKey)

              return (
                <div
                  key={groupKey}
                  className="bg-white rounded-xl border border-coffee-100 shadow-soft overflow-hidden"
                >
                  <button
                    onClick={() => toggleMonth(groupKey)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-coffee-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h2 className="font-serif font-bold text-lg text-coffee-900">
                          {group.label}
                        </h2>
                        <p className="text-xs text-coffee-500">
                          {group.meetups.length} 场活动
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'badge border',
                        isExpanded
                          ? 'bg-coffee-100 text-coffee-600 border-coffee-200'
                          : 'bg-coffee-50 text-coffee-400 border-coffee-100'
                      )}>
                        {group.meetups.length} 场
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-coffee-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-coffee-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-coffee-100">
                      <div className="divide-y divide-coffee-50">
                        {group.meetups.map(meetup => (
                          <ArchiveMeetupCard
                            key={meetup.id}
                            meetup={meetup}
                            onPhotoClick={setSelectedPhoto}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
          <img
            src={selectedPhoto}
            alt="活动合照"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <footer className="py-8 px-4 bg-coffee-900 mt-16">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-brass-400" />
            <span className="font-serif font-bold text-white">墨香书坊</span>
          </div>
          <p className="text-coffee-400 text-xs">
            © 2026 墨香书坊 · 让每一本书都有故事
          </p>
        </div>
      </footer>
    </div>
  )
}

function ArchiveMeetupCard({
  meetup,
  onPhotoClick,
}: {
  meetup: Meetup
  onPhotoClick: (url: string) => void
}) {
  const [showFullNotes, setShowFullNotes] = useState(false)
  const notesPreview = meetup.discussionNotes
    ? meetup.discussionNotes.length > 150
      ? meetup.discussionNotes.slice(0, 150) + '...'
      : meetup.discussionNotes
    : null

  return (
    <Link
      to={`/meetups/${meetup.id}`}
      className="block p-6 hover:bg-coffee-50/30 transition-colors"
    >
      <div className="flex flex-col md:flex-row gap-5">
        {meetup.coverImage && (
          <div className="w-full md:w-48 h-32 md:h-36 flex-shrink-0 rounded-lg overflow-hidden bg-coffee-100">
            <img
              src={meetup.coverImage}
              alt={meetup.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-bold text-lg text-coffee-900 mb-3 group-hover:text-coffee-700">
            {meetup.title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-coffee-600">
              <Clock className="w-4 h-4 text-coffee-400 flex-shrink-0" />
              <span>{formatDate(meetup.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-coffee-600">
              <MapPin className="w-4 h-4 text-coffee-400 flex-shrink-0" />
              <span className="truncate">{meetup.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-coffee-600">
              <Users className="w-4 h-4 text-coffee-400 flex-shrink-0" />
              <span>{meetup.currentParticipants} 人参与</span>
            </div>
          </div>

          {meetup.discussionNotes && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-coffee-400" />
                <span className="text-xs font-medium text-coffee-500">讨论纪要</span>
              </div>
              <p
                className="text-sm text-coffee-600 leading-relaxed"
                onClick={e => {
                  if (meetup.discussionNotes && meetup.discussionNotes.length > 150) {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowFullNotes(!showFullNotes)
                  }
                }}
              >
                {showFullNotes ? meetup.discussionNotes : notesPreview}
                {meetup.discussionNotes && meetup.discussionNotes.length > 150 && (
                  <span className="text-coffee-400 text-xs ml-1 cursor-pointer">
                    {showFullNotes ? '收起' : '展开'}
                  </span>
                )}
              </p>
            </div>
          )}

          {meetup.groupPhotos && meetup.groupPhotos.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Image className="w-3.5 h-3.5 text-coffee-400" />
                <span className="text-xs font-medium text-coffee-500">活动合照</span>
              </div>
              <div className="flex gap-2">
                {meetup.groupPhotos.slice(0, 4).map((photo, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-16 rounded-md overflow-hidden bg-coffee-100 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      onPhotoClick(photo)
                    }}
                  >
                    <img
                      src={photo}
                      alt={`合照 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {meetup.groupPhotos.length > 4 && (
                  <div className="w-16 h-16 rounded-md bg-coffee-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-coffee-500">
                      +{meetup.groupPhotos.length - 4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
