export type SourceType = 'donation' | 'direct' | 'secondhand'

export interface Book {
  id: number
  traceId: string
  title: string
  author: string
  isbn?: string
  publisher?: string
  category: string
  sourceType: SourceType
  sourceInfo?: string
  coverImage?: string
  description?: string
  createdAt: string
  borrowCount: number
  discussCount: number
}

export interface TraceLog {
  id: number
  bookId: number
  action: '入库' | '借出' | '归还' | '捐赠' | '转让'
  description: string
  timestamp: string
  operator?: string
}

export interface Review {
  id: number
  bookId: number
  content: string
  nickname: string
  rating: number
  createdAt: string
}

export type MeetupStatus = 'upcoming' | 'ongoing' | 'finished'

export interface Meetup {
  id: number
  title: string
  description: string
  bookId?: number
  date: string
  location: string
  maxParticipants: number
  currentParticipants: number
  status: MeetupStatus
  coverImage?: string
  groupPhotos?: string[]
  discussionNotes?: string
  createdAt: string
}

export interface Registration {
  id: number
  meetupId: number
  nickname: string
  contact?: string
  createdAt: string
}

export interface CreateBookRequest {
  title: string
  author: string
  isbn?: string
  publisher?: string
  category: string
  sourceType: SourceType
  sourceInfo?: string
  coverImage?: string
  description?: string
}

export interface CreateReviewRequest {
  content: string
  nickname: string
  rating: number
}

export interface CreateMeetupRequest {
  title: string
  description: string
  bookId?: number
  date: string
  location: string
  maxParticipants: number
  coverImage?: string
}

export interface RegisterMeetupRequest {
  nickname: string
  contact?: string
}

export interface UpdateMeetupSummaryRequest {
  groupPhotos?: string[]
  discussionNotes?: string
}
