import express from 'express'
import QRCode from 'qrcode'
import { createDonationReview, getPendingDonationReviews, getAllDonationReviews, getDonationReviewById, approveDonationReview, rejectDonationReview, getDonationReviewsByDonor, getDB } from '../db'
import type { SubmitDonationRequest, ApproveDonationRequest, RejectDonationRequest } from '../../shared/types'

const router = express.Router()

router.post('/submit', (req, res) => {
  const body = req.body as SubmitDonationRequest
  if (!body.title || !body.author || !body.category || !body.donor) {
    res.status(400).json({ error: '必填字段缺失（书名、作者、分类、捐赠者昵称）' })
    return
  }
  const review = createDonationReview(body)
  res.status(201).json({ review })
})

router.get('/pending', (_req, res) => {
  const reviews = getPendingDonationReviews()
  res.json(reviews)
})

router.get('/all', (_req, res) => {
  const reviews = getAllDonationReviews()
  res.json(reviews)
})

router.get('/donor/:nickname', (req, res) => {
  const { nickname } = req.params
  const reviews = getDonationReviewsByDonor(decodeURIComponent(nickname))
  res.json(reviews)
})

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const review = getDonationReviewById(id)
  if (!review) {
    res.status(404).json({ error: '捐赠审核记录不存在' })
    return
  }
  res.json(review)
})

router.post('/:id/approve', async (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as ApproveDonationRequest
  const result = approveDonationReview(id, body)
  if (!result) {
    res.status(400).json({ error: '审核失败，记录不存在或已处理' })
    return
  }

  let qrcodeData: { qrcode: string; traceId: string; traceUrl: string } | null = null
  try {
    const db = getDB()
    const publicBaseUrl = process.env.PUBLIC_BASE_URL ||
      `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers['x-forwarded-host'] || req.get('host')}`
    const traceUrl = `${publicBaseUrl}/trace/${result.book.traceId}`
    const qrcode = await QRCode.toDataURL(traceUrl, {
      width: 256,
      margin: 2,
      color: { dark: '#6F4E37', light: '#FFFFFF' },
    })
    qrcodeData = { qrcode, traceId: result.book.traceId, traceUrl }
  } catch (err) {
    console.error('QR code generation failed:', err)
  }

  res.json({
    review: result.review,
    book: result.book,
    pointsResult: result.pointsResult,
    qrcode: qrcodeData,
  })
})

router.post('/:id/reject', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as RejectDonationRequest
  if (!body.reviewNote || !body.reviewNote.trim()) {
    res.status(400).json({ error: '驳回原因不能为空' })
    return
  }
  const review = rejectDonationReview(id, body.reviewNote, body.reviewer)
  if (!review) {
    res.status(400).json({ error: '驳回失败，记录不存在或已处理' })
    return
  }
  res.json({ review })
})

export default router
