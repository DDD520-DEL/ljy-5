import { useEffect, useState } from 'react'
import { X, Plus, BookMarked, Check, Loader2 } from 'lucide-react'
import { bookshelfApi } from '../lib/api'
import type { Book, Bookshelf, BookshelfVisibility } from '../../shared/types'

interface BookshelfSelectorProps {
  book: Book
  nickname: string
  open: boolean
  onClose: () => void
}

export function BookshelfSelector({ book, nickname, open, onClose }: BookshelfSelectorProps) {
  const [bookshelves, setBookshelves] = useState<Bookshelf[]>([])
  const [membership, setMembership] = useState<number[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newVisibility, setNewVisibility] = useState<BookshelfVisibility>('private')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    if (open && nickname) {
      loadData()
    }
  }, [open, nickname, book.id])

  async function loadData() {
    setLoading(true)
    try {
      const [userShelves, member] = await Promise.all([
        bookshelfApi.getByUser(nickname, nickname),
        bookshelfApi.getBookMembership(book.id, nickname),
      ])
      setBookshelves(userShelves)
      setMembership(member.bookshelfIds)
    } catch (e) {
      console.error('加载书单失败:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateShelf() {
    if (!newName.trim()) return
    try {
      const shelf = await bookshelfApi.create({
        nickname,
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        visibility: newVisibility,
      })
      setBookshelves(prev => [shelf, ...prev])
      setNewName('')
      setNewDesc('')
      setCreating(false)
    } catch (e) {
      console.error('创建书单失败:', e)
    }
  }

  async function handleToggle(shelfId: number, currentlyIn: boolean) {
    setActionLoading(shelfId)
    try {
      if (currentlyIn) {
        await bookshelfApi.removeBook(shelfId, book.id, nickname)
        setMembership(prev => prev.filter(id => id !== shelfId))
        setBookshelves(prev =>
          prev.map(s => (s.id === shelfId ? { ...s, bookCount: Math.max(0, s.bookCount - 1) } : s))
        )
      } else {
        await bookshelfApi.addBook(shelfId, book.id, nickname)
        setMembership(prev => [...prev, shelfId])
        setBookshelves(prev =>
          prev.map(s => (s.id === shelfId ? { ...s, bookCount: s.bookCount + 1 } : s))
        )
      }
    } catch (e: any) {
      alert(e?.message || '操作失败')
    } finally {
      setActionLoading(null)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-600" />
            收藏到书单
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl mb-4">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-12 h-16 object-cover rounded-md shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-md flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm line-clamp-2">{book.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{book.author}</p>
            </div>
          </div>

          {creating ? (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-xl mb-3">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="书单名称，如：想读、已读..."
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 mb-2 outline-none focus:border-indigo-500"
                autoFocus
              />
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="书单简介（可选）"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 mb-2 outline-none focus:border-indigo-500 resize-none"
              />
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="visibility"
                    checked={newVisibility === 'private'}
                    onChange={() => setNewVisibility('private')}
                    className="text-indigo-600"
                  />
                  私密
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="radio"
                    name="visibility"
                    checked={newVisibility === 'public'}
                    onChange={() => setNewVisibility('public')}
                    className="text-indigo-600"
                  />
                  公开
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCreating(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateShelf}
                  disabled={!newName.trim()}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center justify-center gap-2 p-3 mb-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">新建书单</span>
            </button>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : bookshelves.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
              暂无书单，点击上方按钮创建
            </div>
          ) : (
            <div className="space-y-2">
              {bookshelves.map(shelf => {
                const isIn = membership.includes(shelf.id)
                const busy = actionLoading === shelf.id
                return (
                  <button
                    key={shelf.id}
                    onClick={() => !busy && handleToggle(shelf.id, isIn)}
                    disabled={busy}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isIn
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-800'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/50'
                    } ${busy ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isIn
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        <BookMarked className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{shelf.name}</p>
                          {shelf.visibility === 'private' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400">
                              私密
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{shelf.bookCount} 本图书</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {busy ? (
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      ) : isIn ? (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-zinc-300 dark:border-zinc-600" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
