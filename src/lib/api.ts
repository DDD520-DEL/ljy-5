import type {
  Book,
  TraceLog,
  Review,
  Meetup,
  Registration,
  Reservation,
  CreateBookRequest,
  CreateReviewRequest,
  CreateMeetupRequest,
  RegisterMeetupRequest,
  CreateReservationRequest,
  UpdateMeetupSummaryRequest,
  ReaderRanking,
  ReaderProfile,
  PointsAccount,
  PointsLog,
  DonationReview,
  SubmitDonationRequest,
  ApproveDonationRequest,
  RejectDonationRequest,
  Note,
  NoteComment,
  CreateNoteRequest,
  CreateNoteCommentRequest,
  CheckIn,
  CheckInRequest,
  MeetupCheckInStats,
} from '../../shared/types'

const API_BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const bookApi = {
  list: (params?: { source?: string; category?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.source) qs.set('source', params.source)
    if (params?.category) qs.set('category', params.category)
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return request<Book[]>(`/books${query ? `?${query}` : ''}`)
  },
  ranking: (type: 'borrow' | 'discuss' = 'borrow') =>
    request<Book[]>(`/books/ranking?type=${type}`),
  get: (id: number) => request<Book>(`/books/${id}`),
  trace: (id: number) => request<TraceLog[]>(`/books/${id}/trace`),
  reviews: (id: number) => request<Review[]>(`/books/${id}/reviews`),
  create: (data: CreateBookRequest) =>
    request<{ book: Book; pointsResult?: { account: PointsAccount; log: PointsLog; levelUp: boolean } }>('/books', { method: 'POST', body: JSON.stringify(data) }),
  addReview: (id: number, data: CreateReviewRequest) =>
    request<{ review: Review; pointsResult?: { account: PointsAccount; log: PointsLog; levelUp: boolean } }>(`/books/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  qrcode: (id: number) =>
    request<{ qrcode: string; traceId: string; traceUrl: string }>(`/books/${id}/qrcode`),
  borrow: (id: number, data?: { operator?: string; borrower?: string }) =>
    request<{ success: boolean; borrowCount: number; fulfilledReservation: Reservation | null; pointsResult?: { account: PointsAccount; log: PointsLog; levelUp: boolean } }>(`/books/${id}/borrow`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  returnBook: (id: number, operator?: string) =>
    request<{
      success: boolean
      traceLog: TraceLog
      notifiedReservation: Reservation | null
    }>(`/books/${id}/return`, {
      method: 'POST',
      body: JSON.stringify({ operator }),
    }),
  status: (id: number) =>
    request<{ borrowed: boolean; reservationCount: number }>(`/books/${id}/status`),
  readerRanking: (type: 'points' | 'borrow' = 'points', limit: number = 10) =>
    request<ReaderRanking[]>(`/books/readers/ranking?type=${type}&limit=${limit}`),
  readerProfile: (nickname: string) =>
    request<ReaderProfile>(`/books/readers/${encodeURIComponent(nickname)}`),
}

export const traceApi = {
  get: (traceId: string) =>
    request<{ book: Book; traceLogs: TraceLog[]; reviews: Review[] }>(`/trace/${traceId}`),
}

export const meetupApi = {
  list: (status?: string) =>
    request<Meetup[]>(`/meetups${status ? `?status=${status}` : ''}`),
  get: (id: number) =>
    request<Meetup & { registrations: (Registration & { level?: string })[]; checkIns: CheckIn[]; checkInStats: MeetupCheckInStats }>(`/meetups/${id}`),
  create: (data: CreateMeetupRequest) =>
    request<Meetup>('/meetups', { method: 'POST', body: JSON.stringify(data) }),
  register: (id: number, data: RegisterMeetupRequest) =>
    request<{ registration: Registration }>(`/meetups/${id}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSummary: (id: number, data: UpdateMeetupSummaryRequest) =>
    request<Meetup>(`/meetups/${id}/summary`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getQrcode: (id: number) =>
    request<{ qrcode: string; checkInUrl: string; meetupId: number; meetupTitle: string }>(`/meetups/${id}/qrcode`),
  checkIn: (id: number, data: CheckInRequest) =>
    request<{
      checkIn: CheckIn
      pointsResult?: { account: PointsAccount; log: PointsLog; levelUp: boolean }
      checkInStats: MeetupCheckInStats
    }>(`/meetups/${id}/checkin`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCheckIns: (id: number) =>
    request<{ checkIns: CheckIn[]; stats: MeetupCheckInStats }>(`/meetups/${id}/checkins`),
}

export const reservationApi = {
  listByBook: (bookId: number) =>
    request<Reservation[]>(`/reservations?bookId=${bookId}`),
  listAll: () =>
    request<{ reservation: Reservation; book: Book }[]>('/reservations'),
  create: (bookId: number, data: CreateReservationRequest) =>
    request<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify({ ...data, bookId }),
    }),
  cancel: (id: number) =>
    request<Reservation>(`/reservations/${id}/cancel`, {
      method: 'PUT',
    }),
  reorder: (id: number, direction: 'up' | 'down') =>
    request<Reservation>(`/reservations/${id}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ direction }),
    }),
  stats: () =>
    request<{ count: number }>('/reservations/stats/count'),
}

export const donationApi = {
  submit: (data: SubmitDonationRequest) =>
    request<{ review: DonationReview }>('/donations/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  pending: () =>
    request<DonationReview[]>('/donations/pending'),
  all: () =>
    request<DonationReview[]>('/donations/all'),
  getByDonor: (nickname: string) =>
    request<DonationReview[]>(`/donations/donor/${encodeURIComponent(nickname)}`),
  get: (id: number) =>
    request<DonationReview>(`/donations/${id}`),
  approve: (id: number, data: ApproveDonationRequest) =>
    request<{
      review: DonationReview
      book: Book
      pointsResult?: { account: PointsAccount; log: PointsLog; levelUp: boolean }
      qrcode: { qrcode: string; traceId: string; traceUrl: string } | null
    }>(`/donations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  reject: (id: number, data: RejectDonationRequest) =>
    request<{ review: DonationReview }>(`/donations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export const noteApi = {
  listByBook: (bookId: number, nickname?: string) => {
    const params = new URLSearchParams()
    if (nickname) params.set('nickname', nickname)
    const query = params.toString()
    return request<Note[]>(`/notes/book/${bookId}${query ? `?${query}` : ''}`)
  },
  listByUser: (nickname: string, viewer?: string) => {
    const params = new URLSearchParams()
    if (viewer) params.set('viewer', viewer)
    const query = params.toString()
    return request<Note[]>(`/notes/user/${encodeURIComponent(nickname)}${query ? `?${query}` : ''}`)
  },
  get: (id: number) => request<Note>(`/notes/${id}`),
  getComments: (id: number) => request<NoteComment[]>(`/notes/${id}/comments`),
  hot: (limit: number = 10, days?: number) => {
    const params = new URLSearchParams()
    params.set('limit', limit.toString())
    if (days) params.set('days', days.toString())
    const query = params.toString()
    return request<Note[]>(`/notes/hot?${query}`)
  },
  create: (data: CreateNoteRequest) =>
    request<{ note: Note; pointsResult?: { account: PointsAccount; log: PointsLog; levelUp: boolean } }>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  like: (id: number, nickname: string) =>
    request<{ note: Note; liked: boolean }>(`/notes/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    }),
  hasLiked: (id: number, nickname: string) =>
    request<{ liked: boolean }>(`/notes/${id}/liked?nickname=${encodeURIComponent(nickname)}`),
  addComment: (id: number, data: CreateNoteCommentRequest) =>
    request<{ comment: NoteComment; note: Note }>(`/notes/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Pick<Note, 'title' | 'content' | 'images' | 'visibility'>>) =>
    request<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ success: boolean }>(`/notes/${id}`, {
      method: 'DELETE',
    }),
}
