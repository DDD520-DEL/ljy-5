import express from 'express'
import {
  getDB,
  addReservation,
  getBookReservations,
  cancelReservation,
  reorderReservation,
  getAllReservationsWithBookInfo,
  isBookBorrowed,
} from '../db'
import type { CreateReservationRequest, ReorderReservationRequest } from '../../shared/types'

const router = express.Router()

router.get('/', (req, res) => {
  const { bookId } = req.query
  if (bookId && typeof bookId === 'string') {
    const reservations = getBookReservations(parseInt(bookId))
    res.json(reservations)
    return
  }
  const all = getAllReservationsWithBookInfo()
  res.json(all)
})

router.post('/', (req, res) => {
  const body = req.body as CreateReservationRequest & { bookId: number }
  if (!body.bookId || !body.nickname) {
    res.status(400).json({ error: '请填写必填字段' })
    return
  }
  if (!isBookBorrowed(body.bookId)) {
    res.status(400).json({ error: '该图书当前可借，无需预约' })
    return
  }
  const db = getDB()
  const existing = db.reservations.find(
    r => r.bookId === body.bookId && r.nickname === body.nickname && r.status !== 'cancelled' && r.status !== 'fulfilled'
  )
  if (existing) {
    res.status(400).json({ error: '您已预约过此图书' })
    return
  }
  const reservation = addReservation(body.bookId, {
    nickname: body.nickname,
    contact: body.contact,
  })
  if (!reservation) {
    res.status(500).json({ error: '预约失败' })
    return
  }
  res.status(201).json(reservation)
})

router.get('/stats/count', (req, res) => {
  const db = getDB()
  const count = db.reservations.filter(r => r.status === 'waiting' || r.status === 'notified').length
  res.json({ count })
})

router.put('/:id/cancel', (req, res) => {
  const id = parseInt(req.params.id)
  const result = cancelReservation(id)
  if (!result) {
    res.status(404).json({ error: '预约不存在或已取消' })
    return
  }
  res.json(result)
})

router.put('/:id/reorder', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as ReorderReservationRequest
  if (!body.direction || (body.direction !== 'up' && body.direction !== 'down')) {
    res.status(400).json({ error: '请指定方向 (up/down)' })
    return
  }
  const result = reorderReservation(id, body.direction)
  if (!result) {
    res.status(400).json({ error: '无法调整顺序，可能已在最前/最后' })
    return
  }
  res.json(result)
})

export default router
