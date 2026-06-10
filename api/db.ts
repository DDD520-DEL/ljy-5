import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Book, TraceLog, Review, Meetup, Registration, Reservation, SourceType } from '../shared/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', 'data')
const DATA_FILE = path.join(DATA_DIR, 'bookstore.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function randomTraceId(): string {
  return 'BOOK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

const initialBooks: Book[] = [
  {
    id: 1,
    traceId: 'BOOK-ABC123-001',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    isbn: '9787544291170',
    publisher: '南海出版公司',
    category: '文学小说',
    sourceType: 'donation',
    sourceInfo: '读者李先生捐赠，书龄10年',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20hundred%20years%20of%20solitude%20magical%20realism%20latin%20america&image_size=portrait_4_3',
    description: '魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事',
    createdAt: '2025-11-15T10:00:00.000Z',
    borrowCount: 23,
    discussCount: 5
  },
  {
    id: 2,
    traceId: 'BOOK-DEF456-002',
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    isbn: '9787020042494',
    publisher: '人民文学出版社',
    category: '儿童文学',
    sourceType: 'direct',
    sourceInfo: '出版社直供，2024年新版',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=little%20prince%20book%20cover%20starry%20night%20rose%20fox%20illustration&image_size=portrait_4_3',
    description: '一部为成年人写的童话，关于爱与责任的寓言',
    createdAt: '2025-12-01T14:30:00.000Z',
    borrowCount: 45,
    discussCount: 8
  },
  {
    id: 3,
    traceId: 'BOOK-GHI789-003',
    title: '追风筝的人',
    author: '卡勒德·胡赛尼',
    isbn: '9787208061644',
    publisher: '上海人民出版社',
    category: '文学小说',
    sourceType: 'secondhand',
    sourceInfo: '二手回收，品相良好',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kite%20runner%20book%20cover%20afghanistan%20kite%20sky%20warm%20colors&image_size=portrait_4_3',
    description: '关于友谊、背叛与救赎的感人故事',
    createdAt: '2025-10-20T09:15:00.000Z',
    borrowCount: 31,
    discussCount: 6
  },
  {
    id: 4,
    traceId: 'BOOK-JKL012-004',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    isbn: '9787508647357',
    publisher: '中信出版社',
    category: '历史社科',
    sourceType: 'direct',
    sourceInfo: '出版社直供，精装版',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sapiens%20brief%20history%20humankind%20book%20cover%20evolution%20human%20history&image_size=portrait_4_3',
    description: '从认知革命到科学革命，重新审视人类历史',
    createdAt: '2026-01-05T16:00:00.000Z',
    borrowCount: 18,
    discussCount: 3
  },
  {
    id: 5,
    traceId: 'BOOK-MNO345-005',
    title: '活着',
    author: '余华',
    isbn: '9787506365437',
    publisher: '作家出版社',
    category: '文学小说',
    sourceType: 'donation',
    sourceInfo: '读者张女士捐赠，1998年版本',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=to%20live%20yu%20hua%20book%20cover%20chinese%20rural%20life%20sepia%20tone&image_size=portrait_4_3',
    description: '讲述了农村人福贵悲惨的人生遭遇',
    createdAt: '2025-09-10T11:45:00.000Z',
    borrowCount: 52,
    discussCount: 12
  }
]

const initialTraceLogs: TraceLog[] = [
  { id: 1, bookId: 1, action: '入库', description: '由读者李先生捐赠，书店主人老王验收', timestamp: '2025-11-15T10:00:00.000Z', operator: '老王' },
  { id: 2, bookId: 1, action: '借出', description: '读者小陈借阅，期限14天', timestamp: '2025-11-20T15:30:00.000Z', operator: '小李' },
  { id: 3, bookId: 1, action: '归还', description: '小陈按期归还，书本完好', timestamp: '2025-12-04T10:15:00.000Z', operator: '老王' },
  { id: 4, bookId: 1, action: '借出', description: '读者王老师借阅', timestamp: '2026-01-10T09:00:00.000Z', operator: '小李' },
  { id: 5, bookId: 2, action: '入库', description: '出版社直供，新版首次入库', timestamp: '2025-12-01T14:30:00.000Z', operator: '老王' },
  { id: 6, bookId: 2, action: '借出', description: '小读者萌萌借阅', timestamp: '2025-12-05T16:00:00.000Z', operator: '小李' },
  { id: 7, bookId: 3, action: '入库', description: '二手回收，品相良好', timestamp: '2025-10-20T09:15:00.000Z', operator: '老王' },
  { id: 8, bookId: 5, action: '入库', description: '读者张女士捐赠，珍藏版本', timestamp: '2025-09-10T11:45:00.000Z', operator: '老王' }
]

const initialReviews: Review[] = [
  { id: 1, bookId: 1, content: '在书店读完了这本，文字里有魔法。一个家族的百年兴衰，让人想起自己的祖辈。', nickname: '爱读书的猫', rating: 5, createdAt: '2025-11-25T20:00:00.000Z' },
  { id: 2, bookId: 1, content: '孤独是宿命，但生命依然值得。马尔克斯的文字让人欲罢不能。', nickname: '夜读者', rating: 5, createdAt: '2025-12-18T22:30:00.000Z' },
  { id: 3, bookId: 1, content: '第三次读这本书了，每次都有不同的感受。感谢书店保存了这本好书。', nickname: '书虫阿明', rating: 4, createdAt: '2026-01-15T14:20:00.000Z' },
  { id: 4, bookId: 2, content: '小时候看过动画片，现在读原著才懂那些深意。所有大人都曾经是孩子。', nickname: '不想长大', rating: 5, createdAt: '2025-12-10T19:45:00.000Z' },
  { id: 5, bookId: 2, content: '玫瑰花与狐狸的那段，每次都看哭。', nickname: '小王子的玫瑰', rating: 5, createdAt: '2026-01-02T21:00:00.000Z' },
  { id: 6, bookId: 3, content: '为你，千千万万遍。读到这句话的时候在书店哭了。', nickname: '追风筝的人', rating: 5, createdAt: '2025-11-02T18:30:00.000Z' },
  { id: 7, bookId: 5, content: '余华的文字太有力量了，福贵的一生让人叹息又敬佩。', nickname: '文字的力量', rating: 5, createdAt: '2025-09-20T16:00:00.000Z' },
  { id: 8, bookId: 5, content: '活着本身就是意义。这本书让我重新思考生活。', nickname: '平凡的人', rating: 4, createdAt: '2025-10-08T20:15:00.000Z' }
]

const initialMeetups: Meetup[] = [
  {
    id: 1,
    title: '《百年孤独》共读之夜',
    description: '一起走进马尔克斯的魔幻世界，分享你最爱的段落，聊聊孤独与家族的意义。',
    bookId: 1,
    date: '2026-06-20T19:00:00.000Z',
    location: '墨香书坊·二楼阅读区',
    maxParticipants: 15,
    currentParticipants: 8,
    status: 'upcoming',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20bookstore%20reading%20club%20warm%20lighting%20people%20discussing%20books%20coffee&image_size=landscape_16_9',
    createdAt: '2026-06-01T10:00:00.000Z'
  },
  {
    id: 2,
    title: '春日读书会：关于成长的故事',
    description: '一起读《小王子》和《追风筝的人》，聊聊那些让我们长大的瞬间。',
    bookId: 2,
    date: '2026-05-15T14:00:00.000Z',
    location: '墨香书坊·院子',
    maxParticipants: 20,
    currentParticipants: 20,
    status: 'finished',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spring%20garden%20book%20club%20people%20sitting%20reading%20sunlight%20flowers&image_size=landscape_16_9',
    groupPhotos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20club%20group%20photo%20happy%20people%20holding%20books%20smile&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=reading%20session%20cozy%20afternoon%20tea%20books%20discussion&image_size=landscape_4_3'
    ],
    discussionNotes: '今天的读书会非常精彩！大家分享了很多关于成长的个人故事。印象最深的是小李分享的"小王子教会我，真正重要的东西眼睛是看不见的"。下一期我们将讨论《百年孤独》，敬请期待！',
    createdAt: '2026-04-20T09:00:00.000Z'
  },
  {
    id: 3,
    title: '余华作品研读会',
    description: '《活着》《许三观卖血记》深度讨论，看余华笔下的生命力量。',
    bookId: 5,
    date: '2026-07-10T19:30:00.000Z',
    location: '墨香书坊·二楼阅读区',
    maxParticipants: 12,
    currentParticipants: 3,
    status: 'upcoming',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=literary%20discussion%20group%20intellectual%20atmosphere%20chinese%20literature&image_size=landscape_16_9',
    createdAt: '2026-06-05T15:30:00.000Z'
  }
]

const initialRegistrations: Registration[] = [
  { id: 1, meetupId: 1, nickname: '爱读书的猫', contact: '13800138000', createdAt: '2026-06-02T11:00:00.000Z' },
  { id: 2, meetupId: 1, nickname: '夜读者', createdAt: '2026-06-03T14:20:00.000Z' },
  { id: 3, meetupId: 2, nickname: '小王子的玫瑰', contact: '13900139000', createdAt: '2026-05-01T10:00:00.000Z' }
]

const initialReservations: Reservation[] = [
  { id: 1, bookId: 1, nickname: '读书人小刘', contact: '13700137000', status: 'waiting', position: 1, createdAt: '2026-01-12T10:00:00.000Z' },
  { id: 2, bookId: 1, nickname: '文学爱好者', contact: '13600136000', status: 'waiting', position: 2, createdAt: '2026-01-13T15:30:00.000Z' },
  { id: 3, bookId: 2, nickname: '童话少女', status: 'notified', position: 1, createdAt: '2026-01-08T09:00:00.000Z', notifiedAt: '2026-01-09T10:00:00.000Z' }
]

export interface Database {
  books: Book[]
  traceLogs: TraceLog[]
  reviews: Review[]
  meetups: Meetup[]
  registrations: Registration[]
  reservations: Reservation[]
  nextBookId: number
  nextTraceLogId: number
  nextReviewId: number
  nextMeetupId: number
  nextRegistrationId: number
  nextReservationId: number
}

const initialDB: Database = {
  books: initialBooks,
  traceLogs: initialTraceLogs,
  reviews: initialReviews,
  meetups: initialMeetups,
  registrations: initialRegistrations,
  reservations: initialReservations,
  nextBookId: 6,
  nextTraceLogId: 9,
  nextReviewId: 9,
  nextMeetupId: 4,
  nextRegistrationId: 4,
  nextReservationId: 4
}

let db: Database = initialDB

function loadDB(): Database {
  ensureDataDir()
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      console.log(`[DB] 已从 ${DATA_FILE} 加载数据`)
      console.log(`[DB] 图书: ${parsed.books.length} 本 | 读书会: ${parsed.meetups.length} 个 | 短评: ${parsed.reviews.length} 条`)
      return parsed
    } catch (err) {
      console.error('[DB] 数据文件读取失败，使用初始数据:', err)
      return { ...initialDB }
    }
  }
  console.log('[DB] 未找到数据文件，使用初始数据并创建持久化文件')
  saveDB(initialDB)
  return { ...initialDB }
}

let saveTimer: NodeJS.Timeout | null = null

function saveDB(data: Database) {
  ensureDataDir()
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
      console.log(`[DB] 数据已持久化到 ${DATA_FILE}`)
    } catch (err) {
      console.error('[DB] 数据持久化失败:', err)
    }
  }, 100)
}

db = loadDB()

export function getDB(): Database {
  return db
}

export function persistDB() {
  saveDB(db)
}

export function addBook(bookData: Omit<Book, 'id' | 'traceId' | 'createdAt' | 'borrowCount' | 'discussCount'>): Book {
  const newBook: Book = {
    ...bookData,
    id: db.nextBookId++,
    traceId: randomTraceId(),
    createdAt: new Date().toISOString(),
    borrowCount: 0,
    discussCount: 0
  }
  db.books.push(newBook)
  
  addTraceLog(newBook.id, '入库', getSourceDescription(newBook.sourceType, newBook.sourceInfo), '书店管理员')
  
  persistDB()
  return newBook
}

function getSourceDescription(sourceType: SourceType, sourceInfo?: string): string {
  const sourceMap: Record<SourceType, string> = {
    donation: '个人捐赠',
    direct: '出版社直供',
    secondhand: '二手回收'
  }
  return sourceInfo ? `${sourceMap[sourceType]}：${sourceInfo}` : sourceMap[sourceType]
}

export function addTraceLog(bookId: number, action: TraceLog['action'], description: string, operator?: string): TraceLog {
  const log: TraceLog = {
    id: db.nextTraceLogId++,
    bookId,
    action,
    description,
    timestamp: new Date().toISOString(),
    operator
  }
  db.traceLogs.push(log)
  persistDB()
  return log
}

export function addReview(bookId: number, data: Omit<Review, 'id' | 'bookId' | 'createdAt'>): Review {
  const review: Review = {
    ...data,
    id: db.nextReviewId++,
    bookId,
    createdAt: new Date().toISOString()
  }
  db.reviews.push(review)
  
  const book = db.books.find(b => b.id === bookId)
  if (book) {
    book.discussCount++
  }
  
  persistDB()
  return review
}

export function addMeetup(data: Omit<Meetup, 'id' | 'currentParticipants' | 'status' | 'createdAt'>): Meetup {
  const meetup: Meetup = {
    ...data,
    id: db.nextMeetupId++,
    currentParticipants: 0,
    status: 'upcoming',
    createdAt: new Date().toISOString()
  }
  db.meetups.push(meetup)
  persistDB()
  return meetup
}

export function registerMeetup(meetupId: number, data: Omit<Registration, 'id' | 'meetupId' | 'createdAt'>): Registration | null {
  const meetup = db.meetups.find(m => m.id === meetupId)
  if (!meetup || meetup.currentParticipants >= meetup.maxParticipants) {
    return null
  }
  
  const registration: Registration = {
    ...data,
    id: db.nextRegistrationId++,
    meetupId,
    createdAt: new Date().toISOString()
  }
  db.registrations.push(registration)
  meetup.currentParticipants++
  
  persistDB()
  return registration
}

export function updateMeetupSummary(meetupId: number, data: { groupPhotos?: string[]; discussionNotes?: string }): Meetup | null {
  const meetup = db.meetups.find(m => m.id === meetupId)
  if (!meetup) return null
  
  if (data.groupPhotos !== undefined) {
    meetup.groupPhotos = data.groupPhotos
  }
  if (data.discussionNotes !== undefined) {
    meetup.discussionNotes = data.discussionNotes
  }
  meetup.status = 'finished'
  
  persistDB()
  return meetup
}

export function incrementBorrowCount(bookId: number): void {
  const book = db.books.find(b => b.id === bookId)
  if (book) {
    book.borrowCount++
    persistDB()
  }
}

export function isBookBorrowed(bookId: number): boolean {
  const logs = db.traceLogs
    .filter(l => l.bookId === bookId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return logs.length > 0 && logs[0].action === '借出'
}

export function addReservation(bookId: number, data: Omit<Reservation, 'id' | 'bookId' | 'status' | 'position' | 'createdAt'>): Reservation | null {
  if (!isBookBorrowed(bookId)) {
    return null
  }
  const bookReservations = db.reservations.filter(r => r.bookId === bookId && r.status !== 'cancelled' && r.status !== 'fulfilled')
  const maxPosition = bookReservations.length > 0 ? Math.max(...bookReservations.map(r => r.position)) : 0
  const reservation: Reservation = {
    ...data,
    id: db.nextReservationId++,
    bookId,
    status: 'waiting',
    position: maxPosition + 1,
    createdAt: new Date().toISOString()
  }
  db.reservations.push(reservation)
  persistDB()
  return reservation
}

export function getBookReservations(bookId: number): Reservation[] {
  return db.reservations
    .filter(r => r.bookId === bookId && r.status !== 'cancelled' && r.status !== 'fulfilled')
    .sort((a, b) => a.position - b.position)
}

export function cancelReservation(reservationId: number): Reservation | null {
  const reservation = db.reservations.find(r => r.id === reservationId)
  if (!reservation || reservation.status === 'cancelled' || reservation.status === 'fulfilled') {
    return null
  }
  reservation.status = 'cancelled'
  const bookReservations = db.reservations.filter(
    r => r.bookId === reservation.bookId && r.status !== 'cancelled' && r.status !== 'fulfilled' && r.position > reservation.position
  )
  for (const r of bookReservations) {
    r.position--
  }
  persistDB()
  return reservation
}

export function reorderReservation(reservationId: number, direction: 'up' | 'down'): Reservation | null {
  const reservation = db.reservations.find(r => r.id === reservationId)
  if (!reservation || reservation.status === 'cancelled' || reservation.status === 'fulfilled') {
    return null
  }
  const bookReservations = db.reservations
    .filter(r => r.bookId === reservation.bookId && r.status !== 'cancelled' && r.status !== 'fulfilled')
    .sort((a, b) => a.position - b.position)
  const currentIndex = bookReservations.findIndex(r => r.id === reservationId)
  if (direction === 'up' && currentIndex > 0) {
    const swapWith = bookReservations[currentIndex - 1]
    const tempPos = reservation.position
    reservation.position = swapWith.position
    swapWith.position = tempPos
  } else if (direction === 'down' && currentIndex < bookReservations.length - 1) {
    const swapWith = bookReservations[currentIndex + 1]
    const tempPos = reservation.position
    reservation.position = swapWith.position
    swapWith.position = tempPos
  } else {
    return null
  }
  persistDB()
  return reservation
}

export function notifyNextInQueue(bookId: number): Reservation | null {
  const waiting = db.reservations
    .filter(r => r.bookId === bookId && r.status === 'waiting')
    .sort((a, b) => a.position - b.position)
  if (waiting.length === 0) {
    return null
  }
  const next = waiting[0]
  next.status = 'notified'
  next.notifiedAt = new Date().toISOString()
  persistDB()
  return next
}

export function fulfillReservationByBorrower(bookId: number, nickname: string): Reservation | null {
  const reservation = db.reservations.find(
    r => r.bookId === bookId && r.status === 'notified' && r.nickname === nickname
  )
  if (!reservation) {
    return null
  }
  reservation.status = 'fulfilled'
  const bookReservations = db.reservations.filter(
    r => r.bookId === bookId && r.status !== 'cancelled' && r.status !== 'fulfilled' && r.position > reservation.position
  )
  for (const r of bookReservations) {
    r.position--
  }
  persistDB()
  return reservation
}

export function returnBook(bookId: number, operator?: string): { book: Book; traceLog: TraceLog; notifiedReservation: Reservation | null } | null {
  const book = db.books.find(b => b.id === bookId)
  if (!book) {
    return null
  }
  if (!isBookBorrowed(bookId)) {
    return null
  }
  const traceLog = addTraceLog(bookId, '归还', `读者归还图书，书店${operator || '管理员'}登记`, operator || '管理员')
  const notifiedReservation = notifyNextInQueue(bookId)
  persistDB()
  return { book, traceLog, notifiedReservation }
}

export function getAllReservationsWithBookInfo(): { reservation: Reservation; book: Book }[] {
  return db.reservations
    .filter(r => r.status !== 'cancelled' && r.status !== 'fulfilled')
    .map(r => {
      const book = db.books.find(b => b.id === r.bookId)!
      return { reservation: r, book }
    })
    .filter(item => item.book)
    .sort((a, b) => a.reservation.position - b.reservation.position)
}

export function resetToInitialData(): void {
  db = { ...initialDB }
  persistDB()
  console.log('[DB] 已重置为初始数据')
}
