import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Users,
  User,
  Image,
  FileText,
  UserPlus,
  Check,
  Send,
  ArrowLeft,
  Book,
  Edit3,
  X,
  CalendarDays,
  QrCode,
  BarChart3,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Download,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Reply,
  ImagePlus,
  Vote,
  Plus,
  Minus,
  Trophy,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { meetupApi, bookApi } from '@/lib/api'
import {
  meetupStatusLabel,
  meetupStatusColor,
  readerLevelLabel,
  readerLevelColor,
  formatDateTime,
  cn,
  formatDate,
  votingStatusLabel,
  votingStatusColor,
} from '@/lib/utils'
import type { Meetup, Registration, Book as BookType, ReaderLevel, CheckIn, MeetupCheckInStats, MeetupDiscussionPostWithReplies, MeetupDiscussionReply, VotingSessionWithCandidates, VoteCandidate, SubmitCandidatesRequest } from '../../shared/types'

export default function MeetupDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [meetup, setMeetup] = useState<(Meetup & {
    registrations: (Registration & { level?: string })[]
    checkIns: CheckIn[]
    checkInStats: MeetupCheckInStats
  }) | null>(null)
  const [recommendedBook, setRecommendedBook] = useState<BookType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nickname, setNickname] = useState('')
  const [contact, setContact] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registerSuccess, setRegisterSuccess] = useState(false)

  const [photoUrls, setPhotoUrls] = useState('')
  const [discussionNotes, setDiscussionNotes] = useState('')
  const [updatingSummary, setUpdatingSummary] = useState(false)

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const [qrCodeData, setQrCodeData] = useState<{ qrcode: string; checkInUrl: string; meetupTitle: string } | null>(null)
  const [qrCodeLoading, setQrCodeLoading] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)

  const [refreshing, setRefreshing] = useState(false)

  const [discussionPosts, setDiscussionPosts] = useState<MeetupDiscussionPostWithReplies[]>([])
  const [discussionLoading, setDiscussionLoading] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null)

  const [showPostForm, setShowPostForm] = useState(false)
  const [newPostNickname, setNewPostNickname] = useState('')
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostImages, setNewPostImages] = useState('')
  const [submittingPost, setSubmittingPost] = useState(false)

  const [replyToPostId, setReplyToPostId] = useState<number | null>(null)
  const [replyToReplyId, setReplyToReplyId] = useState<number | null>(null)
  const [replyToNickname, setReplyToNickname] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [replyImages, setReplyImages] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  const [votingSession, setVotingSession] = useState<VotingSessionWithCandidates | null>(null)
  const [votingNickname, setVotingNickname] = useState('')
  const [castingVote, setCastingVote] = useState(false)
  const [showCandidateForm, setShowCandidateForm] = useState(false)
  const [candidateSubmitter, setCandidateSubmitter] = useState('')
  const [candidateDeadline, setCandidateDeadline] = useState('')
  const [candidateBooks, setCandidateBooks] = useState<Array<{ title: string; author: string; coverImage: string; description: string }>>([
    { title: '', author: '', coverImage: '', description: '' },
    { title: '', author: '', coverImage: '', description: '' },
    { title: '', author: '', coverImage: '', description: '' },
  ])
  const [submittingCandidates, setSubmittingCandidates] = useState(false)
  const [endingVoting, setEndingVoting] = useState(false)

  const isAdmin = true

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await meetupApi.get(Number(id))
      setMeetup(data)

      if (data.groupPhotos) {
        setPhotoUrls(data.groupPhotos.join('\n'))
      }
      if (data.discussionNotes) {
        setDiscussionNotes(data.discussionNotes)
      }

      if (data.bookId) {
        try {
          const book = await bookApi.get(data.bookId)
          setRecommendedBook(book)
        } catch (err) {
          console.error('Failed to load recommended book:', err)
        }
      }

      loadDiscussionPosts()
      loadVotingSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  async function loadDiscussionPosts() {
    try {
      setDiscussionLoading(true)
      const posts = await meetupApi.getDiscussionPosts(Number(id))
      setDiscussionPosts(posts)
    } catch (err) {
      console.error('Failed to load discussion posts:', err)
    } finally {
      setDiscussionLoading(false)
    }
  }

  async function loadVotingSession(nicknameArg?: string) {
    try {
      const data = await meetupApi.getVoting(Number(id), nicknameArg || votingNickname || undefined)
      setVotingSession(data)
    } catch {
      setVotingSession(null)
    }
  }

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id, loadData])

  useEffect(() => {
    if (!id) return
    const interval = setInterval(() => {
      meetupApi.get(Number(id)).then(data => {
        setMeetup(prev => prev ? { ...prev, checkIns: data.checkIns, checkInStats: data.checkInStats, registrations: data.registrations } : data)
      }).catch(() => {})
    }, 5000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    if (!id || !votingSession || votingSession.status !== 'voting') return
    const interval = setInterval(() => {
      meetupApi.getVoting(Number(id), votingNickname || undefined).then(data => {
        setVotingSession(data)
      }).catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [id, votingSession?.status, votingNickname])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!meetup || !nickname.trim()) return

    try {
      setRegistering(true)
      await meetupApi.register(meetup.id, {
        nickname: nickname.trim(),
        contact: contact.trim() || undefined,
      })
      setRegisterSuccess(true)
      setNickname('')
      setContact('')
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '报名失败')
    } finally {
      setRegistering(false)
    }
  }

  async function handleUpdateSummary() {
    if (!meetup) return

    try {
      setUpdatingSummary(true)
      const photos = photoUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      await meetupApi.updateSummary(meetup.id, {
        groupPhotos: photos.length > 0 ? photos : undefined,
        discussionNotes: discussionNotes.trim() || undefined,
      })
      alert('活动总结更新成功')
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新失败')
    } finally {
      setUpdatingSummary(false)
    }
  }

  async function handleLoadQrCode() {
    if (!meetup) return
    try {
      setQrCodeLoading(true)
      const data = await meetupApi.getQrcode(meetup.id)
      setQrCodeData(data)
      setShowQrCode(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : '二维码加载失败')
    } finally {
      setQrCodeLoading(false)
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true)
      await loadData()
    } finally {
      setRefreshing(false)
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!meetup || !newPostNickname.trim() || !newPostTitle.trim() || !newPostContent.trim()) return

    try {
      setSubmittingPost(true)
      const images = newPostImages
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      await meetupApi.createDiscussionPost(meetup.id, {
        nickname: newPostNickname.trim(),
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        images: images.length > 0 ? images : undefined,
      })

      setNewPostNickname('')
      setNewPostTitle('')
      setNewPostContent('')
      setNewPostImages('')
      setShowPostForm(false)
      await loadDiscussionPosts()
    } catch (err) {
      alert(err instanceof Error ? err.message : '发帖失败')
    } finally {
      setSubmittingPost(false)
    }
  }

  function handleStartReply(postId: number, replyId?: number, nickname?: string) {
    setReplyToPostId(postId)
    setReplyToReplyId(replyId || null)
    setReplyToNickname(nickname || '')
    setReplyContent('')
    setReplyImages('')
    setExpandedPostId(postId)
  }

  function handleCancelReply() {
    setReplyToPostId(null)
    setReplyToReplyId(null)
    setReplyToNickname('')
    setReplyContent('')
    setReplyImages('')
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault()
    if (!meetup || !replyToPostId || !replyContent.trim()) return

    try {
      setSubmittingReply(true)
      const images = replyImages
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0)

      await meetupApi.createDiscussionReply(meetup.id, replyToPostId, {
        nickname: replyToNickname || '匿名',
        content: replyContent.trim(),
        images: images.length > 0 ? images : undefined,
        parentId: replyToReplyId || undefined,
        replyToNickname: replyToNickname || undefined,
      })

      handleCancelReply()
      await loadDiscussionPosts()
    } catch (err) {
      alert(err instanceof Error ? err.message : '回复失败')
    } finally {
      setSubmittingReply(false)
    }
  }

  function togglePostExpand(postId: number) {
    setExpandedPostId(expandedPostId === postId ? null : postId)
  }

  async function handleSubmitCandidates(e: React.FormEvent) {
    e.preventDefault()
    if (!meetup) return

    const validBooks = candidateBooks.filter(b => b.title.trim() && b.author.trim())
    if (validBooks.length < 3 || validBooks.length > 5) {
      alert('候选书目数量必须在 3-5 本之间')
      return
    }
    if (!candidateSubmitter.trim()) {
      alert('请填写发起人昵称')
      return
    }
    if (!candidateDeadline) {
      alert('请设置投票截止时间')
      return
    }

    try {
      setSubmittingCandidates(true)
      await meetupApi.submitCandidates(meetup.id, {
        submitter: candidateSubmitter.trim(),
        deadline: new Date(candidateDeadline).toISOString(),
        candidates: validBooks.map(b => ({
          title: b.title.trim(),
          author: b.author.trim(),
          coverImage: b.coverImage.trim() || undefined,
          description: b.description.trim() || undefined,
        })),
      })
      setShowCandidateForm(false)
      setCandidateSubmitter('')
      setCandidateDeadline('')
      setCandidateBooks([
        { title: '', author: '', coverImage: '', description: '' },
        { title: '', author: '', coverImage: '', description: '' },
        { title: '', author: '', coverImage: '', description: '' },
      ])
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmittingCandidates(false)
    }
  }

  async function handleCastVote(candidateId: number) {
    if (!meetup || !votingNickname.trim()) return

    try {
      setCastingVote(true)
      await meetupApi.castVote(meetup.id, {
        nickname: votingNickname.trim(),
        candidateId,
      })
      await loadVotingSession(votingNickname.trim())
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '投票失败')
    } finally {
      setCastingVote(false)
    }
  }

  async function handleEndVoting() {
    if (!meetup) return

    try {
      setEndingVoting(true)
      await meetupApi.endVoting(meetup.id)
      await loadVotingSession()
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '结束投票失败')
    } finally {
      setEndingVoting(false)
    }
  }

  function addCandidateBook() {
    if (candidateBooks.length >= 5) return
    setCandidateBooks([...candidateBooks, { title: '', author: '', coverImage: '', description: '' }])
  }

  function removeCandidateBook(index: number) {
    if (candidateBooks.length <= 3) return
    setCandidateBooks(candidateBooks.filter((_, i) => i !== index))
  }

  function updateCandidateBook(index: number, field: string, value: string) {
    const updated = [...candidateBooks]
    updated[index] = { ...updated[index], [field]: value }
    setCandidateBooks(updated)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-white rounded-lg w-32 animate-pulse" />
        <div className="card overflow-hidden">
          <div className="h-64 bg-coffee-100 animate-pulse" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-coffee-100 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-coffee-100 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-coffee-100 rounded w-2/3 animate-pulse" />
            <div className="h-24 bg-coffee-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !meetup) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-coffee-300 mx-auto mb-4" />
          <p className="text-coffee-600 font-medium mb-1">{error || '活动不存在'}</p>
          <Link to="/meetups" className="btn-primary inline-flex items-center gap-2 mt-4">
            返回活动列表
          </Link>
        </div>
      </div>
    )
  }

  const progress = Math.min(
    (meetup.currentParticipants / meetup.maxParticipants) * 100,
    100
  )
  const isFull = meetup.currentParticipants >= meetup.maxParticipants
  const isFinished = meetup.status === 'finished'
  const isOngoing = meetup.status === 'ongoing' || meetup.status === 'upcoming'

  const { totalRegistered, totalCheckedIn, checkInRate } = meetup.checkInStats || {
    totalRegistered: meetup.registrations.length,
    totalCheckedIn: meetup.registrations.filter(r => r.checkedIn).length,
    checkInRate: meetup.registrations.length > 0
      ? Math.round((meetup.registrations.filter(r => r.checkedIn).length / meetup.registrations.length) * 100)
      : 0,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          刷新
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="relative h-56 md:h-72 bg-gradient-to-br from-coffee-100 to-coffee-200 overflow-hidden">
          {meetup.coverImage ? (
            <img
              src={meetup.coverImage}
              alt={meetup.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CalendarDays className="w-20 h-20 text-coffee-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-4 right-4">
            <span className={cn('badge border text-sm px-3 py-1', meetupStatusColor[meetup.status])}>
              {meetupStatusLabel[meetup.status]}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="page-title text-white drop-shadow-lg">{meetup.title}</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-coffee-600">
              <div className="w-10 h-10 rounded-lg bg-coffee-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-coffee-500" />
              </div>
              <div>
                <p className="text-xs text-coffee-400">活动时间</p>
                <p className="font-medium text-coffee-800">{formatDateTime(meetup.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-coffee-600">
              <div className="w-10 h-10 rounded-lg bg-coffee-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-coffee-500" />
              </div>
              <div>
                <p className="text-xs text-coffee-400">活动地点</p>
                <p className="font-medium text-coffee-800">{meetup.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-coffee-600">
              <div className="w-10 h-10 rounded-lg bg-coffee-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-coffee-500" />
              </div>
              <div>
                <p className="text-xs text-coffee-400">人数限制</p>
                <p className="font-medium text-coffee-800">最多 {meetup.maxParticipants} 人</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-coffee-600">
                <Users className="w-4 h-4 text-coffee-400" />
                <span>报名进度</span>
              </div>
              <span className="font-medium text-coffee-800">
                {meetup.currentParticipants} / {meetup.maxParticipants}
              </span>
            </div>
            <div className="h-3 bg-coffee-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  'bg-gradient-to-r from-coffee-500 via-brass-500 to-coffee-600'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            {isFull && (
              <p className="text-xs text-amber-600 font-medium">活动已满员</p>
            )}
          </div>

          {totalRegistered > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-coffee-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>签到进度</span>
                  {isOngoing && (
                    <span className="inline-flex items-center gap-1 text-xs text-coffee-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      实时更新
                    </span>
                  )}
                </div>
                <span className="font-medium text-coffee-800">
                  {totalCheckedIn} / {totalRegistered} 人 ({checkInRate}%)
                </span>
              </div>
              <div className="h-3 bg-coffee-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  )}
                  style={{ width: `${checkInRate}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="section-title flex items-center gap-2">
              <FileText className="w-4 h-4" />
              活动描述
            </h3>
            <p className="text-coffee-600 leading-relaxed whitespace-pre-wrap">
              {meetup.description}
            </p>
          </div>

          {isAdmin && isOngoing && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleLoadQrCode}
                disabled={qrCodeLoading}
                className="btn-primary inline-flex items-center gap-2 flex-1 justify-center"
              >
                <QrCode className="w-4 h-4" />
                {qrCodeLoading ? '加载中...' : '生成签到二维码'}
              </button>
              <Link
                to={`/meetups/${meetup.id}/checkin`}
                className="btn-secondary inline-flex items-center gap-2"
                target="_blank"
              >
                <ExternalLink className="w-4 h-4" />
                打开签到页
              </Link>
            </div>
          )}
        </div>
      </div>

      {showQrCode && qrCodeData && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQrCode(false)}
        >
          <button
            onClick={() => setShowQrCode(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="card p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-serif font-bold text-coffee-900 mb-2">
              现场签到二维码
            </h3>
            <p className="text-coffee-500 text-sm mb-6">
              {qrCodeData.meetupTitle}
            </p>
            <div className="p-4 bg-white rounded-xl border border-coffee-100 mb-6">
              <img
                src={qrCodeData.qrcode}
                alt="签到二维码"
                className="w-full h-auto"
              />
            </div>
            <p className="text-sm text-coffee-500 mb-4">
              参与者使用手机扫码即可完成签到
            </p>
            <div className="flex gap-3">
              <a
                href={qrCodeData.qrcode}
                download={`签到二维码-${meetup.title}.png`}
                className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载
              </a>
              <Link
                to={`/meetups/${meetup.id}/checkin`}
                target="_blank"
                className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                onClick={() => setShowQrCode(false)}
              >
                <ExternalLink className="w-4 h-4" />
                打开页面
              </Link>
            </div>
          </div>
        </div>
      )}

      {recommendedBook && (
        <div className="card p-6">
          <h3 className="section-title flex items-center gap-2 mb-4">
            <Book className="w-4 h-4" />
            本期推荐图书
          </h3>
          <Link
            to={`/books/${recommendedBook.id}`}
            className={cn(
              'flex gap-4 p-4 rounded-xl bg-coffee-50/50 border border-coffee-100',
              'hover:bg-coffee-50 hover:border-coffee-200 transition-all duration-200 group'
            )}
          >
            <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-coffee-100">
              {recommendedBook.coverImage ? (
                <img
                  src={recommendedBook.coverImage}
                  alt={recommendedBook.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-coffee-300">
                  <Book className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-medium text-coffee-900 group-hover:text-coffee-700 transition-colors">
                {recommendedBook.title}
              </h4>
              <p className="text-sm text-coffee-500 mt-1">{recommendedBook.author}</p>
              {recommendedBook.description && (
                <p className="text-sm text-coffee-400 mt-2 line-clamp-2">
                  {recommendedBook.description}
                </p>
              )}
            </div>
          </Link>
        </div>
      )}

      {isFinished && totalRegistered > 0 && (
        <div className="card p-6 border-2 border-brass-400/30">
          <h3 className="section-title flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-brass-500" />
            <span className="text-brass-600">签到率统计</span>
            <span className="badge border bg-brass-400/10 text-brass-600 border-brass-400/30 ml-2">
              活动已结束
            </span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-coffee-50/50 border border-coffee-100">
              <div className="text-3xl font-bold text-coffee-800">{totalRegistered}</div>
              <div className="text-sm text-coffee-500 mt-1">报名人数</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="text-3xl font-bold text-emerald-600">{totalCheckedIn}</div>
              <div className="text-sm text-emerald-500 mt-1">签到人数</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-brass-50 to-amber-50 border border-brass-200">
              <div className="text-3xl font-bold text-brass-600">{checkInRate}%</div>
              <div className="text-sm text-brass-500 mt-1">签到率</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {totalRegistered > totalCheckedIn && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-700">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  有 {totalRegistered - totalCheckedIn} 人报名但未签到，未获得积分奖励
                </span>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                已签到 {totalCheckedIn} 人，每人获得 15 积分奖励，共发放 {totalCheckedIn * 15} 积分
              </span>
            </div>
          </div>
        </div>
      )}

      {!isFinished && (
        <div className="card p-6">
          <h3 className="section-title flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4" />
            活动报名
          </h3>

          {registerSuccess ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-forest-500/10 border border-forest-500/20">
              <div className="w-10 h-10 rounded-full bg-forest-500/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-forest-500" />
              </div>
              <div>
                <p className="font-medium text-forest-600">报名成功！</p>
                <p className="text-sm text-forest-500/80">请在活动开始后扫码签到，即可获得 +15 积分</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label">昵称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入您的昵称"
                  disabled={isFull || registering}
                  className={cn('input-field', (isFull || registering) && 'opacity-50 cursor-not-allowed')}
                  required
                />
              </div>
              <div>
                <label className="label">联系方式 <span className="text-coffee-400 text-xs">（选填）</span></label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="手机号或微信，方便活动通知"
                  disabled={isFull || registering}
                  className={cn('input-field', (isFull || registering) && 'opacity-50 cursor-not-allowed')}
                />
              </div>
              <p className="text-xs text-coffee-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                活动现场扫码签到后可获得 +15 积分奖励
              </p>
              <button
                type="submit"
                disabled={isFull || registering || !nickname.trim()}
                className={cn(
                  'btn-primary w-full inline-flex items-center justify-center gap-2',
                  (isFull || registering || !nickname.trim()) && 'opacity-50 cursor-not-allowed hover:bg-coffee-700 hover:translate-y-0'
                )}
              >
                {registering ? (
                  <>报名中...</>
                ) : isFull ? (
                  <>活动已满员</>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    提交报名
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {isFinished && (
        <>
          {meetup.groupPhotos && meetup.groupPhotos.length > 0 && (
            <div className="card p-6">
              <h3 className="section-title flex items-center gap-2 mb-4">
                <Image className="w-4 h-4" />
                活动合影
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {meetup.groupPhotos.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedPhoto(photo)}
                    className="aspect-square rounded-lg overflow-hidden bg-coffee-100 cursor-pointer group relative"
                  >
                    <img
                      src={photo}
                      alt={`活动照片 ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {meetup.discussionNotes && (
            <div className="card p-6">
              <h3 className="section-title flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4" />
                讨论纪要
              </h3>
              <div className="p-4 rounded-xl bg-coffee-50/50 border border-coffee-100">
                <p className="text-coffee-700 leading-relaxed whitespace-pre-wrap">
                  {meetup.discussionNotes}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {isAdmin && isFinished && (
        <div className="card p-6 border-2 border-brass-400/30">
          <h3 className="section-title flex items-center gap-2 mb-4">
            <Edit3 className="w-4 h-4 text-brass-500" />
            <span className="text-brass-600">上传活动总结</span>
            <span className="badge border bg-brass-400/10 text-brass-600 border-brass-400/30 ml-2">
              管理员
            </span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">合影照片 URL</label>
              <textarea
                value={photoUrls}
                onChange={(e) => setPhotoUrls(e.target.value)}
                placeholder="每行一个图片 URL"
                rows={4}
                className="input-field resize-none font-mono text-sm"
              />
              <p className="text-xs text-coffee-400 mt-1">每行填写一个图片链接</p>
            </div>
            <div>
              <label className="label">讨论纪要</label>
              <textarea
                value={discussionNotes}
                onChange={(e) => setDiscussionNotes(e.target.value)}
                placeholder="记录本次活动的讨论内容、精彩观点等..."
                rows={6}
                className="input-field resize-none"
              />
            </div>
            <button
              onClick={handleUpdateSummary}
              disabled={updatingSummary}
              className={cn(
                'btn-primary inline-flex items-center gap-2',
                updatingSummary && 'opacity-50 cursor-not-allowed'
              )}
            >
              {updatingSummary ? (
                <>更新中...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  保存活动总结
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {isFinished && !votingSession && (
        <div className="card p-6 border-2 border-dashed border-blue-300/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2 mb-0">
              <Vote className="w-4 h-4 text-blue-500" />
              <span className="text-blue-600">下期书目投票</span>
              <span className="badge border bg-gray-50 text-gray-500 border-gray-200 ml-2">
                未开始
              </span>
            </h3>
            {isAdmin && (
              <button
                onClick={() => setShowCandidateForm(!showCandidateForm)}
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                发起投票
              </button>
            )}
          </div>
          <p className="text-coffee-500 text-sm">
            活动已结束，发起人可提交 3-5 本候选图书供下期活动投票。
          </p>

          {showCandidateForm && (
            <form onSubmit={handleSubmitCandidates} className="mt-5 space-y-4 p-5 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">发起人昵称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={candidateSubmitter}
                    onChange={(e) => setCandidateSubmitter(e.target.value)}
                    placeholder="请输入昵称"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">投票截止时间 <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={candidateDeadline}
                    onChange={(e) => setCandidateDeadline(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">候选书目 <span className="text-red-500">*</span>（3-5 本）</label>
                  {candidateBooks.length < 5 && (
                    <button
                      type="button"
                      onClick={addCandidateBook}
                      className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      添加书目
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {candidateBooks.map((book, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white border border-blue-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-coffee-700">候选书目 {index + 1}</span>
                        {candidateBooks.length > 3 && (
                          <button
                            type="button"
                            onClick={() => removeCandidateBook(index)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            value={book.title}
                            onChange={(e) => updateCandidateBook(index, 'title', e.target.value)}
                            placeholder="书名"
                            className="input-field text-sm"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={book.author}
                            onChange={(e) => updateCandidateBook(index, 'author', e.target.value)}
                            placeholder="作者"
                            className="input-field text-sm"
                            required
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={book.coverImage}
                        onChange={(e) => updateCandidateBook(index, 'coverImage', e.target.value)}
                        placeholder="封面图片 URL（选填）"
                        className="input-field text-sm"
                      />
                      <input
                        type="text"
                        value={book.description}
                        onChange={(e) => updateCandidateBook(index, 'description', e.target.value)}
                        placeholder="简介（选填）"
                        className="input-field text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submittingCandidates}
                  className={cn(
                    'btn-primary inline-flex items-center gap-2',
                    submittingCandidates && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {submittingCandidates ? (
                    <>提交中...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      提交候选书目
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCandidateForm(false)}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  取消
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {votingSession && (
        <div className="card p-6 border-2 border-blue-300/50">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-blue-500" />
              <h3 className="section-title mb-0">下期书目投票</h3>
              <span className={cn('badge border ml-2', votingStatusColor[votingSession.status])}>
                {votingStatusLabel[votingSession.status]}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {votingSession.status === 'voting' && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  实时更新
                </span>
              )}
              {isAdmin && votingSession.status === 'voting' && (
                <button
                  onClick={handleEndVoting}
                  disabled={endingVoting}
                  className="btn-secondary text-sm inline-flex items-center gap-1.5"
                >
                  {endingVoting ? '结束中...' : '结束投票'}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-coffee-500 mb-5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              截止时间：{formatDateTime(votingSession.deadline)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              已投票：{votingSession.totalVotes} 人
            </span>
          </div>

          {votingSession.status === 'ended' && votingSession.winningBookTitle && (
            <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-amber-600 font-medium">下期共读书目已确定</p>
                  <p className="text-lg font-bold text-amber-800 mt-0.5">《{votingSession.winningBookTitle}》</p>
                </div>
              </div>
            </div>
          )}

          {votingSession.status === 'voting' && !votingSession.userVotedCandidateId && (
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-3">
                <label className="label mb-0">您的昵称</label>
                <input
                  type="text"
                  value={votingNickname}
                  onChange={(e) => setVotingNickname(e.target.value)}
                  placeholder="输入昵称后即可投票"
                  className="input-field text-sm max-w-xs"
                  onBlur={() => {
                    if (votingNickname.trim()) loadVotingSession()
                  }}
                />
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>每人限投 1 票，投票后不可更改，请慎重选择。</span>
              </div>
            </div>
          )}

          {votingSession.status === 'voting' && votingSession.userVotedCandidateId && (
            <div className="mb-5 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>您已投票，感谢参与！结果将在投票截止后公布。</span>
            </div>
          )}

          <div className="space-y-3">
            {votingSession.candidates.map((candidate, index) => {
              const isWinner = votingSession.status === 'ended' && candidate.id === votingSession.winningCandidateId
              const isVoted = votingSession.userVotedCandidateId === candidate.id
              const maxVotes = Math.max(...votingSession.candidates.map(c => c.voteCount), 1)
              const progressPercent = votingSession.totalVotes > 0
                ? Math.round((candidate.voteCount / votingSession.totalVotes) * 100)
                : 0
              const barWidth = votingSession.totalVotes > 0
                ? (candidate.voteCount / maxVotes) * 100
                : 0

              return (
                <div
                  key={candidate.id}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200',
                    isWinner
                      ? 'border-amber-300 bg-gradient-to-r from-amber-50/80 to-yellow-50/50'
                      : isVoted
                      ? 'border-blue-200 bg-blue-50/30'
                      : 'border-coffee-100 bg-white hover:border-coffee-200'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {isWinner ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-medium text-coffee-900 flex items-center gap-2">
                            《{candidate.title}》
                            {isWinner && (
                              <span className="badge border bg-amber-100 text-amber-700 border-amber-300 text-xs">
                                得票最高
                              </span>
                            )}
                            {isVoted && (
                              <span className="badge border bg-blue-100 text-blue-600 border-blue-200 text-xs">
                                已投票
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-coffee-500 mt-0.5">{candidate.author}</p>
                          {candidate.description && (
                            <p className="text-xs text-coffee-400 mt-1 line-clamp-2">{candidate.description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-coffee-800">{candidate.voteCount}</div>
                          <div className="text-xs text-coffee-400">票</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-2 bg-coffee-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-700',
                              isWinner
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                                : isVoted
                                ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                                : 'bg-gradient-to-r from-coffee-400 to-coffee-500'
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <p className="text-xs text-coffee-400 mt-1">{progressPercent}% 占比</p>
                      </div>
                    </div>
                  </div>
                  {votingSession.status === 'voting' && !votingSession.userVotedCandidateId && votingNickname.trim() && (
                    <div className="mt-3 pt-3 border-t border-coffee-100">
                      <button
                        onClick={() => handleCastVote(candidate.id)}
                        disabled={castingVote}
                        className={cn(
                          'btn-primary text-sm py-1.5 px-4 inline-flex items-center gap-1.5',
                          castingVote && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Vote className="w-3.5 h-3.5" />
                        投一票
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {totalRegistered > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2 mb-0">
              <Users className="w-4 h-4" />
              报名名单
              <span className="badge bg-coffee-100 text-coffee-600 ml-2">
                共 {meetup.registrations.length} 人
              </span>
            </h3>
            {isOngoing && (
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle className="w-3 h-3" />
                  已签到 {totalCheckedIn}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-coffee-100 text-coffee-600">
                  <Clock className="w-3 h-3" />
                  待签到 {totalRegistered - totalCheckedIn}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {meetup.registrations.map((reg) => {
              const isCheckedIn = reg.checkedIn
              return (
                <Link
                  key={reg.id}
                  to={`/readers/${encodeURIComponent(reg.nickname)}`}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 group',
                    isCheckedIn
                      ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'
                      : 'bg-coffee-50/50 border-coffee-100 hover:bg-coffee-50 hover:border-coffee-200'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative',
                    isCheckedIn
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                      : 'bg-gradient-to-br from-coffee-400 to-coffee-600'
                  )}>
                    <span className="text-white text-sm font-medium">
                      {reg.nickname.charAt(0)}
                    </span>
                    {isCheckedIn && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-sm font-medium truncate group-hover:transition-colors',
                      isCheckedIn ? 'text-emerald-700 group-hover:text-emerald-600' : 'text-coffee-800 group-hover:text-coffee-600'
                    )}>
                      {reg.nickname}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {reg.level && (
                        <span className={cn('badge border text-[10px] py-0 px-1', readerLevelColor[reg.level as ReaderLevel])}>
                          {readerLevelLabel[reg.level as ReaderLevel]}
                        </span>
                      )}
                      {reg.checkedInAt ? (
                        <span className="text-[10px] text-emerald-500">
                          {formatDateTime(reg.checkedInAt).split(' ')[1]}
                        </span>
                      ) : (
                        <span className="text-[10px] text-coffee-400">待签到</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-coffee-700" />
            <h2 className="section-title mb-0">讨论区</h2>
            <span className="badge bg-coffee-100 text-coffee-600 ml-2">
              {discussionPosts.length} 条讨论
            </span>
          </div>
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Edit3 className="w-4 h-4" />
            发起讨论
          </button>
        </div>

        {showPostForm && (
          <div className="mb-6 p-5 rounded-xl bg-coffee-50/50 border border-coffee-100">
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">昵称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newPostNickname}
                    onChange={(e) => setNewPostNickname(e.target.value)}
                    placeholder="请输入您的昵称"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">标题 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="请输入讨论标题"
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">内容 <span className="text-red-500">*</span></label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="分享您的想法和见解..."
                  rows={4}
                  className="input-field resize-none"
                  required
                />
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <ImagePlus className="w-4 h-4 text-coffee-400" />
                  图片链接 <span className="text-coffee-400 text-xs">（选填，每行一个）</span>
                </label>
                <textarea
                  value={newPostImages}
                  onChange={(e) => setNewPostImages(e.target.value)}
                  placeholder="https://example.com/image1.jpg"
                  rows={2}
                  className="input-field resize-none font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submittingPost || !newPostNickname.trim() || !newPostTitle.trim() || !newPostContent.trim()}
                  className={cn(
                    'btn-primary inline-flex items-center gap-2',
                    (submittingPost || !newPostNickname.trim() || !newPostTitle.trim() || !newPostContent.trim()) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {submittingPost ? (
                    <>发布中...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      发布讨论
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPostForm(false)}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {discussionLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-coffee-50 animate-pulse">
                <div className="h-5 bg-coffee-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-coffee-100 rounded w-2/3 mb-2" />
                <div className="h-4 bg-coffee-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : discussionPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
            <p className="text-coffee-400">暂无讨论，来发起第一个话题吧～</p>
          </div>
        ) : (
          <div className="space-y-4">
            {discussionPosts.map((post) => {
              const isExpanded = expandedPostId === post.id
              const isReplying = replyToPostId === post.id && !replyToReplyId
              const topLevelReplies = post.replies.filter(r => !r.parentId)
              const replyMap = new Map<number, MeetupDiscussionReply[]>()
              post.replies.forEach(r => {
                if (r.parentId) {
                  const existing = replyMap.get(r.parentId) || []
                  existing.push(r)
                  replyMap.set(r.parentId, existing)
                }
              })

              return (
                <div
                  key={post.id}
                  className="border border-coffee-100 rounded-xl overflow-hidden hover:border-coffee-200 transition-colors"
                >
                  <div
                    className="p-5 cursor-pointer hover:bg-coffee-50/50 transition-colors"
                    onClick={() => togglePostExpand(post.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-coffee-900 text-lg mb-2 group-hover:text-coffee-700 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-coffee-600 text-sm line-clamp-2 mb-3">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-coffee-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {post.nickname}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDateTime(post.lastReplyAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {post.replyCount} 回复
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-coffee-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-coffee-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-coffee-100 bg-coffee-50/30">
                      <div className="p-5 pt-4">
                        <p className="text-coffee-700 leading-relaxed whitespace-pre-wrap mb-4">
                          {post.content}
                        </p>

                        {post.images && post.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                            {post.images.map((img, idx) => (
                              <div
                                key={idx}
                                className="aspect-square rounded-lg overflow-hidden bg-coffee-100 cursor-pointer hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={img}
                                  alt={`图片 ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {topLevelReplies.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {topLevelReplies.map((reply) => {
                              const childReplies = replyMap.get(reply.id) || []
                              const isReplyToThis = replyToReplyId === reply.id

                              return (
                                <div key={reply.id} className="space-y-2">
                                  <div className="flex gap-3 p-3 rounded-lg bg-white border border-coffee-100">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-xs font-medium">
                                        {reply.nickname.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-coffee-800">
                                          {reply.nickname}
                                        </span>
                                        <span className="text-xs text-coffee-400">
                                          {formatDateTime(reply.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-coffee-600 leading-relaxed">
                                        {reply.content}
                                      </p>
                                      {reply.images && reply.images.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                          {reply.images.map((img, idx) => (
                                            <div
                                              key={idx}
                                              className="aspect-square rounded-md overflow-hidden bg-coffee-100"
                                            >
                                              <img
                                                src={img}
                                                alt={`回复图片 ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStartReply(post.id, reply.id, reply.nickname)
                                        }}
                                        className="mt-2 text-xs text-coffee-500 hover:text-coffee-700 inline-flex items-center gap-1 transition-colors"
                                      >
                                        <Reply className="w-3 h-3" />
                                        回复
                                      </button>
                                    </div>
                                  </div>

                                  {childReplies.length > 0 && (
                                    <div className="ml-8 space-y-2">
                                      {childReplies.map((childReply) => (
                                        <div
                                          key={childReply.id}
                                          className="flex gap-2 p-3 rounded-lg bg-white/70 border border-coffee-50"
                                        >
                                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brass-400 to-brass-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-[10px] font-medium">
                                              {childReply.nickname.charAt(0)}
                                            </span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                              <span className="text-xs font-medium text-coffee-800">
                                                {childReply.nickname}
                                              </span>
                                              {childReply.replyToNickname && (
                                                <span className="text-xs text-coffee-400">
                                                  回复 {childReply.replyToNickname}
                                                </span>
                                              )}
                                              <span className="text-[10px] text-coffee-400">
                                                {formatDateTime(childReply.createdAt)}
                                              </span>
                                            </div>
                                            <p className="text-xs text-coffee-600">
                                              {childReply.content}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {isReplyToThis && (
                                    <form
                                      onSubmit={handleSubmitReply}
                                      className="ml-8 p-3 rounded-lg bg-white border border-coffee-200 space-y-2"
                                    >
                                      <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder={`回复 ${reply.nickname}...`}
                                        rows={2}
                                        className="input-field text-sm resize-none"
                                        autoFocus
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          type="submit"
                                          disabled={submittingReply || !replyContent.trim()}
                                          className={cn(
                                            'btn-primary text-xs py-1.5 px-3',
                                            (submittingReply || !replyContent.trim()) && 'opacity-50 cursor-not-allowed'
                                          )}
                                        >
                                          {submittingReply ? '发送中...' : '发送'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={handleCancelReply}
                                          className="btn-secondary text-xs py-1.5 px-3"
                                        >
                                          取消
                                        </button>
                                      </div>
                                    </form>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {isReplying && !replyToReplyId && (
                          <form onSubmit={handleSubmitReply} className="space-y-3">
                            <div>
                              <label className="label text-sm">昵称 <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={replyToNickname}
                                onChange={(e) => setReplyToNickname(e.target.value)}
                                placeholder="请输入您的昵称"
                                className="input-field text-sm"
                                required
                              />
                            </div>
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="写下你的回复..."
                              rows={3}
                              className="input-field resize-none"
                              autoFocus
                            />
                            <div className="flex gap-3">
                              <button
                                type="submit"
                                disabled={submittingReply || !replyContent.trim()}
                                className={cn(
                                  'btn-primary inline-flex items-center gap-2 text-sm',
                                  (submittingReply || !replyContent.trim()) && 'opacity-50 cursor-not-allowed'
                                )}
                              >
                                {submittingReply ? (
                                  <>回复中...</>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    回复
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelReply}
                                className="btn-secondary inline-flex items-center gap-2 text-sm"
                              >
                                取消
                              </button>
                            </div>
                          </form>
                        )}

                        {!isReplying && (
                          <button
                            onClick={() => handleStartReply(post.id)}
                            className="text-sm text-coffee-600 hover:text-coffee-800 inline-flex items-center gap-1.5 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            回复此贴
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedPhoto}
            alt="放大照片"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
