import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Users,
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
} from 'lucide-react'
import { meetupApi, bookApi } from '@/lib/api'
import {
  meetupStatusLabel,
  meetupStatusColor,
  formatDate,
  formatDateTime,
  cn,
} from '@/lib/utils'
import type { Meetup, Registration, Book as BookType } from '../../shared/types'

export default function MeetupDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [meetup, setMeetup] = useState<(Meetup & { registrations: Registration[] }) | null>(null)
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

  const isAdmin = true

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  async function loadData() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

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

          <div className="space-y-2">
            <h3 className="section-title flex items-center gap-2">
              <FileText className="w-4 h-4" />
              活动描述
            </h3>
            <p className="text-coffee-600 leading-relaxed whitespace-pre-wrap">
              {meetup.description}
            </p>
          </div>
        </div>
      </div>

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
                <p className="text-sm text-forest-500/80">我们已记录您的报名信息</p>
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

      <div className="card p-6">
        <h3 className="section-title flex items-center gap-2 mb-4">
          <Users className="w-4 h-4" />
          报名名单
          <span className="badge bg-coffee-100 text-coffee-600 ml-2">
            共 {meetup.registrations.length} 人
          </span>
        </h3>

        {meetup.registrations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-coffee-200 mx-auto mb-3" />
            <p className="text-coffee-400">暂无报名人员</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {meetup.registrations.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center gap-2 p-3 rounded-lg bg-coffee-50/50 border border-coffee-100"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {reg.nickname.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-coffee-800 truncate">
                    {reg.nickname}
                  </p>
                  <p className="text-xs text-coffee-400">
                    {formatDate(reg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
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
