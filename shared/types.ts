export type DonationReviewStatus = 'pending' | 'approved' | 'rejected'

export interface DonationReview {
  id: number
  title: string
  author: string
  isbn?: string
  publisher?: string
  category: string
  sourceInfo?: string
  coverImage?: string
  description?: string
  donor: string
  donorContact?: string
  status: DonationReviewStatus
  reviewNote?: string
  reviewedAt?: string
  reviewer?: string
  bookPhotos?: string[]
  bookId?: number
  createdAt: string
  updatedAt: string
}

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
  checkedIn?: boolean
  checkedInAt?: string
}

export interface CheckIn {
  id: number
  meetupId: number
  registrationId: number
  nickname: string
  createdAt: string
}

export interface SubmitDonationRequest {
  title: string
  author: string
  isbn?: string
  publisher?: string
  category: string
  sourceInfo?: string
  coverImage?: string
  description?: string
  donor: string
  donorContact?: string
}

export interface ApproveDonationRequest {
  title?: string
  author?: string
  isbn?: string
  publisher?: string
  category?: string
  sourceInfo?: string
  coverImage?: string
  description?: string
  bookPhotos?: string[]
  reviewer?: string
}

export interface RejectDonationRequest {
  reviewNote: string
  reviewer?: string
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
  donor?: string
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

export interface CheckInRequest {
  nickname: string
}

export interface CheckInResponse {
  checkIn: CheckIn
  pointsResult?: {
    account: PointsAccount
    log: PointsLog
    levelUp: boolean
  }
}

export interface MeetupCheckInStats {
  totalRegistered: number
  totalCheckedIn: number
  checkInRate: number
  checkIns: CheckIn[]
}

export type ReservationStatus = 'waiting' | 'notified' | 'cancelled' | 'fulfilled'

export interface Reservation {
  id: number
  bookId: number
  nickname: string
  contact?: string
  status: ReservationStatus
  position: number
  createdAt: string
  notifiedAt?: string
}

export interface CreateReservationRequest {
  nickname: string
  contact?: string
}

export interface ReorderReservationRequest {
  direction: 'up' | 'down'
}

export interface UpdateMeetupSummaryRequest {
  groupPhotos?: string[]
  discussionNotes?: string
}

export type ReaderLevel = 'bookworm' | 'booklover' | 'bookmaniac' | 'bookcollector'

export const READER_LEVELS: Record<ReaderLevel, { name: string; minPoints: number; color: string }> = {
  bookworm: { name: '书虫', minPoints: 0, color: 'bg-coffee-100 text-coffee-700 border-coffee-200' },
  booklover: { name: '书迷', minPoints: 100, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  bookmaniac: { name: '书痴', minPoints: 300, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  bookcollector: { name: '藏书家', minPoints: 600, color: 'bg-purple-100 text-purple-700 border-purple-200' },
}

export type PointsActionType = 'borrow' | 'review' | 'meetup' | 'donation'

export const POINTS_ACTION: Record<PointsActionType, { name: string; points: number }> = {
  borrow: { name: '借阅图书', points: 5 },
  review: { name: '发表书评', points: 10 },
  meetup: { name: '参加读书会', points: 15 },
  donation: { name: '捐赠图书', points: 20 },
}

export interface PointsAccount {
  id: number
  nickname: string
  points: number
  level: ReaderLevel
  borrowCount: number
  reviewCount: number
  meetupCount: number
  donationCount: number
  createdAt: string
  updatedAt: string
}

export interface PointsLog {
  id: number
  accountId: number
  nickname: string
  action: PointsActionType
  points: number
  description: string
  relatedId?: number
  createdAt: string
}

export interface ReviewWithLevel extends Review {
  level?: ReaderLevel
}

export interface ReaderRanking {
  nickname: string
  points: number
  level: ReaderLevel
  borrowCount: number
}

export type NoteVisibility = 'public' | 'private'

export interface Note {
  id: number
  bookId: number
  bookTitle?: string
  bookCover?: string
  nickname: string
  title: string
  content: string
  images: string[]
  visibility: NoteVisibility
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface NoteComment {
  id: number
  noteId: number
  nickname: string
  content: string
  createdAt: string
}

export interface NoteLike {
  id: number
  noteId: number
  nickname: string
  createdAt: string
}

export interface NoteWithBook extends Note {
  book?: Book
}

export interface CreateNoteRequest {
  bookId: number
  nickname: string
  title: string
  content: string
  images?: string[]
  visibility: NoteVisibility
}

export interface CreateNoteCommentRequest {
  nickname: string
  content: string
}

export interface ReaderProfile {
  account: PointsAccount
  logs: PointsLog[]
  borrowHistory: { book: Book; traceLog: TraceLog }[]
  reviews: Review[]
  meetups: { meetup: Meetup; registration: Registration }[]
  donations: Book[]
  donationReviews: DonationReview[]
  notes: Note[]
}
