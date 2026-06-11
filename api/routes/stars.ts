import express from 'express'
import { getMonthlyStars, getLatestMonthlyStars, calculateMonthlyStars } from '../db'
import type { MonthlyStarsResult } from '../../shared/types'

const router = express.Router()

router.get('/latest', (_req, res) => {
  const result = getLatestMonthlyStars()
  if (!result) {
    res.status(404).json({ error: '暂无月度之星数据' })
    return
  }
  res.json(result)
})

router.get('/:year/:month', (req, res) => {
  const year = parseInt(req.params.year)
  const month = parseInt(req.params.month)
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    res.status(400).json({ error: '无效的年月参数' })
    return
  }
  const result = getMonthlyStars(year, month)
  if (!result) {
    res.status(404).json({ error: '未找到该月份的月度之星数据' })
    return
  }
  res.json(result)
})

router.post('/calculate', (req, res) => {
  const { year, month } = req.body || {}
  let result: MonthlyStarsResult
  if (year !== undefined && month !== undefined) {
    const y = parseInt(year)
    const m = parseInt(month)
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      res.status(400).json({ error: '无效的年月参数' })
      return
    }
    result = calculateMonthlyStars(y, m)
  } else {
    result = calculateMonthlyStars()
  }
  res.json(result)
})

export default router
