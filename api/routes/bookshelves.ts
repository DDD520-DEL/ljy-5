import express from 'express'
import {
  createBookshelf,
  getBookshelfById,
  getBookshelvesByUser,
  getBookshelvesByBook,
  getPublicBookshelves,
  updateBookshelf,
  deleteBookshelf,
  addBookToBookshelf,
  removeBookFromBookshelf,
  getBookshelfMembership,
  toggleBookshelfLike,
  hasLikedBookshelf,
  getBookshelfLikes,
} from '../db'
import type {
  CreateBookshelfRequest,
  UpdateBookshelfRequest,
  AddBookToBookshelfRequest,
  ToggleBookshelfLikeRequest,
  Bookshelf,
} from '../../shared/types'

const router = express.Router()

router.get('/public', (req, res) => {
  const { limit = '20', sort = 'latest' } = req.query
  const limitNum = parseInt(limit as string) || 20
  const sortBy = sort === 'popular' ? 'popular' : 'latest'
  const shelves = getPublicBookshelves(limitNum, sortBy)
  res.json(shelves)
})

router.get('/user/:nickname', (req, res) => {
  const { nickname } = req.params
  const { viewer } = req.query
  const shelves = getBookshelvesByUser(
    decodeURIComponent(nickname),
    viewer ? decodeURIComponent(viewer as string) : undefined
  )
  res.json(shelves)
})

router.get('/book/:bookId', (req, res) => {
  const bookId = parseInt(req.params.bookId)
  const { nickname } = req.query
  const shelves = getBookshelvesByBook(
    bookId,
    nickname ? decodeURIComponent(nickname as string) : undefined
  )
  res.json(shelves)
})

router.get('/book/:bookId/membership', (req, res) => {
  const bookId = parseInt(req.params.bookId)
  const { nickname } = req.query
  if (!nickname || typeof nickname !== 'string') {
    res.status(400).json({ error: '缺少 nickname 参数' })
    return
  }
  const membership = getBookshelfMembership(bookId, decodeURIComponent(nickname))
  res.json({ bookshelfIds: membership })
})

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const bookshelf = getBookshelfById(id)
  if (!bookshelf) {
    res.status(404).json({ error: '书单不存在' })
    return
  }
  res.json(bookshelf)
})

router.get('/:id/likes', (req, res) => {
  const id = parseInt(req.params.id)
  const bookshelf = getBookshelfById(id)
  if (!bookshelf) {
    res.status(404).json({ error: '书单不存在' })
    return
  }
  const likes = getBookshelfLikes(id)
  res.json(likes)
})

router.get('/:id/liked', (req, res) => {
  const id = parseInt(req.params.id)
  const { nickname } = req.query
  if (!nickname || typeof nickname !== 'string') {
    res.json({ liked: false })
    return
  }
  const liked = hasLikedBookshelf(id, decodeURIComponent(nickname))
  res.json({ liked })
})

router.post('/', (req, res) => {
  const body = req.body as CreateBookshelfRequest
  if (!body.nickname || !body.name || !body.visibility) {
    res.status(400).json({ error: '必填字段缺失' })
    return
  }
  const bookshelf = createBookshelf(body)
  res.status(201).json(bookshelf)
})

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as UpdateBookshelfRequest & { nickname?: string }
  if (!body.nickname) {
    res.status(400).json({ error: '缺少 nickname 参数' })
    return
  }
  const result = updateBookshelf(id, body.nickname, body)
  if (!result) {
    res.status(404).json({ error: '书单不存在或无权操作' })
    return
  }
  res.json(result)
})

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const { nickname } = req.body as { nickname?: string }
  if (!nickname) {
    res.status(400).json({ error: '缺少 nickname 参数' })
    return
  }
  const success = deleteBookshelf(id, nickname)
  if (!success) {
    res.status(404).json({ error: '书单不存在或无权操作' })
    return
  }
  res.json({ success: true })
})

router.post('/:id/books', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as AddBookToBookshelfRequest
  if (!body.bookId || !body.nickname) {
    res.status(400).json({ error: '必填字段缺失' })
    return
  }
  const result = addBookToBookshelf(id, body.bookId, body.nickname)
  if (!result.success) {
    res.status(400).json({ error: result.error })
    return
  }
  res.status(201).json({ success: true, bookshelfBook: result.bookshelfBook })
})

router.delete('/:id/books/:bookId', (req, res) => {
  const id = parseInt(req.params.id)
  const bookId = parseInt(req.params.bookId)
  const { nickname } = req.body as { nickname?: string }
  if (!nickname) {
    res.status(400).json({ error: '缺少 nickname 参数' })
    return
  }
  const success = removeBookFromBookshelf(id, bookId, nickname)
  if (!success) {
    res.status(404).json({ error: '书单不存在、图书不在书单中或无权操作' })
    return
  }
  res.json({ success: true })
})

router.post('/:id/like', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as ToggleBookshelfLikeRequest
  if (!body.nickname) {
    res.status(400).json({ error: '昵称不能为空' })
    return
  }
  const result = toggleBookshelfLike(id, body.nickname)
  if (!result) {
    res.status(404).json({ error: '书单不存在' })
    return
  }
  res.json(result)
})

export default router
