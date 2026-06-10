import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  QrCode,
  Calendar,
  MapPin,
  User,
  Check,
  Send,
  ArrowLeft,
  Gift,
  TrendingUp,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { meetupApi } from '@/lib/api'
import {
  meetupStatusLabel,
  meetupStatusColor,
  readerLevelLabel,
  readerLevelColor,
  formatDateTime,
  cn,
} from '@/lib/utils'
import type { Meetup, Registration, ReaderLevel, PointsAccount } from '../../shared/types'

export default function MeetupCheckIn() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [meetup, setMeetup] = useState<(Meetup & { registrations: (Registration & { level?: string })[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nickname, setNickname] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkInSuccess, setCheckInSuccess] = useState<{
    checkInTime: string
    pointsEarned: number
    account?: PointsAccount
    levelUp?: boolean
  } | null>(null)
  const [checkInError, setCheckInError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await meetupApi.get(Number(id))
      setMeetup(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id, loadData])

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault()
    if (!meetup || !nickname.trim()) return

    try {
      setCheckingIn(true)
      setCheckInError(null)
      const result = await meetupApi.checkIn(meetup.id, {
        nickname: nickname.trim(),
      })
      setCheckInSuccess({
        checkInTime: result.checkIn.createdAt,
        pointsEarned: result.pointsResult?.log.points || 0,
        account: result.pointsResult?.account,
        levelUp: result.pointsResult?.levelUp,
      })
      setNickname('')
      await loadData()
    } catch (err) {
      setCheckInError(err instanceof Error ? err.message : '签到失败')
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="h-10 bg-white rounded-lg w-32 animate-pulse" />
        <div className="card p-6 space-y-4">
          <div className="h-8 bg-coffee-100 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-coffee-100 rounded w-1/2 animate-pulse" />
          <div className="h-24 bg-coffee-100 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !meetup) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <div className="card p-12 text-center">
          <AlertCircle className="w-16 h-16 text-coffee-300 mx-auto mb-4" />
          <p className="text-coffee-600 font-medium mb-1">{error || '活动不存在'}</p>
          <Link to="/meetups" className="btn-primary inline-flex items-center gap-2 mt-4">
            返回活动列表
          </Link>
        </div>
      </div>
    )
  }

  const isFinished = meetup.status === 'finished'
  const myRegistration = meetup.registrations.find(r => r.nickname === nickname.trim())
  const alreadyCheckedIn = myRegistration?.checkedIn

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="card overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-coffee-500 to-coffee-700 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-4 right-4">
            <span className={cn('badge border text-sm px-3 py-1 bg-white/20 backdrop-blur text-white', meetupStatusColor[meetup.status])}>
              {meetupStatusLabel[meetup.status]}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-5 h-5 text-white/90" />
              <span className="text-white/90 text-sm font-medium">现场签到</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-white drop-shadow-lg line-clamp-2">
              {meetup.title}
            </h1>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-coffee-600">
              <Calendar className="w-4 h-4 text-coffee-400" />
              {formatDateTime(meetup.date)}
            </div>
            <div className="flex items-center gap-1.5 text-coffee-600">
              <MapPin className="w-4 h-4 text-coffee-400" />
              {meetup.location}
            </div>
          </div>

          {checkInSuccess ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-emerald-700">签到成功！</p>
                  <p className="text-sm text-emerald-600 mt-0.5">
                    签到时间：{formatDateTime(checkInSuccess.checkInTime)}
                  </p>
                </div>
              </div>

              {checkInSuccess.pointsEarned > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-brass-50 border border-brass-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brass-400 to-brass-600 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-brass-700">
                      获得 {checkInSuccess.pointsEarned} 积分
                    </p>
                    {checkInSuccess.account && (
                      <p className="text-sm text-brass-600 mt-0.5">
                        当前积分：{checkInSuccess.account.points} 分
                      </p>
                    )}
                    {checkInSuccess.levelUp && checkInSuccess.account && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <TrendingUp className="w-4 h-4 text-brass-600" />
                        <span className="text-sm font-medium text-brass-700">
                          恭喜升级为「{readerLevelLabel[checkInSuccess.account.level]}」！
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setCheckInSuccess(null)
                  setCheckInError(null)
                }}
                className="btn-secondary w-full"
              >
                继续签到
              </button>
            </div>
          ) : isFinished ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-coffee-50 border border-coffee-200">
              <AlertCircle className="w-5 h-5 text-coffee-500 flex-shrink-0 mt-0.5" />
              <p className="text-coffee-600">本次活动已结束，无法签到。</p>
            </div>
          ) : (
            <form onSubmit={handleCheckIn} className="space-y-4">
              {checkInError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {checkInError}
                </div>
              )}

              <div>
                <label className="label flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  昵称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value)
                    setCheckInError(null)
                  }}
                  placeholder="请输入报名时使用的昵称"
                  disabled={checkingIn}
                  className={cn('input-field', checkingIn && 'opacity-50 cursor-not-allowed')}
                  required
                />
                {nickname.trim() && myRegistration && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-coffee-500">已报名</span>
                    {myRegistration.level && (
                      <span className={cn('badge border text-[10px] py-0 px-1', readerLevelColor[myRegistration.level as ReaderLevel])}>
                        {readerLevelLabel[myRegistration.level as ReaderLevel]}
                      </span>
                    )}
                    {alreadyCheckedIn && (
                      <span className="badge border bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] py-0 px-1">
                        已签到
                      </span>
                    )}
                  </div>
                )}
                {nickname.trim() && !myRegistration && (
                  <p className="text-xs text-amber-600 mt-2">
                    未找到报名记录，请确认昵称是否正确
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={checkingIn || !nickname.trim() || alreadyCheckedIn}
                className={cn(
                  'btn-primary w-full inline-flex items-center justify-center gap-2',
                  (checkingIn || !nickname.trim() || alreadyCheckedIn) && 'opacity-50 cursor-not-allowed hover:bg-coffee-700 hover:translate-y-0'
                )}
              >
                {checkingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    签到中...
                  </>
                ) : alreadyCheckedIn ? (
                  <>您已完成签到</>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    确认签到
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {meetup.registrations && meetup.registrations.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title flex items-center gap-2 mb-4">
            <User className="w-4 h-4" />
            签到进度
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-coffee-600">
                已签到 {meetup.registrations.filter(r => r.checkedIn).length} / {meetup.registrations.length} 人
              </span>
              <span className="font-medium text-coffee-800">
                {meetup.registrations.length > 0
                  ? Math.round((meetup.registrations.filter(r => r.checkedIn).length / meetup.registrations.length) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-2.5 bg-coffee-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700"
                style={{
                  width: `${meetup.registrations.length > 0
                    ? (meetup.registrations.filter(r => r.checkedIn).length / meetup.registrations.length) * 100
                    : 0}%`
                }}
              />
            </div>

            <div className="pt-2">
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {meetup.registrations
                  .filter(r => r.checkedIn)
                  .map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-emerald-700 truncate">{reg.nickname}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
