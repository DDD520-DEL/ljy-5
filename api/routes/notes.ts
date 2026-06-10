import express from 'express'
import {
  createNote,
  getNoteById,
  getNotesByBook,
  getNotesByUser,
  getHotNotes,
  incrementNoteView,
  toggleNoteLike,
  hasLikedNote,
  getNoteComments,
  addNoteComment,
  updateNote,
  deleteNote,
} from '../db'
import type { CreateNoteRequest, CreateNoteCommentRequest, Note } from '../../shared/types'

const router = express.Router()

router.get('/hot', (req, res) => {
  const { limit = '10', days } = req.query
  const limitNum = parseInt(limit as string) || 10
  const daysNum = days ? parseInt(days as string) : undefined
  const notes = getHotNotes(limitNum, daysNum)
  res.json(notes)
})

router.get('/book/:bookId', (req, res) => {
  const bookId = parseInt(req.params.bookId)
  const { nickname } = req.query
  const includePrivate = !!nickname
  const notes = getNotesByBook(bookId, includePrivate)
  
  if (nickname && typeof nickname === 'string') {
    const userNotes = notes.filter(n => n.nickname === nickname)
    const publicNotes = notes.filter(n => n.visibility === 'public' && n.nickname !== nickname)
    res.json([...userNotes, ...publicNotes])
  } else {
    res.json(notes)
  }
})

router.get('/user/:nickname', (req, res) => {
  const { nickname } = req.params
  const { viewer } = req.query
  let notes = getNotesByUser(decodeURIComponent(nickname))
  
  if (viewer !== nickname) {
    notes = notes.filter(n => n.visibility === 'public')
  }
  
  res.json(notes)
})

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const note = getNoteById(id)
  if (!note) {
    res.status(404).json({ error: '笔记不存在' })
    return
  }
  
  const updatedNote = incrementNoteView(id)
  res.json(updatedNote || note)
})

router.get('/:id/comments', (req, res) => {
  const id = parseInt(req.params.id)
  const note = getNoteById(id)
  if (!note) {
    res.status(404).json({ error: '笔记不存在' })
    return
  }
  const comments = getNoteComments(id)
  res.json(comments)
})

router.get('/:id/liked', (req, res) => {
  const id = parseInt(req.params.id)
  const { nickname } = req.query
  if (!nickname || typeof nickname !== 'string') {
    res.json({ liked: false })
    return
  }
  const liked = hasLikedNote(id, nickname)
  res.json({ liked })
})

router.post('/', (req, res) => {
  const body = req.body as CreateNoteRequest
  if (!body.bookId || !body.nickname || !body.title || !body.content || !body.visibility) {
    res.status(400).json({ error: '必填字段缺失' })
    return
  }
  
  const result = createNote(body)
  res.status(201).json({
    note: result.note,
    pointsResult: result.pointsResult,
  })
})

router.post('/:id/like', (req, res) => {
  const id = parseInt(req.params.id)
  const { nickname } = req.body as { nickname: string }
  if (!nickname) {
    res.status(400).json({ error: '昵称不能为空' })
    return
  }
  
  const result = toggleNoteLike(id, nickname)
  if (!result) {
    res.status(404).json({ error: '笔记不存在' })
    return
  }
  
  res.json(result)
})

router.post('/:id/comments', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as CreateNoteCommentRequest
  if (!body.nickname || !body.content) {
    res.status(400).json({ error: '必填字段缺失' })
    return
  }
  
  const result = addNoteComment(id, body)
  if (!result) {
    res.status(404).json({ error: '笔记不存在' })
    return
  }
  
  res.status(201).json(result)
})

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as Partial<Pick<Note, 'title' | 'content' | 'images' | 'visibility'>>
  const note = updateNote(id, body)
  if (!note) {
    res.status(404).json({ error: '笔记不存在' })
    return
  }
  res.json(note)
})

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const success = deleteNote(id)
  if (!success) {
    res.status(404).json({ error: '笔记不存在' })
    return
  }
  res.json({ success: true })
})

export default router
