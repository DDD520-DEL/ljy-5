import express from 'express'
import { createGuestMessage, getGuestMessages, getAllGuestMessages, getGuestMessageById, deleteGuestMessage, getGuestMessageStats } from '../db'
import type { CreateGuestMessageRequest } from '../../shared/types'

const router = express.Router()

router.get('/stats', (_req, res) => {
  const stats = getGuestMessageStats()
  res.json(stats)
})

router.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 10
  const safePageSize = Math.min(Math.max(pageSize, 1), 50)
  const result = getGuestMessages(page, safePageSize)
  res.json(result)
})

router.get('/all', (_req, res) => {
  const messages = getAllGuestMessages()
  res.json(messages)
})

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const message = getGuestMessageById(id)
  if (!message) {
    res.status(404).json({ error: '留言不存在' })
    return
  }
  res.json(message)
})

router.post('/', (req, res) => {
  const body = req.body as CreateGuestMessageRequest
  if (!body.nickname || !body.nickname.trim()) {
    res.status(400).json({ error: '请填写昵称' })
    return
  }
  if (!body.content || !body.content.trim()) {
    res.status(400).json({ error: '请填写留言内容' })
    return
  }
  const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress
  const result = createGuestMessage({
    nickname: body.nickname,
    content: body.content,
    ip,
  })
  if ('error' in result) {
    res.status(400).json({ error: result.error })
    return
  }
  res.status(201).json({ message: result })
})

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const message = getGuestMessageById(id)
  if (!message) {
    res.status(404).json({ error: '留言不存在' })
    return
  }
  const success = deleteGuestMessage(id)
  if (!success) {
    res.status(500).json({ error: '删除失败' })
    return
  }
  res.json({ success: true })
})

export default router
