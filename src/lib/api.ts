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
    request<Book>('/books', { method: 'POST', body: JSON.stringify(data) }),
  addReview: (id: number, data: CreateReviewRequest) =>
    request<Review>(`/books/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  qrcode: (id: number) =>
    request<{ qrcode: string; traceId: string; traceUrl: string }>(`/books/${id}/qrcode`),
  borrow: (id: number, operator?: string) =>
    request<{ success: boolean; borrowCount: number }>(`/books/${id}/borrow`, {
      method: 'POST',
      body: JSON.stringify({ operator }),
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
}

export const traceApi = {
  get: (traceId: string) =>
    request<{ book: Book; traceLogs: TraceLog[]; reviews: Review[] }>(`/trace/${traceId}`),
}

export const meetupApi = {
  list: (status?: string) =>
    request<Meetup[]>(`/meetups${status ? `?status=${status}` : ''}`),
  get: (id: number) =>
    request<Meetup & { registrations: Registration[] }>(`/meetups/${id}`),
  create: (data: CreateMeetupRequest) =>
    request<Meetup>('/meetups', { method: 'POST', body: JSON.stringify(data) }),
  register: (id: number, data: RegisterMeetupRequest) =>
    request<Registration>(`/meetups/${id}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSummary: (id: number, data: UpdateMeetupSummaryRequest) =>
    request<Meetup>(`/meetups/${id}/summary`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
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
