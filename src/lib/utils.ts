import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { SourceType, MeetupStatus } from '../../shared/types'

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
