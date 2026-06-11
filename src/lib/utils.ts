import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { SourceType, MeetupStatus, ReaderLevel, PointsActionType, DonationReviewStatus, NoteVisibility, TraceLog, VotingStatus } from '../../shared/types'
import { READER_LEVELS, POINTS_ACTION } from '../../shared/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTimeInput(dateStr: string): string {
  const date = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const sourceTypeLabel: Record<SourceType, string> = {
  donation: '个人捐赠',
  direct: '出版社直供',
  secondhand: '二手回收',
}

export const sourceTypeColor: Record<SourceType, string> = {
  donation: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  direct: 'bg-sky-50 text-sky-700 border-sky-200',
  secondhand: 'bg-amber-50 text-amber-700 border-amber-200',
}

export const traceActionLabel: Record<TraceLog['action'], string> = {
  '入库': '入库',
  '借出': '借出',
  '归还': '归还',
  '捐赠': '捐赠',
  '转让': '转让',
  '催还': '催还',
}

export const traceActionColor: Record<TraceLog['action'], string> = {
  '入库': 'bg-sky-100 text-sky-700 border-sky-200',
  '借出': 'bg-coffee-100 text-coffee-700 border-coffee-200',
  '归还': 'bg-forest-100 text-forest-700 border-forest-200',
  '捐赠': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '转让': 'bg-purple-100 text-purple-700 border-purple-200',
  '催还': 'bg-red-100 text-red-700 border-red-200',
}

export function calculateDaysRemaining(dueDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffTime = due.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const meetupStatusLabel: Record<MeetupStatus, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  finished: '已结束',
}

export const meetupStatusColor: Record<MeetupStatus, string> = {
  upcoming: 'bg-brass-400/10 text-brass-500 border-brass-400/30',
  ongoing: 'bg-forest-500/10 text-forest-500 border-forest-500/30',
  finished: 'bg-coffee-100 text-coffee-600 border-coffee-200',
}

export function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

export const readerLevelLabel: Record<ReaderLevel, string> = {
  bookworm: READER_LEVELS.bookworm.name,
  booklover: READER_LEVELS.booklover.name,
  bookmaniac: READER_LEVELS.bookmaniac.name,
  bookcollector: READER_LEVELS.bookcollector.name,
}

export const readerLevelColor: Record<ReaderLevel, string> = {
  bookworm: READER_LEVELS.bookworm.color,
  booklover: READER_LEVELS.booklover.color,
  bookmaniac: READER_LEVELS.bookmaniac.color,
  bookcollector: READER_LEVELS.bookcollector.color,
}

export const readerLevelMinPoints: Record<ReaderLevel, number> = {
  bookworm: READER_LEVELS.bookworm.minPoints,
  booklover: READER_LEVELS.booklover.minPoints,
  bookmaniac: READER_LEVELS.bookmaniac.minPoints,
  bookcollector: READER_LEVELS.bookcollector.minPoints,
}

export const pointsActionLabel: Record<PointsActionType, string> = {
  borrow: POINTS_ACTION.borrow.name,
  review: POINTS_ACTION.review.name,
  meetup: POINTS_ACTION.meetup.name,
  donation: POINTS_ACTION.donation.name,
  exchange: POINTS_ACTION.exchange.name,
}

export const pointsActionPoints: Record<PointsActionType, number> = {
  borrow: POINTS_ACTION.borrow.points,
  review: POINTS_ACTION.review.points,
  meetup: POINTS_ACTION.meetup.points,
  donation: POINTS_ACTION.donation.points,
  exchange: POINTS_ACTION.exchange.points,
}

export const pointsActionColor: Record<PointsActionType, string> = {
  borrow: 'bg-sky-100 text-sky-700',
  review: 'bg-emerald-100 text-emerald-700',
  meetup: 'bg-purple-100 text-purple-700',
  donation: 'bg-amber-100 text-amber-700',
  exchange: 'bg-teal-100 text-teal-700',
}

export const donationReviewStatusLabel: Record<DonationReviewStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
}

export const donationReviewStatusColor: Record<DonationReviewStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export function getNextLevel(points: number): { level: ReaderLevel; minPoints: number } | null {
  const levels = Object.entries(READER_LEVELS) as [ReaderLevel, typeof READER_LEVELS[ReaderLevel]][]
  levels.sort((a, b) => a[1].minPoints - b[1].minPoints)
  for (const [level, config] of levels) {
    if (points < config.minPoints) {
      return { level, minPoints: config.minPoints }
    }
  }
  return null
}

export function getLevelProgress(points: number): { currentLevel: ReaderLevel; nextLevel: ReaderLevel | null; progress: number; minPoints: number; maxPoints: number } {
  const levels = Object.entries(READER_LEVELS) as [ReaderLevel, typeof READER_LEVELS[ReaderLevel]][]
  levels.sort((a, b) => a[1].minPoints - b[1].minPoints)

  let currentLevel: ReaderLevel = 'bookworm'
  let currentLevelMin = 0
  let nextLevel: ReaderLevel | null = null
  let nextLevelMin = 0

  for (let i = 0; i < levels.length; i++) {
    const [level, config] = levels[i]
    if (points >= config.minPoints) {
      currentLevel = level
      currentLevelMin = config.minPoints
      if (i < levels.length - 1) {
        nextLevel = levels[i + 1][0]
        nextLevelMin = levels[i + 1][1].minPoints
      } else {
        nextLevel = null
      }
    }
  }

  if (!nextLevel) {
    return { currentLevel, nextLevel: null, progress: 100, minPoints: currentLevelMin, maxPoints: currentLevelMin }
  }

  const progress = ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100
  return { currentLevel, nextLevel, progress: Math.min(progress, 100), minPoints: currentLevelMin, maxPoints: nextLevelMin }
}

export const votingStatusLabel: Record<VotingStatus, string> = {
  not_started: '未开始',
  voting: '投票中',
  ended: '已结束',
}

export const votingStatusColor: Record<VotingStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600 border-gray-200',
  voting: 'bg-blue-50 text-blue-700 border-blue-200',
  ended: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export const noteVisibilityLabel: Record<NoteVisibility, string> = {
  public: '公开',
  private: '私密',
}

export const noteVisibilityColor: Record<NoteVisibility, string> = {
  public: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  private: 'bg-coffee-100 text-coffee-600 border-coffee-200',
}
