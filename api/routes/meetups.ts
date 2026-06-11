import express from 'express'
import QRCode from 'qrcode'
import { getDB, addMeetup, registerMeetup, updateMeetupSummary, getPointsAccount, checkInMeetup, getCheckInsByMeetup, getMeetupCheckInStats, getMeetupDiscussionPosts, getMeetupDiscussionPostById, getMeetupDiscussionReplies, addMeetupDiscussionPost, addMeetupDiscussionReply, getHotMeetupDiscussionPosts, createVotingSession, getVotingSession, castVote, endVoting, getVoteRecordsByMeetup } from '../db'
import type { CreateMeetupRequest, RegisterMeetupRequest, UpdateMeetupSummaryRequest, CheckInRequest, CreateMeetupDiscussionPostRequest, CreateMeetupDiscussionReplyRequest, SubmitCandidatesRequest, CastVoteRequest } from '../../shared/types'

const router = express.Router()

router.get('/archive/years', (_req, res) => {
  const db = getDB()
  const finished = db.meetups.filter(m => m.status === 'finished')
  const years = [...new Set(finished.map(m => new Date(m.date).getFullYear()))].sort((a, b) => b - a)
  res.json(years)
})

router.get('/archive/highlights', (req, res) => {
  const db = getDB()
  const { limit = '3' } = req.query
  const limitNum = parseInt(limit as string) || 3
  let finished = db.meetups.filter(m => m.status === 'finished')
  finished.sort((a, b) => b.currentParticipants - a.currentParticipants)
  const top = finished.slice(0, Math.min(limitNum * 3, finished.length))
  const shuffled = top.sort(() => Math.random() - 0.5)
  res.json(shuffled.slice(0, limitNum))
})

router.get('/', (req, res) => {
  const db = getDB()
  const { status, year } = req.query
  let meetups = [...db.meetups]

  if (status && typeof status === 'string') {
    meetups = meetups.filter(m => m.status === status)
  }

  if (year && typeof year === 'string') {
    const yearNum = parseInt(year)
    meetups = meetups.filter(m => new Date(m.date).getFullYear() === yearNum)
  }

  meetups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  res.json(meetups)
})

router.get('/:id', (req, res) => {
  const db = getDB()
  const id = parseInt(req.params.id)
  const meetup = db.meetups.find(m => m.id === id)
  if (!meetup) {
    res.status(404).json({ error: '读书会不存在' })
    return
  }
  
  const registrations = db.registrations.filter(r => r.meetupId === id).map(r => {
    const account = getPointsAccount(r.nickname)
    return { ...r, level: account?.level || null }
  })
  
  const stats = getMeetupCheckInStats(id)
  
  res.json({ ...meetup, registrations, checkIns: stats.checkIns, checkInStats: stats })
})

router.get('/:id/qrcode', async (req, res) => {
  try {
    const db = getDB()
    const id = parseInt(req.params.id)
    const meetup = db.meetups.find(m => m.id === id)
    if (!meetup) {
      res.status(404).json({ error: '读书会不存在' })
      return
    }
    
    const checkInUrl = `${req.protocol}://${req.get('host')}/meetups/${id}/checkin`
    const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#5C4033',
        light: '#FFFFFF'
      }
    })
    
    res.json({
      qrcode: qrCodeDataUrl,
      checkInUrl,
      meetupId: id,
      meetupTitle: meetup.title
    })
  } catch (err) {
    console.error('QR Code generation error:', err)
    res.status(500).json({ error: '二维码生成失败' })
  }
})

router.post('/:id/checkin', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as CheckInRequest
  
  if (!body.nickname) {
    res.status(400).json({ error: '请填写昵称' })
    return
  }
  
  const result = checkInMeetup(id, body.nickname.trim())
  if ('error' in result) {
    res.status(400).json({ error: result.error })
    return
  }
  
  const stats = getMeetupCheckInStats(id)
  res.status(201).json({ ...result, checkInStats: stats })
})

router.get('/:id/checkins', (req, res) => {
  const id = parseInt(req.params.id)
  const db = getDB()
  const meetup = db.meetups.find(m => m.id === id)
  if (!meetup) {
    res.status(404).json({ error: '读书会不存在' })
    return
  }
  
  const stats = getMeetupCheckInStats(id)
  res.json({ checkIns: stats.checkIns, stats })
})

router.post('/', (req, res) => {
  const body = req.body as CreateMeetupRequest
  if (!body.title || !body.description || !body.date || !body.location || !body.maxParticipants) {
    res.status(400).json({ error: '必填字段缺失' })
    return
  }
  const meetup = addMeetup(body)
  res.status(201).json(meetup)
})

router.post('/:id/register', (req, res) => {
  const id = parseInt(req.params.id)
  const db = getDB()
  const meetup = db.meetups.find(m => m.id === id)
  if (!meetup) {
    res.status(404).json({ error: '读书会不存在' })
    return
  }
  
  const body = req.body as RegisterMeetupRequest
  if (!body.nickname) {
    res.status(400).json({ error: '请填写昵称' })
    return
  }
  
  const result = registerMeetup(id, body)
  if (!result) {
    res.status(400).json({ error: '报名人数已满' })
    return
  }
  
  res.status(201).json({ 
    registration: result.registration
  })
})

router.put('/:id/summary', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as UpdateMeetupSummaryRequest
  const meetup = updateMeetupSummary(id, body)
  if (!meetup) {
    res.status(404).json({ error: '读书会不存在' })
    return
  }
  res.json(meetup)
})

router.get('/:id/discussion/posts', (req, res) => {
  const id = parseInt(req.params.id)
  const db = getDB()
  const meetup = db.meetups.find(m => m.id === id)
  if (!meetup) {
    res.status(404).json({ error: '读书会不存在' })
    return
  }
  
  const posts = getMeetupDiscussionPosts(id)
  const postsWithReplies = posts.map(post => ({
    ...post,
    replies: getMeetupDiscussionReplies(post.id)
  }))
  res.json(postsWithReplies)
})

router.get('/:id/discussion/posts/:postId', (req, res) => {
  const id = parseInt(req.params.id)
  const postId = parseInt(req.params.postId)
  const post = getMeetupDiscussionPostById(postId)
  if (!post || post.meetupId !== id) {
    res.status(404).json({ error: '讨论帖不存在' })
    return
  }
  const replies = getMeetupDiscussionReplies(postId)
  res.json({ ...post, replies })
})

router.post('/:id/discussion/posts', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as CreateMeetupDiscussionPostRequest
  if (!body.nickname || !body.title || !body.content) {
    res.status(400).json({ error: '必填字段缺失' })
    return
  }
  const result = addMeetupDiscussionPost(id, {
    nickname: body.nickname.trim(),
    title: body.title.trim(),
    content: body.content.trim(),
    images: body.images,
  })
  if (!result) {
    res.status(404).json({ error: '读书会不存在' })
    return
  }
  res.status(201).json(result)
})

router.post('/:id/discussion/posts/:postId/replies', (req, res) => {
  const id = parseInt(req.params.id)
  const postId = parseInt(req.params.postId)
  const body = req.body as CreateMeetupDiscussionReplyRequest
  if (!body.nickname || !body.content) {
    res.status(400).json({ error: '必填字段缺失' })
    return
  }
  const post = getMeetupDiscussionPostById(postId)
  if (!post || post.meetupId !== id) {
    res.status(404).json({ error: '讨论帖不存在' })
    return
  }
  const result = addMeetupDiscussionReply(postId, {
    nickname: body.nickname.trim(),
    content: body.content.trim(),
    images: body.images,
    parentId: body.parentId,
    replyToNickname: body.replyToNickname,
  })
  if (!result) {
    res.status(404).json({ error: '讨论帖不存在' })
    return
  }
  res.status(201).json(result)
})

router.get('/discussion/hot', (req, res) => {
  const { limit = '10', days } = req.query
  const limitNum = parseInt(limit as string) || 10
  const daysNum = days ? parseInt(days as string) : undefined
  const posts = getHotMeetupDiscussionPosts(limitNum, daysNum)
  const postsWithMeetup = posts.map(post => {
    const db = getDB()
    const meetup = db.meetups.find(m => m.id === post.meetupId)
    return {
      ...post,
      meetupTitle: meetup?.title,
      meetupStatus: meetup?.status,
    }
  })
  res.json(postsWithMeetup)
})

router.post('/:id/voting/candidates', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as SubmitCandidatesRequest

  if (!body.submitter) {
    res.status(400).json({ error: '请填写发起人昵称' })
    return
  }
  if (!body.deadline) {
    res.status(400).json({ error: '请设置投票截止时间' })
    return
  }
  if (!body.candidates || body.candidates.length === 0) {
    res.status(400).json({ error: '请提交候选书目' })
    return
  }

  for (const c of body.candidates) {
    if (!c.title || !c.author) {
      res.status(400).json({ error: '每本候选书目都需要填写书名和作者' })
      return
    }
  }

  const result = createVotingSession(id, body.deadline, body.submitter, body.candidates)
  if ('error' in result) {
    res.status(400).json({ error: result.error })
    return
  }
  res.status(201).json(result)
})

router.get('/:id/voting', (req, res) => {
  const id = parseInt(req.params.id)
  const { nickname } = req.query
  const session = getVotingSession(id, typeof nickname === 'string' ? nickname : undefined)
  if (!session) {
    res.status(404).json({ error: '投票会话不存在' })
    return
  }
  res.json(session)
})

router.post('/:id/voting/vote', (req, res) => {
  const id = parseInt(req.params.id)
  const body = req.body as CastVoteRequest

  if (!body.nickname) {
    res.status(400).json({ error: '请填写昵称' })
    return
  }
  if (!body.candidateId) {
    res.status(400).json({ error: '请选择候选书目' })
    return
  }

  const result = castVote(id, body.nickname.trim(), body.candidateId)
  if ('error' in result) {
    res.status(400).json({ error: result.error })
    return
  }

  const session = getVotingSession(id, body.nickname.trim())
  res.status(201).json({ ...result, session })
})

router.post('/:id/voting/end', (req, res) => {
  const id = parseInt(req.params.id)
  const db = getDB()
  const session = db.votingSessions.find(s => s.meetupId === id)
  if (!session) {
    res.status(404).json({ error: '投票会话不存在' })
    return
  }
  const result = endVoting(session.id)
  if ('error' in result) {
    res.status(400).json({ error: result.error })
    return
  }
  const updatedSession = getVotingSession(id)
  res.json({ session: result, voting: updatedSession })
})

router.get('/:id/voting/records', (req, res) => {
  const id = parseInt(req.params.id)
  const db = getDB()
  const meetup = db.meetups.find(m => m.id === id)
  if (!meetup) {
    res.status(404).json({ error: '读书会不存在' })
    return
  }
  const records = getVoteRecordsByMeetup(id)
  res.json({ records, total: records.length })
})

export default router
