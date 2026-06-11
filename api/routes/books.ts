import express from 'express'
import QRCode from 'qrcode'
import XLSX from 'xlsx'
import { getDB, addBook, addReview, addTraceLog, incrementBorrowCount, returnBook, isBookBorrowed, getBookReservations, fulfillReservationByBorrower, getReviewsWithLevel, addPoints, getPointsRanking, getBorrowRanking, getReaderProfile, createBorrowRecord, getBookBorrowStatusDetail, sendReminder, getAllActiveBorrowRecords, getAllOverdueRecords, getNotifications, markNotificationRead, markAllNotificationsRead, getTagStats, getRecommendedBooks, getRatingStats, enrichBookWithRating, getNewArrivals } from '../db'
import type { CreateBookRequest, CreateReviewRequest, ReaderRanking, TagStat, RecommendResult, RatingStats, Book, TraceLog } from '../../shared/types'

const router = express.Router()

router.get('/', (req, res) => {
  const db = getDB()
  const { source, category, search, tag, _sort, _order } = req.query
  
  let books = [...db.books]
  
  if (source && typeof source === 'string') {
    books = books.filter(b => b.sourceType === source)
  }
  if (category && typeof category === 'string') {
    books = books.filter(b => b.category === category)
  }
  if (tag && typeof tag === 'string') {
    books = books.filter(b => b.tags && b.tags.includes(tag as string))
  }
  if (search && typeof search === 'string') {
    const keyword = search.toLowerCase()
    books = books.filter(b => 
      b.title.toLowerCase().includes(keyword) ||
      b.author.toLowerCase().includes(keyword) ||
      b.traceId.toLowerCase().includes(keyword)
    )
  }
  
  if (_sort && typeof _sort === 'string' && _order && typeof _order === 'string') {
    books.sort((a, b) => {
      const aVal = a[_sort as keyof typeof a] as number
      const bVal = b[_sort as keyof typeof b] as number
      return _order === 'asc' ? aVal - bVal : bVal - aVal
    })
  }
  
  res.json(books.map(b => enrichBookWithRating(b)))
})

router.get('/ranking', (req, res) => {
  const db = getDB()
  const { type = 'borrow' } = req.query
  const sortKey = type === 'discuss' ? 'discussCount' : 'borrowCount'
  const books = [...db.books]
    .sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number))
    .slice(0, 10)
  res.json(books)
})

router.get('/readers/ranking', (req, res) => {
  const { type = 'points', limit = '10' } = req.query
  const limitNum = parseInt(limit as string) || 10
  let ranking: ReaderRanking[]
  if (type === 'borrow') {
    ranking = getBorrowRanking(limitNum)
  } else {
    ranking = getPointsRanking(limitNum)
  }
  res.json(ranking)
})

router.get('/new-arrivals', (req, res) => {
  const { days = '7' } = req.query
  const daysNum = parseInt(days as string) || 7
  const books = getNewArrivals(daysNum)
  res.json(books.map(b => enrichBookWithRating(b)))
})

router.get('/tags/stats', (_req, res) => {
  const stats = getTagStats()
  res.json(stats)
})

router.get('/recommend', (req, res) => {
  const { nickname, limit = '6' } = req.query
  if (!nickname || typeof nickname !== 'string') {
    res.status(400).json({ error: '缺少 nickname 参数' })
    return
  }
  const limitNum = parseInt(limit as string) || 6
  const result = getRecommendedBooks(decodeURIComponent(nickname), limitNum)
  res.json(result)
})

router.get('/readers/:nickname', (req, res) => {
  const { nickname } = req.params
  const profile = getReaderProfile(decodeURIComponent(nickname))
  if (!profile) {
    res.status(404).json({ error: '读者不存在' })
    return
  }
  res.json(profile)
})

router.get('/readers/:nickname/notifications', (req, res) => {
  const { nickname } = req.params
  const notifications = getNotifications(decodeURIComponent(nickname))
  res.json(notifications)
})

router.post('/readers/:nickname/notifications/:id/read', (req, res) => {
  const { nickname, id } = req.params
  const result = markNotificationRead(parseInt(id), decodeURIComponent(nickname))
  if (!result) {
    res.status(404).json({ error: '通知不存在' })
    return
  }
  res.json({ success: true, notification: result })
})

router.post('/readers/:nickname/notifications/read-all', (req, res) => {
  const { nickname } = req.params
  const count = markAllNotificationsRead(decodeURIComponent(nickname))
  res.json({ success: true, count })
})

router.get('/borrow/active', (req, res) => {
  const records = getAllActiveBorrowRecords()
  res.json(records)
})

router.get('/borrow/overdue', (req, res) => {
  const records = getAllOverdueRecords()
  res.json(records)
})

const sourceTypeLabel: Record<string, string> = {
  donation: '个人捐赠',
  direct: '出版社直供',
  secondhand: '二手回收',
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

router.get('/export', (req, res) => {
  const db = getDB()
  const { category, source } = req.query

  let books: Book[] = [...db.books]

  if (category && typeof category === 'string') {
    books = books.filter(b => b.category === category)
  }
  if (source && typeof source === 'string') {
    books = books.filter(b => b.sourceType === source)
  }

  const exportData = books.map(book => ({
    '书名': book.title,
    '作者': book.author,
    'ISBN': book.isbn || '',
    '出版社': book.publisher || '',
    '分类': book.category,
    '来源类型': sourceTypeLabel[book.sourceType] || book.sourceType,
    '来源说明': book.sourceInfo || '',
    '入库时间': formatDateTime(book.createdAt),
    '借阅次数': book.borrowCount,
    '评论数': book.discussCount,
    '溯源ID': book.traceId,
    '标签': book.tags ? book.tags.join(', ') : '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '图书数据')

  const colWidths = [
    { wch: 30 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 20 },
    { wch: 20 },
  ]
  worksheet['!cols'] = colWidths

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  const fileName = `图书数据_${new Date().toISOString().slice(0, 10)}.xlsx`

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
  res.send(buffer)
})

router.get('/:id/trace/export', (req, res) => {
  const db = getDB()
  const id = parseInt(req.params.id)
  const book = db.books.find(b => b.id === id)
  if (!book) {
    res.status(404).json({ error: '图书不存在' })
    return
  }

  const traceLogs: TraceLog[] = db.traceLogs
    .filter(l => l.bookId === id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const exportData = traceLogs.map(log => ({
    '序号': log.id,
    '操作类型': log.action,
    '操作描述': log.description,
    '操作时间': formatDateTime(log.timestamp),
    '操作人': log.operator || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '溯源日志')

  const colWidths = [
    { wch: 8 },
    { wch: 12 },
    { wch: 40 },
    { wch: 20 },
    { wch: 15 },
  ]
  worksheet['!cols'] = colWidths

  const bookInfoSheet = XLSX.utils.json_to_sheet([
    { '项目': '书名', '内容': book.title },
    { '项目': '作者', '内容': book.author },
    { '项目': 'ISBN', '内容': book.isbn || '' },
    { '项目': '分类', '内容': book.category },
    { '项目': '溯源ID', '内容': book.traceId },
    { '项目': '日志总数', '内容': traceLogs.length },
  ])
  XLSX.utils.book_append_sheet(workbook, bookInfoSheet, '图书信息')
  bookInfoSheet['!cols'] = [{ wch: 12 }, { wch: 40 }]

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  const fileName = `溯源日志_${book.title}_${new Date().toISOString().slice(0, 10)}.xlsx`

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
  res.send(buffer)
})

router.get('/:id/rating-stats', (req, res) => {
  const id = parseInt(req.params.id)
  const db = getDB()
  const book = db.books.find(b => b.id === id)
  if (!book) {
    res.status(404).json({ error: '图书不存在' })
    return
  }
  const stats: RatingStats = getRatingStats(id)
  res.json(stats)
})

router.get('/:id', (req, res) => {
  const db = getDB()
  const id = parseInt(req.params.id)
  const book = db.books.find(b => b.id === id)
  if (!book) {
    res.status(404).json({ error: '图书不存在' })
    return
  }
  res.json(enrichBookWithRating(book))
})

router.get('/:id/trace', (req, res) => {
  const db = getDB()
  const id = parseInt(req.params.id)
  const logs = db.traceLogs
    .filter(l => l.bookId === id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  res.json(logs)
})

router.get('/:id/reviews', (req, res) => {
  const id = parseInt(req.params.id)
  const reviews = getReviewsWithLevel(id)
  res.json(reviews)
})

router.post('/', (req, res) => {
  const body = req.body as CreateBookRequest
  if (!body.title || !body.author || !body.category || !body.sourceType) {
    res.status(400).json({ error: '必填字段缺失' })
    return
  }
  const result = addBook(body)
  res.status(201).json({ 
    book: result.book, 
    pointsResult: result.pointsResult 
  })
})

router.post('/:id/reviews', (req, res) => {
  const db = getDB()
  const id = parseInt(req.params.id)
  const book = db.books.find(b => b.id === id)
  if (!book) {
    res.status(404).json({ error: '图书不存在' })
    return
  }
  const body = req.body as CreateReviewRequest
  if (!body.content || !body.nickname || !body.rating) {
    res.status(400).json({ error: '必填字段缺失' })
    return
  }
  const result = addReview(id, body)
  res.status(201).json({ 
    review: result.review, 
    pointsResult: result.pointsResult 
  })
})

router.get('/:id/qrcode', async (req, res) => {
  const db = getDB()
  const id = parseInt(req.params.id)
  const book = db.books.find(b => b.id === id)
  if (!book) {
    res.status(404).json({ error: '图书不存在' })
    return
  }
  
  const publicBaseUrl = process.env.PUBLIC_BASE_URL || 
    `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers['x-forwarded-host'] || req.get('host')}`
  const traceUrl = `${publicBaseUrl}/trace/${book.traceId}`
  
  try {
    const dataUrl = await QRCode.toDataURL(traceUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#6F4E37',
        light: '#FFFFFF'
      }
    })
    res.json({ qrcode: dataUrl, traceId: book.traceId, traceUrl })
  } catch (err) {
    console.error('QR code generation failed:', err)
    res.status(500).json({ error: '二维码生成失败' })
  }
})

router.post('/:id/borrow', (req, res) => {
  const db = getDB()
  const id = parseInt(req.params.id)
  const book = db.books.find(b => b.id === id)
  if (!book) {
    res.status(404).json({ error: '图书不存在' })
    return
  }
  if (isBookBorrowed(id)) {
    res.status(400).json({ error: '图书已被借出' })
    return
  }
  incrementBorrowCount(id)
  const { operator, borrower, contact, borrowDays } = req.body as { 
    operator?: string; 
    borrower?: string; 
    contact?: string;
    borrowDays?: number;
  }
  let description = `读者借阅，书店${operator || '管理员'}登记`
  if (borrower) {
    description = `${borrower}借阅该书，书店${operator || '管理员'}登记`
  }
  addTraceLog(id, '借出', description, operator || '管理员')

  let borrowRecord = null
  if (borrower) {
    borrowRecord = createBorrowRecord(id, borrower, contact, borrowDays || 30)
  }

  let fulfilledReservation = null
  if (borrower) {
    fulfilledReservation = fulfillReservationByBorrower(id, borrower)
  }

  let pointsResult = null
  if (borrower) {
    pointsResult = addPoints(
      borrower,
      'borrow',
      `借阅《${book.title}》`,
      id
    )
  }

  res.json({ 
    success: true, 
    borrowCount: book.borrowCount, 
    fulfilledReservation,
    pointsResult,
    borrowRecord,
  })
})

router.post('/:id/return', (req, res) => {
  const id = parseInt(req.params.id)
  const { operator } = req.body as { operator?: string }
  const result = returnBook(id, operator)
  if (!result) {
    res.status(400).json({ error: '归还失败，图书不存在或未被借出' })
    return
  }
  res.json({
    success: true,
    traceLog: result.traceLog,
    notifiedReservation: result.notifiedReservation,
    borrowRecord: result.borrowRecord,
  })
})

router.post('/:id/reminder', (req, res) => {
  const id = parseInt(req.params.id)
  const { operator } = req.body as { operator?: string }
  const db = getDB()
  const book = db.books.find(b => b.id === id)
  if (!book) {
    res.status(404).json({ error: '图书不存在' })
    return
  }
  const borrowRecord = db.borrowRecords.find(
    r => r.bookId === id && (r.status === 'borrowing' || r.status === 'overdue')
  )
  if (!borrowRecord) {
    res.status(400).json({ error: '图书未被借出，无需催还' })
    return
  }
  const result = sendReminder(borrowRecord.id, operator)
  if (!result) {
    res.status(500).json({ error: '催还提醒发送失败' })
    return
  }
  res.json({
    success: true,
    record: result.record,
    notification: result.notification,
    traceLog: result.traceLog,
  })
})

router.get('/:id/status', (req, res) => {
  const id = parseInt(req.params.id)
  const db = getDB()
  const book = db.books.find(b => b.id === id)
  if (!book) {
    res.status(404).json({ error: '图书不存在' })
    return
  }
  const status = getBookBorrowStatusDetail(id)
  const reservations = getBookReservations(id)
  res.json({ 
    borrowed: status.borrowed, 
    reservationCount: reservations.length,
    borrowStatus: status,
  })
})

export default router
