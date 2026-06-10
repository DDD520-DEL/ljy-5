import express from 'express'
import {
  createExchangeListing,
  getExchangeListings,
  getExchangeListingById,
  cancelExchangeListing,
  createExchangeRequest,
  getExchangeRequestsByListing,
  getExchangeRequestById,
  acceptExchangeRequest,
  rejectExchangeRequest,
  completeExchange,
  getExchangeListingsByOwner,
  getExchangeRequestsByRequester,
} from '../db'
import type { CreateExchangeListingRequest, CreateExchangeRequestRequest } from '../../shared/types'

const router = express.Router()

router.get('/', (req, res) => {
  const { category, condition, status, search } = req.query
  const listings = getExchangeListings({
    category: category as string | undefined,
    condition: condition as string | undefined,
    status: status as 'active' | 'exchanged' | 'cancelled' | undefined,
    search: search as string | undefined,
  })
  res.json(listings)
})

router.get('/owner/:nickname', (req, res) => {
  const { nickname } = req.params
  const listings = getExchangeListingsByOwner(decodeURIComponent(nickname))
  res.json(listings)
})

router.get('/requests/by-requester/:nickname', (req, res) => {
  const { nickname } = req.params
  const requests = getExchangeRequestsByRequester(decodeURIComponent(nickname))
  res.json(requests)
})

router.post('/', (req, res) => {
  const body = req.body as CreateExchangeListingRequest
  if (!body.bookTitle || !body.bookAuthor || !body.category || !body.condition || !body.owner) {
    res.status(400).json({ error: '必填字段缺失（书名、作者、分类、新旧程度、挂单人）' })
    return
  }
  if ((!body.wantCategories || body.wantCategories.length === 0) && (!body.wantBookNames || body.wantBookNames.length === 0)) {
    res.status(400).json({ error: '请至少填写一个想换的图书类型或具体书名' })
    return
  }
  const listing = createExchangeListing(body)
  res.status(201).json(listing)
})

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const listing = getExchangeListingById(id)
  if (!listing) {
    res.status(404).json({ error: '交换挂单不存在' })
    return
  }
  const requests = getExchangeRequestsByListing(id)
  res.json({ ...listing, requests, requestCount: requests.length })
})

router.put('/:id/cancel', (req, res) => {
  const id = parseInt(req.params.id)
  const listing = cancelExchangeListing(id)
  if (!listing) {
    res.status(400).json({ error: '取消失败，挂单不存在或状态不允许' })
    return
  }
  res.json(listing)
})

router.post('/:id/request', (req, res) => {
  const listingId = parseInt(req.params.id)
  const body = req.body as CreateExchangeRequestRequest
  if (!body.offeredBookTitle || !body.offeredBookAuthor || !body.offeredBookCategory || !body.offeredBookCondition || !body.requester) {
    res.status(400).json({ error: '必填字段缺失（书名、作者、分类、新旧程度、请求人）' })
    return
  }
  const result = createExchangeRequest(listingId, body)
  if ('error' in result) {
    res.status(400).json({ error: result.error })
    return
  }
  res.status(201).json(result)
})

router.get('/:id/requests', (req, res) => {
  const listingId = parseInt(req.params.id)
  const requests = getExchangeRequestsByListing(listingId)
  res.json(requests)
})

router.post('/requests/:requestId/accept', (req, res) => {
  const requestId = parseInt(req.params.requestId)
  const result = acceptExchangeRequest(requestId)
  if ('error' in result) {
    res.status(400).json({ error: result.error })
    return
  }
  res.json(result)
})

router.post('/requests/:requestId/reject', (req, res) => {
  const requestId = parseInt(req.params.requestId)
  const result = rejectExchangeRequest(requestId)
  if ('error' in result) {
    res.status(400).json({ error: result.error })
    return
  }
  res.json(result)
})

router.post('/requests/:requestId/complete', (req, res) => {
  const requestId = parseInt(req.params.requestId)
  const { operator } = req.body as { operator?: string }
  const result = completeExchange(requestId, operator)
  if ('error' in result) {
    res.status(400).json({ error: result.error })
    return
  }
  res.json(result)
})

export default router
