import express from 'express'
import { createFeedback, getAllFeedbacks, getFeedbackById, getFeedbacksByNickname, updateFeedbackStatus, getFeedbackStats } from '../db'
import type { CreateFeedbackRequest, UpdateFeedbackStatusRequest, FeedbackStatus, FeedbackType } from '../../shared/types'

const router = express.Router()

router.post('/', (req, res) => {
  const body = req.body as CreateFeedbackRequest
  if (!body.type || !body.content || !body.content.trim()) {
    res.status(400).json({ error: '请填写反馈类型和内容' })
    return
  }
  if (!['feature', 'bug', 'other'].includes(body.type)) {
    res.status(400).json({ error: '反馈类型不正确' })
    return
  }
  if (body.content.trim().length < 5) {
    res.status(400).json({ error: '反馈内容至少需要 5 个字符' })
    return
  }
  const feedback = createFeedback(body)
  res.status(201).json({ feedback })
})

router.get('/stats', (_req, res) => {
  const stats = getFeedbackStats()
  res.json(stats)
})

router.get('/all', (_req, res) => {
  const { status, type } = _req.query
  const filters: { status?: FeedbackStatus; type?: FeedbackType } = {}
  if (status && ['pending', 'processing', 'resolved', 'rejected'].includes(status as string)) {
    filters.status = status as FeedbackStatus
  }
  if (type && ['feature', 'bug', 'other'].includes(type as string)) {
    filters.type = type as FeedbackType
  }
  const feedbacks = getAllFeedbacks(filters)
  res.json(feedbacks)
})

router.get('/user/:nickname', (req, res) => {
  const { nickname } = req.params
  const feedbacks = getFeedbacksByNickname(decodeURIComponent(nickname))
  res.json(feedbacks)
})

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const feedback = getFeedbackById(id)
  if (!feedback) {
    res.status(404).json({ error: '反馈记录不存在' })
    return
  }
  res.json(feedback)
})

router.put('/:id/status', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as UpdateFeedbackStatusRequest
  if (!body.status || !['pending', 'processing', 'resolved', 'rejected'].includes(body.status)) {
    res.status(400).json({ error: '状态值不正确' })
    return
  }
  if (body.status === 'resolved' && (!body.reply || !body.reply.trim())) {
    res.status(400).json({ error: '标记为已解决时必须填写回复内容' })
    return
  }
  const feedback = updateFeedbackStatus(id, body)
  if (!feedback) {
    res.status(404).json({ error: '反馈记录不存在' })
    return
  }
  res.json({ feedback })
})

export default router
