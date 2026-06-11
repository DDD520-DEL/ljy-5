import express from 'express'
import QRCode from 'qrcode'
import { getDB, addBook, addReview, addTraceLog, incrementBorrowCount, returnBook, isBookBorrowed, getBookReservations, fulfillReservationByBorrower, getReviewsWithLevel, addPoints, getPointsRanking, getBorrowRanking, getReaderProfile, createBorrowRecord, getBookBorrowStatusDetail, sendReminder, getAllActiveBorrowRecords, getAllOverdueRecords, getNotifications, markNotificationRead, markAllNotificationsRead } from '../db'
import type { CreateBookRequest, CreateReviewRequest, ReaderRanking } from '../../shared/types'

const router = express.Router()

router.get('/', (req, res) => {
  const db = getDB()
  const { source, category, search, _sort, _order } = req.query
  
  let books = [...db.books]
  
  if (source && typeof source === 'string') {
    books = books.filter(b => b.sourceType === source)
  }
  if (category && typeof category === 'string') {
    books = books.filter(b => b.category === category)
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
  
  res.json(books)
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

router.get('/:id', (req, res) => {
  const db = getDB()
  const id = parseInt(req.params.id)
  const book = db.books.find(b => b.id === id)
  if (!book) {
    res.status(404).json({ error: '图书不存在' })
    return
  }
  res.json(book)
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
