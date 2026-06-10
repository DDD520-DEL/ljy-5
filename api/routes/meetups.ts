import express from 'express'
import { getDB, addMeetup, registerMeetup, updateMeetupSummary, getPointsAccount } from '../db'
import type { CreateMeetupRequest, RegisterMeetupRequest, UpdateMeetupSummaryRequest } from '../../shared/types'

const router = express.Router()

router.get('/', (req, res) => {
  const db = getDB()
  const { status } = req.query
  let meetups = [...db.meetups]
  
  if (status && typeof status === 'string') {
    meetups = meetups.filter(m => m.status === status)
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
  res.json({ ...meetup, registrations })
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
    registration: result.registration, 
    pointsResult: result.pointsResult 
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

export default router
