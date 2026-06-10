import express from 'express'
import { getDB } from '../db'

const router = express.Router()

router.get('/:traceId', (req, res) => {
  const db = getDB()
  const { traceId } = req.params
  const book = db.books.find(b => b.traceId === traceId)
  if (!book) {
    res.status(404).json({ error: '溯源ID不存在' })
    return
  }
  
  const traceLogs = db.traceLogs
    .filter(l => l.bookId === book.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  
  const reviews = db.reviews
    .filter(r => r.bookId === book.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  res.json({ book, traceLogs, reviews })
})

export default router
