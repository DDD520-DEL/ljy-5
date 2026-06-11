import express from 'express'
import {
  createReadingCheckIn,
  getReadingCheckInsByUser,
  getReadingCheckInStats,
  getReadingHeatmapData,
} from '../db'
import type { CreateReadingCheckInRequest } from '../../shared/types'

const router = express.Router()

router.post('/', (req, res) => {
  try {
    const data = req.body as CreateReadingCheckInRequest
    if (!data.nickname || !data.bookTitle || !data.durationMinutes) {
      res.status(400).json({ error: '缺少必填字段' })
      return
    }
    if (data.durationMinutes <= 0) {
      res.status(400).json({ error: '阅读时长必须大于0' })
      return
    }
    const result = createReadingCheckIn(data)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : '打卡失败' })
  }
})

router.get('/user/:nickname', (req, res) => {
  const { nickname } = req.params
  const { limit } = req.query
  const limitNum = limit ? parseInt(limit as string) : undefined
  const checkIns = getReadingCheckInsByUser(decodeURIComponent(nickname), limitNum)
  res.json(checkIns)
})

router.get('/stats/:nickname', (req, res) => {
  const { nickname } = req.params
  const stats = getReadingCheckInStats(decodeURIComponent(nickname))
  res.json(stats)
})

router.get('/heatmap/:nickname', (req, res) => {
  const { nickname } = req.params
  const { days } = req.query
  const daysNum = days ? parseInt(days as string) : 365
  const data = getReadingHeatmapData(decodeURIComponent(nickname), daysNum)
  res.json(data)
})

export default router
