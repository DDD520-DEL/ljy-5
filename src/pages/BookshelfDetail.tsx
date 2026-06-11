import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Heart,
  Share2,
  Trash2,
  Edit3,
  Lock,
  Globe,
  X,
  Check,
  Loader2,
  BookMarked,
  User,
  Plus,
  Clock,
} from 'lucide-react'
import { bookshelfApi } from '@/lib/api'
import { formatDate, formatDateTime, cn } from '@/lib/utils'
import { useReaderStore } from '@/hooks/useReaderStore'
import type { BookshelfWithBooks, BookshelfBook, BookshelfVisibility } from '../../shared/types'

export default function BookshelfDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentNickname = useReaderStore(s => s.nickname)
  const bookshelfId = parseInt(id || '0')

  const [bookshelf, setBookshelf] = useState<BookshelfWithBooks | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editVisibility, setEditVisibility] = useState<BookshelfVisibility>('public')
  const [editLoading, setEditLoading] = useState(false)
  const [removingBookId, setRemovingBookId] = useState<number | null>(null)
  const [showLikes, setShowLikes] = useState(false)
  const [likesList, setLikesList] = useState<{ nickname: string; createdAt: string; level?: string }[]>([])
  const [likesLoading, setLikesLoading] = useState(false)

  const isOwner = bookshelf?.nickname === currentNickname

  const loadBookshelf = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bookshelfApi.get(bookshelfId)
      setBookshelf(data)
      setEditName(data.name)
      setEditDesc(data.description || '')
      setEditVisibility(data.visibility)
      if (currentNickname) {
        const likedRes = await bookshelfApi.hasLiked(bookshelfId, currentNickname)
        setLiked(likedRes.liked)
      }
    } catch (err: any) {
      setError(err?.message || '加载书单失败')
    } finally {
      setLoading(false)
    }
  }, [bookshelfId, currentNickname])

  useEffect(() => {
    if (bookshelfId) {
      loadBookshelf()
    }
  }, [bookshelfId, loadBookshelf])

  async function handleLike() {
    if (!currentNickname) {
      alert('请先选择读者身份')
      return
    }
    setLikeLoading(true)
    try {
      const res = await bookshelfApi.toggleLike(bookshelfId, currentNickname)
      setBookshelf(prev => prev ? { ...prev, likeCount: res.bookshelf.likeCount } : null)
      setLiked(res.liked)
    } catch (e: any) {
      alert(e?.message || '操作失败')
    } finally {
      setLikeLoading(false)
    }
  }

  async function handleSaveEdit() {
    if (!editName.trim() || !bookshelf) return
    setEditLoading(true)
    try {
      const updated = await bookshelfApi.update(bookshelf.id, currentNickname, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        visibility: editVisibility,
      })
      setBookshelf(prev => prev ? { ...prev, ...updated } : null)
      setShowEdit(false)
    } catch (e: any) {
      alert(e?.message || '保存失败')
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete() {
    if (!bookshelf) return
    if (!confirm(`确定删除书单「${bookshelf.name}」吗？此操作不可撤销。`)) return
    try {
      await bookshelfApi.remove(bookshelf.id, currentNickname)
      navigate(`/readers/${encodeURIComponent(currentNickname)}`)
    } catch (e: any) {
      alert(e?.message || '删除失败')
    }
  }

  async function handleRemoveBook(bookId: number) {
    if (!bookshelf) return
    setRemovingBookId(bookId)
    try {
      await bookshelfApi.removeBook(bookshelf.id, bookId, currentNickname)
      setBookshelf(prev => {
        if (!prev) return null
        return {
          ...prev,
          books: prev.books.filter(b => b.bookId !== bookId),
          bookCount: Math.max(0, prev.bookCount - 1),
        }
      })
    } catch (e: any) {
      alert(e?.message || '移除失败')
    } finally {
      setRemovingBookId(null)
    }
  }

  async function handleShowLikes() {
    if (!bookshelf) return
    setShowLikes(true)
    setLikesLoading(true)
    try {
      const data = await bookshelfApi.getLikes(bookshelf.id)
      setLikesList(data.map(l => ({ ...l, level: l.level?.toString() || '1' })))
    } catch (e) {
      console.error(e)
    } finally {
      setLikesLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-50/50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-coffee-600" />
      </div>
    )
  }

  if (error || !bookshelf) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-50/50 to-white flex flex-col items-center justify-center p-8">
        <BookMarked className="w-16 h-16 text-coffee-300 mb-4" />
        <h2 className="text-xl font-semibold text-coffee-800 mb-2">书单不存在</h2>
        <p className="text-coffee-600 mb-6">{error || '该书单可能已被删除或设置为私密'}</p>
        <Link to="/books" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coffee-600 text-white hover:bg-coffee-700 transition-colors">
          <BookOpen className="w-4 h-4" />
          浏览馆藏
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50/50 to-white">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-coffee-100">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/books" className="p-2 rounded-lg hover:bg-coffee-50 text-coffee-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-serif font-bold text-coffee-900">墨香书坊</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/readers/${encodeURIComponent(bookshelf.nickname)}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-coffee-50 hover:bg-coffee-100 transition-colors"
            >
              <User className="w-4 h-4 text-coffee-600" />
              <span className="text-sm text-coffee-700">{bookshelf.nickname}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="p-6 -mt-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center flex-shrink-0">
                <BookMarked className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-coffee-900 break-words">{bookshelf.name}</h1>
                      {bookshelf.visibility === 'private' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          <Lock className="w-3 h-3" /> 私密
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700">
                          <Globe className="w-3 h-3" /> 公开
                        </span>
                      )}
                    </div>
                    {bookshelf.description && (
                      <p className="mt-2 text-sm text-coffee-600 leading-relaxed">{bookshelf.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-coffee-500 flex-wrap">
                      <Link to={`/readers/${encodeURIComponent(bookshelf.nickname)}`} className="hover:text-coffee-700 hover:underline">
                        @{bookshelf.nickname}
                      </Link>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {bookshelf.bookCount} 本图书
                      </span>
                      <button
                        onClick={handleShowLikes}
                        className={cn(
                          'flex items-center gap-1 transition-colors',
                          bookshelf.likeCount > 0 ? 'text-rose-600 hover:underline' : ''
                        )}
                      >
                        <Heart className={cn('w-3.5 h-3.5', liked ? 'fill-rose-500' : '')} />
                        {bookshelf.likeCount} 赞
                      </button>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        创建于 {formatDate(bookshelf.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isOwner && (
                      <button
                        onClick={handleLike}
                        disabled={likeLoading}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                          liked
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-coffee-50 text-coffee-700 hover:bg-coffee-100'
                        )}
                      >
                        {likeLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className={cn('w-4 h-4', liked ? 'fill-current' : '')} />
                        )}
                        {liked ? '已点赞' : '点赞'}
                      </button>
                    )}
                    {isOwner && (
                      <>
                        <button
                          onClick={() => setShowEdit(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-coffee-50 text-coffee-700 hover:bg-coffee-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          编辑
                        </button>
                        <button
                          onClick={handleDelete}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-coffee-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-coffee-600" />
            书单内容 <span className="text-sm font-normal text-coffee-500">({bookshelf.books.length})</span>
          </h2>
        </div>

        {bookshelf.books.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-coffee-200 p-12 text-center">
            <BookMarked className="w-14 h-14 text-coffee-300 mx-auto mb-3" />
            <h3 className="font-semibold text-coffee-800 mb-1">书单一览无余</h3>
            <p className="text-sm text-coffee-500 mb-4">
              {isOwner ? '去浏览图书，把喜欢的书加入这个书单吧' : '创建者还没有添加图书哦'}
            </p>
            {isOwner && (
              <Link to="/books" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coffee-600 text-white hover:bg-coffee-700 transition-colors">
                <Plus className="w-4 h-4" />
                去添加图书
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {bookshelf.books.map((bookItem, index) => (
              <BookshelfBookCard
                key={bookItem.id}
                item={bookItem}
                index={index}
                isOwner={isOwner}
                removing={removingBookId === bookItem.bookId}
                onRemove={() => handleRemoveBook(bookItem.bookId)}
              />
            ))}
          </div>
        )}
      </main>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <h3 className="font-semibold text-lg text-zinc-900">编辑书单</h3>
              <button
                onClick={() => setShowEdit(false)}
                className="text-zinc-500 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">书单名称 *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 outline-none focus:border-coffee-500"
                  placeholder="请输入书单名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">书单简介</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 outline-none focus:border-coffee-500 resize-none"
                  placeholder="简单介绍一下你的书单吧（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">可见性</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEditVisibility('private')}
                    className={cn(
                      'p-3 rounded-xl border-2 text-left transition-all',
                      editVisibility === 'private'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-zinc-200 hover:border-zinc-300'
                    )}
                  >
                    <Lock className={cn('w-5 h-5 mb-1.5', editVisibility === 'private' ? 'text-indigo-600' : 'text-zinc-500')} />
                    <p className={cn('text-sm font-medium', editVisibility === 'private' ? 'text-indigo-900' : 'text-zinc-700')}>仅自己可见</p>
                    <p className="text-xs text-zinc-500 mt-0.5">只有你能查看</p>
                  </button>
                  <button
                    onClick={() => setEditVisibility('public')}
                    className={cn(
                      'p-3 rounded-xl border-2 text-left transition-all',
                      editVisibility === 'public'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-zinc-200 hover:border-zinc-300'
                    )}
                  >
                    <Globe className={cn('w-5 h-5 mb-1.5', editVisibility === 'public' ? 'text-emerald-600' : 'text-zinc-500')} />
                    <p className={cn('text-sm font-medium', editVisibility === 'public' ? 'text-emerald-900' : 'text-zinc-700')}>公开</p>
                    <p className="text-xs text-zinc-500 mt-0.5">所有人可浏览点赞</p>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-zinc-200">
              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editName.trim() || editLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-coffee-600 text-white hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
              >
                {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {showLikes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 flex-shrink-0">
              <h3 className="font-semibold text-lg text-zinc-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                书单点赞 ({likesList.length})
              </h3>
              <button
                onClick={() => setShowLikes(false)}
                className="text-zinc-500 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {likesLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-coffee-600" />
                </div>
              ) : likesList.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  暂无读者点赞
                </div>
              ) : (
                <div className="space-y-1">
                  {likesList.map((like) => (
                    <Link
                      key={like.nickname}
                      to={`/readers/${encodeURIComponent(like.nickname)}`}
                      onClick={() => setShowLikes(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {like.nickname.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-zinc-900 truncate">{like.nickname}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Lv.{like.level} · {formatDate(like.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BookshelfBookCard({
  item,
  index,
  isOwner,
  removing,
  onRemove,
}: {
  item: BookshelfBook
  index: number
  isOwner: boolean
  removing: boolean
  onRemove: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-coffee-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className="w-8 h-8 rounded-lg bg-coffee-50 flex items-center justify-center text-sm font-semibold text-coffee-600 flex-shrink-0">
        {index + 1}
      </div>
      <Link to={`/books/${item.bookId}`} className="flex-shrink-0">
        {item.bookCover ? (
          <img
            src={item.bookCover}
            alt={item.bookTitle}
            className="w-16 h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
          />
        ) : (
          <div className="w-16 h-24 bg-coffee-100 rounded-lg" />
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/books/${item.bookId}`} className="font-semibold text-coffee-900 hover:text-coffee-700 hover:underline line-clamp-2">
          {item.bookTitle}
        </Link>
        <p className="text-sm text-coffee-600 mt-1">{item.bookAuthor}</p>
        <p className="text-xs text-coffee-400 mt-1.5 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          加入于 {formatDateTime(item.addedAt)}
        </p>
      </div>
      {isOwner && (
        <button
          onClick={onRemove}
          disabled={removing}
          className="p-2.5 rounded-xl text-coffee-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-wait"
          title="从此书单移除"
        >
          {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        </button>
      )}
    </div>
  )
}
