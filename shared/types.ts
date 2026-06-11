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
  tags?: string[]
  createdAt: string
  borrowCount: number
  discussCount: number
  averageRating?: number
  reviewCount?: number
}

export interface RatingStats {
  distribution: Record<number, number>
  average: number
  totalCount: number
}

export interface TraceLog {
  id: number
  bookId: number
  action: '入库' | '借出' | '归还' | '捐赠' | '转让' | '催还'
  description: string
  timestamp: string
  operator?: string
}

export interface BorrowRecord {
  id: number
  bookId: number
  borrower: string
  contact?: string
  borrowDate: string
  dueDate: string
  returnDate?: string
  status: 'borrowing' | 'returned' | 'overdue'
  reminderSent?: boolean
  reminderCount: number
  lastReminderAt?: string
  createdAt: string
  updatedAt: string
}

export type NotificationType =
  | 'reminder'
  | 'system'
  | 'reservation'
  | 'reservation_available'
  | 'meetup_register'
  | 'comment_reply'
  | 'note_like'
  | 'donation_approved'
  | 'donation_rejected'

export interface Notification {
  id: number
  nickname: string
  type: NotificationType
  title: string
  content: string
  relatedBookId?: number
  relatedBookTitle?: string
  relatedId?: number
  relatedType?: string
  read: boolean
  createdAt: string
  emailSent?: boolean
  emailSentAt?: string
}

export interface BorrowRecordWithBook extends BorrowRecord {
  book: Book
}

export interface BookBorrowStatus {
  borrowed: boolean
  borrowRecord?: BorrowRecord
  daysRemaining?: number
  isOverdue?: boolean
  overdueDays?: number
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
  tags?: string[]
  donor?: string
}

export interface TagStat {
  tag: string
  count: number
}

export interface RecommendResult {
  books: Book[]
  reason: string
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

export type PointsActionType = 'borrow' | 'review' | 'meetup' | 'donation' | 'exchange'

export const POINTS_ACTION: Record<PointsActionType, { name: string; points: number }> = {
  borrow: { name: '借阅图书', points: 5 },
  review: { name: '发表书评', points: 10 },
  meetup: { name: '参加读书会', points: 15 },
  donation: { name: '捐赠图书', points: 20 },
  exchange: { name: '图书交换', points: 10 },
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
  exchangeCount: number
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
  currentBorrowings: BorrowRecordWithBook[]
  overdueRecords: BorrowRecordWithBook[]
  reviews: Review[]
  meetups: { meetup: Meetup; registration: Registration }[]
  donations: Book[]
  donationReviews: DonationReview[]
  notes: Note[]
  unreadNotificationCount: number
}

export type BookCondition = '全新' | '九成新' | '八成新' | '七成新' | '一般'

export type ExchangeListingStatus = 'active' | 'exchanged' | 'cancelled'

export interface ExchangeListing {
  id: number
  bookId: number
  owner: string
  ownerContact?: string
  bookTitle: string
  bookAuthor: string
  bookCover?: string
  category: string
  condition: BookCondition
  wantCategories: string[]
  wantBookNames: string[]
  description?: string
  status: ExchangeListingStatus
  createdAt: string
  updatedAt: string
}

export type ExchangeRequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed'

export interface ExchangeRequest {
  id: number
  listingId: number
  requester: string
  requesterContact?: string
  offeredBookTitle: string
  offeredBookAuthor: string
  offeredBookCategory: string
  offeredBookCondition: BookCondition
  offeredBookCover?: string
  message?: string
  status: ExchangeRequestStatus
  createdAt: string
  updatedAt: string
}

export interface CreateExchangeListingRequest {
  bookId?: number
  owner: string
  ownerContact?: string
  bookTitle: string
  bookAuthor: string
  bookCover?: string
  category: string
  condition: BookCondition
  wantCategories: string[]
  wantBookNames: string[]
  description?: string
}

export interface CreateExchangeRequestRequest {
  requester: string
  requesterContact?: string
  offeredBookTitle: string
  offeredBookAuthor: string
  offeredBookCategory: string
  offeredBookCondition: BookCondition
  offeredBookCover?: string
  message?: string
}

export const BOOK_CONDITIONS: { value: BookCondition; label: string; color: string }[] = [
  { value: '全新', label: '全新', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: '九成新', label: '九成新', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: '八成新', label: '八成新', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: '七成新', label: '七成新', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: '一般', label: '一般', color: 'bg-gray-100 text-gray-700 border-gray-200' },
]

export interface ExchangeListingWithRequests extends ExchangeListing {
  requests: ExchangeRequest[]
  requestCount: number
}

export interface MeetupDiscussionPost {
  id: number
  meetupId: number
  bookId?: number
  nickname: string
  title: string
  content: string
  images: string[]
  replyCount: number
  lastReplyAt: string
  createdAt: string
  updatedAt: string
}

export interface MeetupDiscussionReply {
  id: number
  postId: number
  meetupId: number
  nickname: string
  content: string
  images: string[]
  parentId?: number
  replyToNickname?: string
  createdAt: string
}

export interface MeetupDiscussionPostWithReplies extends MeetupDiscussionPost {
  replies: MeetupDiscussionReply[]
}

export interface CreateMeetupDiscussionPostRequest {
  nickname: string
  title: string
  content: string
  images?: string[]
}

export interface CreateMeetupDiscussionReplyRequest {
  nickname: string
  content: string
  images?: string[]
  parentId?: number
  replyToNickname?: string
}

export type BookshelfVisibility = 'public' | 'private'

export interface Bookshelf {
  id: number
  nickname: string
  name: string
  description?: string
  visibility: BookshelfVisibility
  coverImage?: string
  bookCount: number
  likeCount: number
  createdAt: string
  updatedAt: string
}

export interface BookshelfBook {
  id: number
  bookshelfId: number
  bookId: number
  bookTitle?: string
  bookAuthor?: string
  bookCover?: string
  addedAt: string
}

export interface BookshelfLike {
  id: number
  bookshelfId: number
  nickname: string
  createdAt: string
}

export interface BookshelfWithBooks extends Bookshelf {
  books: BookshelfBook[]
}

export interface BookshelfWithOwner extends Bookshelf {
  books: BookshelfBook[]
  ownerLevel?: ReaderLevel
}

export interface CreateBookshelfRequest {
  nickname: string
  name: string
  description?: string
  visibility: BookshelfVisibility
  coverImage?: string
}

export interface UpdateBookshelfRequest {
  name?: string
  description?: string
  visibility?: BookshelfVisibility
  coverImage?: string
}

export interface AddBookToBookshelfRequest {
  bookId: number
  nickname: string
}

export interface ToggleBookshelfLikeRequest {
  nickname: string
}

export type FeedbackType = 'feature' | 'bug' | 'other'

export const FEEDBACK_TYPES: Record<FeedbackType, { label: string; color: string }> = {
  feature: { label: '功能建议', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  bug: { label: 'Bug 上报', color: 'bg-red-100 text-red-700 border-red-200' },
  other: { label: '其他', color: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export type FeedbackStatus = 'pending' | 'processing' | 'resolved' | 'rejected'

export const FEEDBACK_STATUS: Record<FeedbackStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  processing: { label: '处理中', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  resolved: { label: '已解决', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: '不予处理', color: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export interface Feedback {
  id: number
  type: FeedbackType
  content: string
  contact?: string
  nickname?: string
  status: FeedbackStatus
  reply?: string
  repliedAt?: string
  repliedBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateFeedbackRequest {
  type: FeedbackType
  content: string
  contact?: string
  nickname?: string
}

export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus
  reply?: string
  operator?: string
}

export type StarType = 'borrow' | 'review'

export interface MonthlyStar {
  id: number
  year: number
  month: number
  type: StarType
  nickname: string
  count: number
  rank: number
  avatar?: string
  createdAt: string
}

export interface MonthlyStarsResult {
  year: number
  month: number
  borrowStars: MonthlyStar[]
  reviewStars: MonthlyStar[]
  generatedAt: string
}

export interface ReadingCheckIn {
  id: number
  nickname: string
  bookTitle: string
  bookAuthor?: string
  bookCover?: string
  durationMinutes: number
  thoughts?: string
  checkInDate: string
  createdAt: string
}

export interface CreateReadingCheckInRequest {
  nickname: string
  bookTitle: string
  bookAuthor?: string
  bookCover?: string
  durationMinutes: number
  thoughts?: string
}

export interface ReadingCheckInStats {
  todayCheckInCount: number
  userStreakDays: number
  userTotalCheckIns: number
  userTotalMinutes: number
}

export interface ReadingCheckInHeatmapData {
  date: string
  count: number
  durationMinutes: number
}
