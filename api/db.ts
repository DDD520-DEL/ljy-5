import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Book, TraceLog, Review, Meetup, Registration, Reservation, SourceType, PointsAccount, PointsLog, ReaderLevel, PointsActionType, ReaderRanking, ReaderProfile, DonationReview, Note, NoteComment, NoteLike, CreateNoteRequest, CheckIn, BorrowRecord, BorrowRecordWithBook, BookBorrowStatus, Notification, NotificationType, ExchangeListing, ExchangeRequest, BookCondition, ExchangeListingStatus, ExchangeRequestStatus, CreateExchangeListingRequest, CreateExchangeRequestRequest } from '../shared/types'
import { READER_LEVELS, POINTS_ACTION } from '../shared/types'

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

function calculateLevel(points: number): ReaderLevel {
  const levels = Object.entries(READER_LEVELS) as [ReaderLevel, typeof READER_LEVELS[ReaderLevel]][]
  levels.sort((a, b) => b[1].minPoints - a[1].minPoints)
  for (const [level, config] of levels) {
    if (points >= config.minPoints) {
      return level
    }
  }
  return 'bookworm'
}

const initialPointsAccounts: PointsAccount[] = [
  { id: 1, nickname: '爱读书的猫', points: 25, level: 'bookworm', borrowCount: 1, reviewCount: 2, meetupCount: 0, donationCount: 0, exchangeCount: 0, createdAt: '2025-11-20T10:00:00.000Z', updatedAt: '2025-12-18T22:30:00.000Z' },
  { id: 2, nickname: '夜读者', points: 15, level: 'bookworm', borrowCount: 1, reviewCount: 1, meetupCount: 0, donationCount: 0, exchangeCount: 0, createdAt: '2025-12-05T16:00:00.000Z', updatedAt: '2025-12-18T22:30:00.000Z' },
  { id: 3, nickname: '书虫阿明', points: 10, level: 'bookworm', borrowCount: 0, reviewCount: 1, meetupCount: 0, donationCount: 0, exchangeCount: 0, createdAt: '2026-01-15T14:20:00.000Z', updatedAt: '2026-01-15T14:20:00.000Z' },
  { id: 4, nickname: '不想长大', points: 15, level: 'bookworm', borrowCount: 1, reviewCount: 1, meetupCount: 0, donationCount: 0, exchangeCount: 0, createdAt: '2025-12-05T16:00:00.000Z', updatedAt: '2025-12-10T19:45:00.000Z' },
  { id: 5, nickname: '小王子的玫瑰', points: 40, level: 'bookworm', borrowCount: 1, reviewCount: 1, meetupCount: 1, donationCount: 0, exchangeCount: 0, createdAt: '2025-12-05T16:00:00.000Z', updatedAt: '2026-01-02T21:00:00.000Z' },
  { id: 6, nickname: '追风筝的人', points: 10, level: 'bookworm', borrowCount: 0, reviewCount: 1, meetupCount: 0, donationCount: 0, exchangeCount: 0, createdAt: '2025-11-02T18:30:00.000Z', updatedAt: '2025-11-02T18:30:00.000Z' },
  { id: 7, nickname: '文字的力量', points: 10, level: 'bookworm', borrowCount: 0, reviewCount: 1, meetupCount: 0, donationCount: 0, exchangeCount: 0, createdAt: '2025-09-20T16:00:00.000Z', updatedAt: '2025-09-20T16:00:00.000Z' },
  { id: 8, nickname: '平凡的人', points: 10, level: 'bookworm', borrowCount: 0, reviewCount: 1, meetupCount: 0, donationCount: 0, exchangeCount: 0, createdAt: '2025-10-08T20:15:00.000Z', updatedAt: '2025-10-08T20:15:00.000Z' },
  { id: 9, nickname: '读书人小刘', points: 5, level: 'bookworm', borrowCount: 1, reviewCount: 0, meetupCount: 0, donationCount: 0, exchangeCount: 0, createdAt: '2026-01-10T09:00:00.000Z', updatedAt: '2026-01-10T09:00:00.000Z' },
  { id: 10, nickname: '文学爱好者', points: 0, level: 'bookworm', borrowCount: 0, reviewCount: 0, meetupCount: 0, donationCount: 0, exchangeCount: 0, createdAt: '2026-01-13T15:30:00.000Z', updatedAt: '2026-01-13T15:30:00.000Z' },
  { id: 11, nickname: '童话少女', points: 5, level: 'bookworm', borrowCount: 1, reviewCount: 0, meetupCount: 0, donationCount: 0, exchangeCount: 0, createdAt: '2025-12-05T16:00:00.000Z', updatedAt: '2025-12-05T16:00:00.000Z' },
]

const initialPointsLogs: PointsLog[] = [
  { id: 1, accountId: 1, nickname: '爱读书的猫', action: 'borrow', points: 5, description: '借阅《百年孤独》', relatedId: 1, createdAt: '2025-11-20T15:30:00.000Z' },
  { id: 2, accountId: 1, nickname: '爱读书的猫', action: 'review', points: 10, description: '发表《百年孤独》书评', relatedId: 1, createdAt: '2025-11-25T20:00:00.000Z' },
  { id: 3, accountId: 1, nickname: '爱读书的猫', action: 'review', points: 10, description: '发表《百年孤独》书评', relatedId: 2, createdAt: '2025-12-18T22:30:00.000Z' },
  { id: 4, accountId: 2, nickname: '夜读者', action: 'borrow', points: 5, description: '借阅《百年孤独》', relatedId: 1, createdAt: '2026-01-10T09:00:00.000Z' },
  { id: 5, accountId: 2, nickname: '夜读者', action: 'review', points: 10, description: '发表《百年孤独》书评', relatedId: 3, createdAt: '2026-01-15T14:20:00.000Z' },
  { id: 6, accountId: 5, nickname: '小王子的玫瑰', action: 'borrow', points: 5, description: '借阅《小王子》', relatedId: 2, createdAt: '2025-12-05T16:00:00.000Z' },
  { id: 7, accountId: 5, nickname: '小王子的玫瑰', action: 'review', points: 10, description: '发表《小王子》书评', relatedId: 5, createdAt: '2026-01-02T21:00:00.000Z' },
  { id: 8, accountId: 5, nickname: '小王子的玫瑰', action: 'meetup', points: 15, description: '参加《春日读书会：关于成长的故事》', relatedId: 2, createdAt: '2026-05-01T10:00:00.000Z' },
  { id: 9, accountId: 5, nickname: '小王子的玫瑰', action: 'meetup', points: 10, description: '参加《百年孤独》共读之夜', relatedId: 1, createdAt: '2026-06-02T11:00:00.000Z' },
]

const initialNotes: Note[] = [
  {
    id: 1,
    bookId: 1,
    bookTitle: '百年孤独',
    bookCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20hundred%20years%20of%20solitude%20magical%20realism%20latin%20america&image_size=portrait_4_3',
    nickname: '爱读书的猫',
    title: '布恩迪亚家族的宿命轮回',
    content: '读完《百年孤独》已经是第三遍了，每次都有不同的感受。马尔克斯用魔幻现实主义的笔法，描绘了布恩迪亚家族七代人的兴衰。\n\n最让我震撼的是乌尔苏拉这位女性，她是整个家族的支柱，活了很久很久，见证了家族的每一次兴衰。她的坚韧和生命力让人敬佩。\n\n书中那句"生命中曾经有过的所有灿烂，原来终究都需要用寂寞来偿还"，读来令人唏嘘。孤独是这个家族的宿命，也是每个人生命中难以回避的主题。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20realism%20butterflies%20yellow%20flying%20vintage%20warm%20light&image_size=landscape_4_3',
    ],
    visibility: 'public',
    likeCount: 12,
    commentCount: 3,
    viewCount: 86,
    createdAt: '2026-05-20T19:30:00.000Z',
    updatedAt: '2026-05-20T19:30:00.000Z',
  },
  {
    id: 2,
    bookId: 1,
    bookTitle: '百年孤独',
    bookCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20hundred%20years%20of%20solitude%20magical%20realism%20latin%20america&image_size=portrait_4_3',
    nickname: '夜读者',
    title: '关于孤独的随想',
    content: '在书店的角落读完了这本书，窗外下着雨，配合书中的氛围，别有一番滋味。\n\n马尔克斯笔下的马孔多小镇，像是一个微缩的世界。从最初的荒凉到后来的繁荣，再到最终的消失，一切都像是一场梦。\n\n每个人物都有自己的孤独：奥雷里亚诺上校在战争中迷失，阿玛兰妲在爱情与悔恨中挣扎，丽贝卡在墙中度过余生...\n\n也许孤独不是一种惩罚，而是生命的本质。接受孤独，才能真正理解生活。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rainy%20window%20bookstore%20cozy%20warm%20lamp%20reading%20atmosphere&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20town%20nostalgic%20latin%20american%20sunset%20peaceful&image_size=landscape_4_3',
    ],
    visibility: 'public',
    likeCount: 8,
    commentCount: 2,
    viewCount: 54,
    createdAt: '2026-06-01T22:15:00.000Z',
    updatedAt: '2026-06-01T22:15:00.000Z',
  },
  {
    id: 3,
    bookId: 2,
    bookTitle: '小王子',
    bookCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=little%20prince%20book%20cover%20starry%20night%20rose%20fox%20illustration&image_size=portrait_4_3',
    nickname: '小王子的玫瑰',
    title: '献给每个曾经是孩子的大人',
    content: '"所有大人都曾经是孩子，虽然很少有人记得这件事。"\n\n每次读《小王子》，都会被这句话击中。我们在成长的过程中，渐渐忘记了曾经的自己，变得只关心数字和"正经事"。\n\n小王子说："真正重要的东西，用眼睛是看不见的。" 爱、友谊、梦想...这些最珍贵的东西，都需要用心去感受。\n\n那朵骄傲的玫瑰，那只等待被驯服的狐狸，那颗会熄灭的星球...每个角色都有它的意义。\n\n希望我们都能保持一颗童心，记得看日落时的感动，记得为一朵玫瑰付出的时光。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=little%20prince%20starry%20night%20illustration%20dreamy%20magical&image_size=landscape_4_3',
    ],
    visibility: 'public',
    likeCount: 15,
    commentCount: 5,
    viewCount: 102,
    createdAt: '2026-05-15T14:00:00.000Z',
    updatedAt: '2026-05-15T14:00:00.000Z',
  },
  {
    id: 4,
    bookId: 5,
    bookTitle: '活着',
    bookCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=to%20live%20yu%20hua%20book%20cover%20chinese%20rural%20life%20sepia%20tone&image_size=portrait_4_3',
    nickname: '文字的力量',
    title: '活着本身就是意义',
    content: '余华的文字像一把钝刀，慢慢割着你的心，却又让你欲罢不能。\n\n福贵的一生经历了太多的苦难：家道中落、失去亲人、战乱饥荒...到最后只剩他和一头老牛相依为命。\n\n但即使在最黑暗的时候，福贵也没有放弃活下去的希望。他说："人是为活着本身而活着，而不是为了活着之外的任何事物而活着。"\n\n读完这本书，我重新思考了生命的意义。我们常常为了名利奔波，却忘记了最朴素的道理——活着，本身就是最大的幸福。',
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20chinese%20village%20sunset%20farmer%20water%20buffalo%20peaceful%20rural&image_size=landscape_4_3',
    ],
    visibility: 'public',
    likeCount: 10,
    commentCount: 4,
    viewCount: 78,
    createdAt: '2026-06-05T20:45:00.000Z',
    updatedAt: '2026-06-05T20:45:00.000Z',
  },
  {
    id: 5,
    bookId: 3,
    bookTitle: '追风筝的人',
    bookCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kite%20runner%20book%20cover%20afghanistan%20kite%20sky%20warm%20colors&image_size=portrait_4_3',
    nickname: '追风筝的人',
    title: '为你，千千万万遍',
    content: '这句话在书中出现了很多次，每次都让我热泪盈眶。\n\n阿米尔和哈桑的故事，关于友谊、背叛和救赎。每个人的生命中也许都有一只追不到的风筝，都有一个想弥补却无法弥补的遗憾。\n\n但重要的是，我们还有机会去寻找救赎的道路。阿米尔最终鼓起勇气回到阿富汗，去寻找哈桑的儿子，也是在寻找内心的平静。\n\n也许我们无法改变过去，但我们可以选择如何面对未来。愿每个人都能追到属于自己的那只风筝。',
    images: [],
    visibility: 'public',
    likeCount: 7,
    commentCount: 1,
    viewCount: 45,
    createdAt: '2026-06-08T16:20:00.000Z',
    updatedAt: '2026-06-08T16:20:00.000Z',
  },
  {
    id: 6,
    bookId: 1,
    bookTitle: '百年孤独',
    bookCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=book%20cover%20hundred%20years%20of%20solitude%20magical%20realism%20latin%20america&image_size=portrait_4_3',
    nickname: '书虫阿明',
    title: '读书笔记（私密）',
    content: '这是我的私人读书笔记，记录一些个人感想...\n\n第一章的开头那句"多年以后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午"，真的是神来之笔。\n\n时间的循环、命运的轮回，在这句话里就已经铺垫好了。\n\n待续...',
    images: [],
    visibility: 'private',
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    createdAt: '2026-06-03T11:00:00.000Z',
    updatedAt: '2026-06-03T11:00:00.000Z',
  },
]

const initialNoteComments: NoteComment[] = [
  { id: 1, noteId: 1, nickname: '夜读者', content: '写得太好了！乌尔苏拉确实是全书最有力量的女性角色。', createdAt: '2026-05-21T08:30:00.000Z' },
  { id: 2, noteId: 1, nickname: '小王子的玫瑰', content: '马尔克斯的文字真的有魔法，每次读都有新的感悟。', createdAt: '2026-05-22T15:45:00.000Z' },
  { id: 3, noteId: 1, nickname: '追风筝的人', content: '最喜欢的就是那段关于寂寞的描述，太戳心了。', createdAt: '2026-05-25T10:20:00.000Z' },
  { id: 4, noteId: 2, nickname: '爱读书的猫', content: '雨夜读书，想想就很有氛围啊！', createdAt: '2026-06-02T09:15:00.000Z' },
  { id: 5, noteId: 2, nickname: '文字的力量', content: '马孔多的兴衰，像是整个人类文明的缩影。', createdAt: '2026-06-03T14:30:00.000Z' },
  { id: 6, noteId: 3, nickname: '不想长大', content: '这本书真的是写给大人的童话，每次读都想哭。', createdAt: '2026-05-16T12:00:00.000Z' },
  { id: 7, noteId: 3, nickname: '爱读书的猫', content: '"用心去看才能看得清楚"，这句话我也很喜欢！', createdAt: '2026-05-17T18:20:00.000Z' },
  { id: 8, noteId: 3, nickname: '书虫阿明', content: '狐狸和小王子的那段对话，每次看都很感动。', createdAt: '2026-05-18T09:45:00.000Z' },
  { id: 9, noteId: 3, nickname: '夜读者', content: '保持童心，是我们能送给自己最好的礼物。', createdAt: '2026-05-20T21:10:00.000Z' },
  { id: 10, noteId: 3, nickname: '平凡的人', content: '谢谢分享，让我想再读一遍小王子了。', createdAt: '2026-05-22T16:30:00.000Z' },
  { id: 11, noteId: 4, nickname: '平凡的人', content: '余华的书总是让人又爱又怕，太虐了但又放不下。', createdAt: '2026-06-06T08:00:00.000Z' },
  { id: 12, noteId: 4, nickname: '爱读书的猫', content: '"活着本身就是意义"，说得太好了。', createdAt: '2026-06-07T10:25:00.000Z' },
  { id: 13, noteId: 4, nickname: '书虫阿明', content: '读完《活着》那段时间，我特别珍惜每一天。', createdAt: '2026-06-07T19:40:00.000Z' },
  { id: 14, noteId: 4, nickname: '小王子的玫瑰', content: '福贵的 resilience（韧性）真的让人敬佩。', createdAt: '2026-06-08T12:15:00.000Z' },
  { id: 15, noteId: 5, nickname: '文字的力量', content: '为你，千千万万遍。这句话也让我印象很深。', createdAt: '2026-06-09T11:30:00.000Z' },
]

const initialNoteLikes: NoteLike[] = [
  { id: 1, noteId: 1, nickname: '夜读者', createdAt: '2026-05-21T08:00:00.000Z' },
  { id: 2, noteId: 1, nickname: '小王子的玫瑰', createdAt: '2026-05-21T14:30:00.000Z' },
  { id: 3, noteId: 1, nickname: '追风筝的人', createdAt: '2026-05-22T10:15:00.000Z' },
  { id: 4, noteId: 1, nickname: '文字的力量', createdAt: '2026-05-23T16:45:00.000Z' },
  { id: 5, noteId: 1, nickname: '书虫阿明', createdAt: '2026-05-24T09:20:00.000Z' },
  { id: 6, noteId: 1, nickname: '不想长大', createdAt: '2026-05-25T11:00:00.000Z' },
  { id: 7, noteId: 1, nickname: '平凡的人', createdAt: '2026-05-26T13:30:00.000Z' },
  { id: 8, noteId: 1, nickname: '童话少女', createdAt: '2026-05-27T15:45:00.000Z' },
  { id: 9, noteId: 1, nickname: '读书人小刘', createdAt: '2026-05-28T17:20:00.000Z' },
  { id: 10, noteId: 1, nickname: '文学爱好者', createdAt: '2026-05-29T08:10:00.000Z' },
  { id: 11, noteId: 1, nickname: '书虫阿明', createdAt: '2026-05-30T10:00:00.000Z' },
  { id: 12, noteId: 1, nickname: '夜读者', createdAt: '2026-05-31T12:30:00.000Z' },
]

export interface Database {
  books: Book[]
  traceLogs: TraceLog[]
  reviews: Review[]
  meetups: Meetup[]
  registrations: Registration[]
  checkIns: CheckIn[]
  reservations: Reservation[]
  pointsAccounts: PointsAccount[]
  pointsLogs: PointsLog[]
  donationReviews: DonationReview[]
  notes: Note[]
  noteComments: NoteComment[]
  noteLikes: NoteLike[]
  borrowRecords: BorrowRecord[]
  notifications: Notification[]
  exchangeListings: ExchangeListing[]
  exchangeRequests: ExchangeRequest[]
  nextBookId: number
  nextTraceLogId: number
  nextReviewId: number
  nextMeetupId: number
  nextRegistrationId: number
  nextCheckInId: number
  nextReservationId: number
  nextPointsAccountId: number
  nextPointsLogId: number
  nextDonationReviewId: number
  nextNoteId: number
  nextNoteCommentId: number
  nextNoteLikeId: number
  nextBorrowRecordId: number
  nextNotificationId: number
  nextExchangeListingId: number
  nextExchangeRequestId: number
}

const initialCheckIns: CheckIn[] = [
  { id: 1, meetupId: 2, registrationId: 3, nickname: '小王子的玫瑰', createdAt: '2026-05-15T13:55:00.000Z' }
]

const today = new Date('2026-06-11T00:00:00.000Z')
const daysAgo = (d: number) => new Date(today.getTime() - d * 86400000).toISOString()
const daysLater = (d: number) => new Date(today.getTime() + d * 86400000).toISOString()

const initialBorrowRecords: BorrowRecord[] = [
  { id: 1, bookId: 1, borrower: '夜读者', borrowDate: daysAgo(45), dueDate: daysAgo(15), status: 'overdue', reminderCount: 1, lastReminderAt: daysAgo(10), createdAt: daysAgo(45), updatedAt: daysAgo(10) },
  { id: 2, bookId: 2, borrower: '童话少女', borrowDate: daysAgo(10), dueDate: daysLater(20), status: 'borrowing', reminderCount: 0, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
]

const initialExchangeListings: ExchangeListing[] = [
  {
    id: 1, bookId: 0, owner: '爱读书的猫', ownerContact: '13800138001',
    bookTitle: '解忧杂货店', bookAuthor: '东野圭吾', category: '文学小说', condition: '九成新',
    bookCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=japanese%20novel%20book%20cover%20warm%20light%20nostalgic%20shop%20evening&image_size=portrait_4_3',
    wantCategories: ['历史社科', '哲学思想'], wantBookNames: ['人类简史'], description: '东野圭吾的非推理暖心之作，读完非常感动，想换社科类书籍',
    status: 'active', createdAt: daysAgo(5), updatedAt: daysAgo(5),
  },
  {
    id: 2, bookId: 0, owner: '追风筝的人', ownerContact: '13800138002',
    bookTitle: '三体', bookAuthor: '刘慈欣', category: '科幻小说', condition: '八成新',
    bookCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=three%20body%20problem%20scifi%20book%20cover%20space%20universe%20dark%20forest&image_size=portrait_4_3',
    wantCategories: ['文学小说'], wantBookNames: ['百年孤独', '霍乱时期的爱情'], description: '科幻神作，想换拉美文学类图书',
    status: 'active', createdAt: daysAgo(3), updatedAt: daysAgo(3),
  },
  {
    id: 3, bookId: 0, owner: '小王子的玫瑰', ownerContact: '13900139001',
    bookTitle: '小王子（法语原版）', bookAuthor: '安托万·德·圣-埃克苏佩里', category: '儿童文学', condition: '全新',
    bookCover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=little%20prince%20french%20edition%20book%20cover%20elegant%20minimalist&image_size=portrait_4_3',
    wantCategories: ['艺术', '摄影'], wantBookNames: [], description: '法语原版小王子，全新未拆封，想换艺术或摄影类书籍',
    status: 'active', createdAt: daysAgo(1), updatedAt: daysAgo(1),
  },
]

const initialExchangeRequests: ExchangeRequest[] = [
  {
    id: 1, listingId: 1, requester: '夜读者', requesterContact: '13700137001',
    offeredBookTitle: '枪炮、病菌与钢铁', offeredBookAuthor: '贾雷德·戴蒙德',
    offeredBookCategory: '历史社科', offeredBookCondition: '九成新',
    message: '这本社科经典你可能会喜欢，讲的是人类社会的命运',
    status: 'pending', createdAt: daysAgo(2), updatedAt: daysAgo(2),
  },
  {
    id: 2, listingId: 2, requester: '文字的力量', requesterContact: '13600136001',
    offeredBookTitle: '百年孤独', offeredBookAuthor: '加西亚·马尔克斯',
    offeredBookCategory: '文学小说', offeredBookCondition: '七成新',
    message: '正好有百年孤独，品相一般但内容精彩',
    status: 'pending', createdAt: daysAgo(1), updatedAt: daysAgo(1),
  },
]

const initialNotifications: Notification[] = [
  { id: 1, nickname: '夜读者', type: 'reminder', title: '图书借阅到期提醒', content: '您借阅的《百年孤独》已于 2026年5月27日到期，请尽快归还。', relatedBookId: 1, relatedBookTitle: '百年孤独', read: false, createdAt: daysAgo(10), emailSent: true, emailSentAt: daysAgo(10) },
]

const initialDB: Database = {
  books: initialBooks,
  traceLogs: initialTraceLogs,
  reviews: initialReviews,
  meetups: initialMeetups,
  registrations: initialRegistrations.map(r => 
    r.id === 3 ? { ...r, checkedIn: true, checkedInAt: '2026-05-15T13:55:00.000Z' } : r
  ),
  checkIns: initialCheckIns,
  reservations: initialReservations,
  pointsAccounts: initialPointsAccounts,
  pointsLogs: initialPointsLogs,
  donationReviews: [],
  notes: initialNotes,
  noteComments: initialNoteComments,
  noteLikes: initialNoteLikes,
  borrowRecords: initialBorrowRecords,
  notifications: initialNotifications,
  exchangeListings: initialExchangeListings,
  exchangeRequests: initialExchangeRequests,
  nextBookId: 6,
  nextTraceLogId: 9,
  nextReviewId: 9,
  nextMeetupId: 4,
  nextRegistrationId: 4,
  nextCheckInId: 2,
  nextReservationId: 4,
  nextPointsAccountId: 12,
  nextPointsLogId: 10,
  nextDonationReviewId: 1,
  nextNoteId: 7,
  nextNoteCommentId: 16,
  nextNoteLikeId: 13,
  nextBorrowRecordId: 3,
  nextNotificationId: 2,
  nextExchangeListingId: 4,
  nextExchangeRequestId: 3,
}

let db: Database = initialDB

function loadDB(): Database {
  ensureDataDir()
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(raw) as Partial<Database>
      
      if (!parsed.notes) {
        parsed.notes = initialNotes
        parsed.noteComments = initialNoteComments
        parsed.noteLikes = initialNoteLikes
        parsed.nextNoteId = 7
        parsed.nextNoteCommentId = 16
        parsed.nextNoteLikeId = 13
        saveDB(parsed as Database)
      }
      
      if (!parsed.checkIns) {
        parsed.checkIns = []
        parsed.nextCheckInId = 1
        saveDB(parsed as Database)
      }

      if (!parsed.borrowRecords) {
        parsed.borrowRecords = []
        parsed.nextBorrowRecordId = 1
        console.log('[DB Migration] 初始化借阅记录表')
      }
      if (!parsed.notifications) {
        parsed.notifications = []
        parsed.nextNotificationId = 1
        console.log('[DB Migration] 初始化通知表')
      }
      if (parsed.nextBorrowRecordId === undefined) {
        parsed.nextBorrowRecordId = (parsed.borrowRecords?.length || 0) + 1
      }
      if (parsed.nextNotificationId === undefined) {
        parsed.nextNotificationId = (parsed.notifications?.length || 0) + 1
      }
      
      if (!parsed.exchangeListings) {
        parsed.exchangeListings = initialExchangeListings
        parsed.exchangeRequests = initialExchangeRequests
        parsed.nextExchangeListingId = 4
        parsed.nextExchangeRequestId = 3
        saveDB(parsed as Database)
        console.log('[DB Migration] 初始化图书交换市场数据')
      }
      
      if (parsed.pointsAccounts) {
        let needMigrate = false
        for (const acc of parsed.pointsAccounts) {
          if (acc.exchangeCount === undefined) {
            acc.exchangeCount = 0
            needMigrate = true
          }
        }
        if (needMigrate) {
          saveDB(parsed as Database)
          console.log('[DB Migration] 为积分账户添加 exchangeCount 字段')
        }
      }
      
      console.log(`[DB] 已从 ${DATA_FILE} 加载数据`)
      console.log(`[DB] 图书: ${parsed.books?.length || 0} 本 | 读书会: ${parsed.meetups?.length || 0} 个 | 短评: ${parsed.reviews?.length || 0} 条 | 笔记: ${parsed.notes?.length || 0} 条`)
      console.log(`[DB] 借阅记录: ${parsed.borrowRecords?.length || 0} 条 | 通知: ${parsed.notifications?.length || 0} 条`)
      return parsed as Database
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

export function addBook(bookData: Omit<Book, 'id' | 'traceId' | 'createdAt' | 'borrowCount' | 'discussCount'> & { donor?: string }): { book: Book; pointsResult?: ReturnType<typeof addPoints> } {
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

  let pointsResult
  if (bookData.sourceType === 'donation' && bookData.donor) {
    pointsResult = addPoints(
      bookData.donor,
      'donation',
      `捐赠《${newBook.title}》`,
      newBook.id
    )
  }
  
  persistDB()
  return { book: newBook, pointsResult }
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

export function addReview(bookId: number, data: Omit<Review, 'id' | 'bookId' | 'createdAt'>): { review: Review; pointsResult?: ReturnType<typeof addPoints> } {
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

  let pointsResult
  if (data.nickname) {
    pointsResult = addPoints(
      data.nickname,
      'review',
      `发表《${book?.title || '图书'}》书评`,
      review.id
    )
  }
  
  persistDB()
  return { review, pointsResult }
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

export function registerMeetup(meetupId: number, data: Omit<Registration, 'id' | 'meetupId' | 'createdAt'>): { registration: Registration } | null {
  const meetup = db.meetups.find(m => m.id === meetupId)
  if (!meetup || meetup.currentParticipants >= meetup.maxParticipants) {
    return null
  }
  
  const existingReg = db.registrations.find(r => r.meetupId === meetupId && r.nickname === data.nickname)
  if (existingReg) {
    return { registration: existingReg }
  }
  
  const registration: Registration = {
    ...data,
    id: db.nextRegistrationId++,
    meetupId,
    createdAt: new Date().toISOString(),
    checkedIn: false,
  }
  db.registrations.push(registration)
  meetup.currentParticipants++
  
  persistDB()
  return { registration }
}

export function checkInMeetup(meetupId: number, nickname: string): { checkIn: CheckIn; pointsResult?: ReturnType<typeof addPoints> } | { error: string } {
  const meetup = db.meetups.find(m => m.id === meetupId)
  if (!meetup) {
    return { error: '读书会不存在' }
  }
  
  const registration = db.registrations.find(r => r.meetupId === meetupId && r.nickname === nickname)
  if (!registration) {
    return { error: '您未报名本次活动' }
  }
  
  if (registration.checkedIn) {
    return { error: '您已完成签到' }
  }
  
  const now = new Date().toISOString()
  registration.checkedIn = true
  registration.checkedInAt = now
  
  const checkIn: CheckIn = {
    id: db.nextCheckInId++,
    meetupId,
    registrationId: registration.id,
    nickname,
    createdAt: now,
  }
  db.checkIns.push(checkIn)
  
  const pointsResult = addPoints(
    nickname,
    'meetup',
    `参加《${meetup.title}》读书会`,
    meetupId
  )
  
  persistDB()
  return { checkIn, pointsResult }
}

export function getCheckInsByMeetup(meetupId: number): CheckIn[] {
  return db.checkIns
    .filter(c => c.meetupId === meetupId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function getMeetupCheckInStats(meetupId: number): { totalRegistered: number; totalCheckedIn: number; checkInRate: number; checkIns: CheckIn[] } {
  const registrations = db.registrations.filter(r => r.meetupId === meetupId)
  const checkedIn = registrations.filter(r => r.checkedIn)
  const totalRegistered = registrations.length
  const totalCheckedIn = checkedIn.length
  const checkInRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0
  const checkIns = getCheckInsByMeetup(meetupId)
  return { totalRegistered, totalCheckedIn, checkInRate, checkIns }
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
  const activeRecord = db.borrowRecords.find(
    r => r.bookId === bookId && (r.status === 'borrowing' || r.status === 'overdue')
  )
  if (activeRecord) return true
  const logs = db.traceLogs
    .filter(l => l.bookId === bookId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return logs.length > 0 && logs[0].action === '借出'
}

export function getActiveBorrowRecord(bookId: number): BorrowRecord | null {
  const now = new Date()
  const record = db.borrowRecords.find(
    r => r.bookId === bookId && (r.status === 'borrowing' || r.status === 'overdue')
  ) || null
  if (record && record.status === 'borrowing') {
    const dueDate = new Date(record.dueDate)
    if (now > dueDate) {
      record.status = 'overdue'
      record.updatedAt = now.toISOString()
      persistDB()
    }
  }
  return record
}

export function calculateDaysRemaining(dueDate: string): { daysRemaining: number; isOverdue: boolean; overdueDays: number } {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return {
    daysRemaining: Math.max(0, diffDays),
    isOverdue: diffDays < 0,
    overdueDays: Math.max(0, -diffDays),
  }
}

export function getBookBorrowStatusDetail(bookId: number): BookBorrowStatus {
  const record = getActiveBorrowRecord(bookId)
  if (!record) {
    return { borrowed: false }
  }
  const { daysRemaining, isOverdue, overdueDays } = calculateDaysRemaining(record.dueDate)
  return {
    borrowed: true,
    borrowRecord: record,
    daysRemaining,
    isOverdue,
    overdueDays,
  }
}

export function createBorrowRecord(
  bookId: number,
  borrower: string,
  contact?: string,
  borrowDays: number = 30
): BorrowRecord {
  const now = new Date()
  const borrowDate = now.toISOString()
  const dueDate = new Date(now.getTime() + borrowDays * 86400000).toISOString()
  const record: BorrowRecord = {
    id: db.nextBorrowRecordId++,
    bookId,
    borrower,
    contact,
    borrowDate,
    dueDate,
    status: 'borrowing',
    reminderCount: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
  db.borrowRecords.push(record)
  persistDB()
  console.log(`[Borrow] 创建借阅记录: ${borrower} 借阅图书#${bookId}, 期限${borrowDays}天`)
  return record
}

export function closeBorrowRecord(bookId: number): BorrowRecord | null {
  const record = getActiveBorrowRecord(bookId)
  if (!record) return null
  record.returnDate = new Date().toISOString()
  record.status = 'returned'
  record.updatedAt = new Date().toISOString()
  persistDB()
  console.log(`[Borrow] 关闭借阅记录: 图书#${bookId} 已归还`)
  return record
}

export function getAllActiveBorrowRecords(): BorrowRecordWithBook[] {
  const now = new Date()
  return db.borrowRecords
    .filter(r => r.status === 'borrowing' || r.status === 'overdue')
    .map(r => {
      if (r.status === 'borrowing') {
        const dueDate = new Date(r.dueDate)
        if (now > dueDate) {
          r.status = 'overdue'
          r.updatedAt = now.toISOString()
        }
      }
      const book = db.books.find(b => b.id === r.bookId)
      return book ? { ...r, book } : null
    })
    .filter((item): item is BorrowRecordWithBook => item !== null)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}

export function getAllOverdueRecords(): BorrowRecordWithBook[] {
  return getAllActiveBorrowRecords().filter(r => r.status === 'overdue')
}

export function getActiveBorrowRecordsByBorrower(borrower: string): BorrowRecordWithBook[] {
  return getAllActiveBorrowRecords().filter(r => r.borrower === borrower)
}

export function getOverdueRecordsByBorrower(borrower: string): BorrowRecordWithBook[] {
  return getAllActiveBorrowRecords().filter(
    r => r.borrower === borrower && r.status === 'overdue'
  )
}

export function createNotification(
  nickname: string,
  type: NotificationType,
  title: string,
  content: string,
  relatedBookId?: number,
  relatedBookTitle?: string
): Notification {
  const notification: Notification = {
    id: db.nextNotificationId++,
    nickname,
    type,
    title,
    content,
    relatedBookId,
    relatedBookTitle,
    read: false,
    createdAt: new Date().toISOString(),
  }
  db.notifications.push(notification)
  persistDB()
  console.log(`[Notify] 创建通知: ${nickname} - ${title}`)
  return notification
}

export function sendReminder(
  borrowRecordId: number,
  operator?: string
): { record: BorrowRecord; notification: Notification; traceLog: TraceLog } | null {
  const record = db.borrowRecords.find(r => r.id === borrowRecordId)
  if (!record || record.status === 'returned') {
    return null
  }
  const book = db.books.find(b => b.id === record.bookId)
  const { overdueDays, daysRemaining, isOverdue } = calculateDaysRemaining(record.dueDate)
  const bookTitle = book?.title || `图书#${record.bookId}`

  let title: string
  let content: string
  if (isOverdue) {
    title = '图书借阅逾期提醒'
    content = `您借阅的《${bookTitle}》已逾期 ${overdueDays} 天（应还日期：${new Date(record.dueDate).toLocaleDateString('zh-CN')}），请尽快归还，以免影响您的信用。`
  } else {
    title = '图书借阅即将到期提醒'
    content = `您借阅的《${bookTitle}》还有 ${daysRemaining} 天到期（应还日期：${new Date(record.dueDate).toLocaleDateString('zh-CN')}），请注意按时归还或办理续借。`
  }

  const notification = createNotification(
    record.borrower,
    'reminder',
    title,
    content,
    record.bookId,
    bookTitle
  )

  try {
    notification.emailSent = true
    notification.emailSentAt = new Date().toISOString()
    console.log(`[Email] 模拟发送催还邮件至 ${record.borrower}: ${title}`)
  } catch (err) {
    console.error('[Email] 邮件发送失败:', err)
  }

  record.reminderCount++
  record.reminderSent = true
  record.lastReminderAt = new Date().toISOString()
  record.updatedAt = new Date().toISOString()

  const traceLog = addTraceLog(
    record.bookId,
    '催还',
    `${operator || '管理员'}向借阅人「${record.borrower}」发送催还提醒（第${record.reminderCount}次）`,
    operator || '管理员'
  )

  persistDB()
  console.log(`[Reminder] 催还提醒已发送: ${record.borrower} - 《${bookTitle}》`)
  return { record, notification, traceLog }
}

export function getNotifications(nickname: string): Notification[] {
  return db.notifications
    .filter(n => n.nickname === nickname)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function markNotificationRead(notificationId: number, nickname: string): Notification | null {
  const notification = db.notifications.find(
    n => n.id === notificationId && n.nickname === nickname
  )
  if (!notification) return null
  notification.read = true
  persistDB()
  return notification
}

export function getUnreadNotificationCount(nickname: string): number {
  return db.notifications.filter(n => n.nickname === nickname && !n.read).length
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

export function returnBook(bookId: number, operator?: string): { book: Book; traceLog: TraceLog; notifiedReservation: Reservation | null; borrowRecord: BorrowRecord | null } | null {
  const book = db.books.find(b => b.id === bookId)
  if (!book) {
    return null
  }
  if (!isBookBorrowed(bookId)) {
    return null
  }
  const traceLog = addTraceLog(bookId, '归还', `读者归还图书，书店${operator || '管理员'}登记`, operator || '管理员')
  const borrowRecord = closeBorrowRecord(bookId)
  const notifiedReservation = notifyNextInQueue(bookId)
  persistDB()
  return { book, traceLog, notifiedReservation, borrowRecord }
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

export function getOrCreatePointsAccount(nickname: string): PointsAccount {
  let account = db.pointsAccounts.find(a => a.nickname === nickname)
  if (!account) {
    account = {
      id: db.nextPointsAccountId++,
      nickname,
      points: 0,
      level: 'bookworm',
      borrowCount: 0,
      reviewCount: 0,
      meetupCount: 0,
      donationCount: 0,
      exchangeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    db.pointsAccounts.push(account)
    persistDB()
    console.log(`[Points] 为用户 ${nickname} 创建积分账户`)
  }
  return account
}

export function getPointsAccount(nickname: string): PointsAccount | null {
  return db.pointsAccounts.find(a => a.nickname === nickname) || null
}

export function addPoints(
  nickname: string,
  action: PointsActionType,
  description: string,
  relatedId?: number
): { account: PointsAccount; log: PointsLog; levelUp: boolean } {
  const account = getOrCreatePointsAccount(nickname)
  const actionConfig = POINTS_ACTION[action]
  const oldLevel = account.level
  const oldPoints = account.points

  account.points += actionConfig.points
  account.updatedAt = new Date().toISOString()

  const countKey = `${action}Count` as keyof PointsAccount
  if (countKey in account && typeof account[countKey] === 'number') {
    (account[countKey] as number)++
  }

  const newLevel = calculateLevel(account.points)
  account.level = newLevel
  const levelUp = oldLevel !== newLevel

  const log: PointsLog = {
    id: db.nextPointsLogId++,
    accountId: account.id,
    nickname,
    action,
    points: actionConfig.points,
    description,
    relatedId,
    createdAt: new Date().toISOString(),
  }
  db.pointsLogs.push(log)

  persistDB()

  if (levelUp) {
    console.log(`[Points] 用户 ${nickname} 升级! ${oldLevel}(${oldPoints}) -> ${newLevel}(${account.points})`)
  } else {
    console.log(`[Points] 用户 ${nickname} 获得 ${actionConfig.points} 积分, 当前: ${account.points}`)
  }

  return { account, log, levelUp }
}

export function getPointsRanking(limit: number = 10): ReaderRanking[] {
  return [...db.pointsAccounts]
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map(a => ({
      nickname: a.nickname,
      points: a.points,
      level: a.level,
      borrowCount: a.borrowCount,
    }))
}

export function getBorrowRanking(limit: number = 10): ReaderRanking[] {
  return [...db.pointsAccounts]
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, limit)
    .map(a => ({
      nickname: a.nickname,
      points: a.points,
      level: a.level,
      borrowCount: a.borrowCount,
    }))
}

export function getPointsLogs(nickname: string, limit: number = 20): PointsLog[] {
  const account = getPointsAccount(nickname)
  if (!account) return []
  return db.pointsLogs
    .filter(l => l.accountId === account.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export function getReaderProfile(nickname: string): ReaderProfile | null {
  const account = getPointsAccount(nickname)
  if (!account) return null

  const logs = getPointsLogs(nickname, 50)

  const borrowHistory = db.traceLogs
    .filter(l => l.action === '借出' && l.description.includes(nickname))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(l => {
      const book = db.books.find(b => b.id === l.bookId)
      return book ? { book, traceLog: l } : null
    })
    .filter((item): item is { book: Book; traceLog: TraceLog } => item !== null)

  const reviews = db.reviews
    .filter(r => r.nickname === nickname)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const meetups = db.registrations
    .filter(r => r.nickname === nickname)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(r => {
      const meetup = db.meetups.find(m => m.id === r.meetupId)
      return meetup ? { meetup, registration: r } : null
    })
    .filter((item): item is { meetup: Meetup; registration: Registration } => item !== null)

  const donations = db.books
    .filter(b => b.sourceType === 'donation' && b.sourceInfo?.includes(nickname))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const donationReviews = getDonationReviewsByDonor(nickname)

  const notes = db.notes
    .filter(n => n.nickname === nickname)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return {
    account,
    logs,
    borrowHistory,
    currentBorrowings: getActiveBorrowRecordsByBorrower(nickname),
    overdueRecords: getOverdueRecordsByBorrower(nickname),
    reviews,
    meetups,
    donations,
    donationReviews,
    notes,
    unreadNotificationCount: getUnreadNotificationCount(nickname),
  }
}

export function getReviewWithLevel(review: Review): Review & { level?: string } {
  const account = getPointsAccount(review.nickname)
  if (account) {
    return { ...review, level: account.level }
  }
  return review
}

export function getReviewsWithLevel(bookId: number): Review[] {
  const reviews = db.reviews
    .filter(r => r.bookId === bookId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return reviews.map(r => getReviewWithLevel(r))
}

export function createDonationReview(data: Omit<DonationReview, 'id' | 'status' | 'reviewNote' | 'reviewedAt' | 'reviewer' | 'bookPhotos' | 'bookId' | 'createdAt' | 'updatedAt'>): DonationReview {
  const now = new Date().toISOString()
  const review: DonationReview = {
    ...data,
    id: db.nextDonationReviewId++,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  db.donationReviews.push(review)
  persistDB()
  console.log(`[DonationReview] 新捐赠审核申请: ${data.title} (捐赠者: ${data.donor})`)
  return review
}

export function getPendingDonationReviews(): DonationReview[] {
  return db.donationReviews
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function getAllDonationReviews(): DonationReview[] {
  return db.donationReviews
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getDonationReviewById(id: number): DonationReview | null {
  return db.donationReviews.find(r => r.id === id) || null
}

export function getDonationReviewsByDonor(donor: string): DonationReview[] {
  return db.donationReviews
    .filter(r => r.donor === donor)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function approveDonationReview(
  id: number,
  corrections: Partial<Pick<DonationReview, 'title' | 'author' | 'isbn' | 'publisher' | 'category' | 'sourceInfo' | 'coverImage' | 'description'>> & { bookPhotos?: string[]; reviewer?: string }
): { review: DonationReview; book: Book; pointsResult?: ReturnType<typeof addPoints> } | null {
  const review = db.donationReviews.find(r => r.id === id)
  if (!review || review.status !== 'pending') return null

  const now = new Date().toISOString()
  review.status = 'approved'
  review.reviewer = corrections.reviewer || '管理员'
  review.reviewedAt = now
  review.updatedAt = now

  if (corrections.bookPhotos) {
    review.bookPhotos = corrections.bookPhotos
  }

  const bookData: Omit<Book, 'id' | 'traceId' | 'createdAt' | 'borrowCount' | 'discussCount'> & { donor?: string } = {
    title: corrections.title || review.title,
    author: corrections.author || review.author,
    isbn: corrections.isbn || review.isbn,
    publisher: corrections.publisher || review.publisher,
    category: corrections.category || review.category,
    sourceType: 'donation',
    sourceInfo: corrections.sourceInfo || review.sourceInfo || `由${review.donor}捐赠`,
    coverImage: corrections.coverImage || review.coverImage,
    description: corrections.description || review.description,
    donor: review.donor,
  }

  const result = addBook(bookData)
  review.bookId = result.book.id

  addTraceLog(result.book.id, '捐赠', `${review.donor}捐赠《${result.book.title}》，审核通过正式入库`, review.reviewer)

  persistDB()
  console.log(`[DonationReview] 捐赠审核通过: ${review.title} -> 图书ID ${result.book.id}`)

  return { review, book: result.book, pointsResult: result.pointsResult }
}

export function rejectDonationReview(id: number, reviewNote: string, reviewer?: string): DonationReview | null {
  const review = db.donationReviews.find(r => r.id === id)
  if (!review || review.status !== 'pending') return null

  const now = new Date().toISOString()
  review.status = 'rejected'
  review.reviewNote = reviewNote
  review.reviewer = reviewer || '管理员'
  review.reviewedAt = now
  review.updatedAt = now

  persistDB()
  console.log(`[DonationReview] 捐赠审核驳回: ${review.title} (原因: ${reviewNote})`)
  return review
}

export function createNote(data: CreateNoteRequest): { note: Note; pointsResult?: ReturnType<typeof addPoints> } {
  const book = db.books.find(b => b.id === data.bookId)
  const now = new Date().toISOString()
  
  const note: Note = {
    id: db.nextNoteId++,
    bookId: data.bookId,
    bookTitle: book?.title,
    bookCover: book?.coverImage,
    nickname: data.nickname,
    title: data.title,
    content: data.content,
    images: data.images || [],
    visibility: data.visibility,
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  
  db.notes.push(note)
  
  let pointsResult
  if (data.visibility === 'public') {
    pointsResult = addPoints(
      data.nickname,
      'review',
      `发表《${book?.title || '图书'}》读书笔记`,
      note.id
    )
  }
  
  persistDB()
  console.log(`[Note] 新笔记: ${note.title} (作者: ${note.nickname})`)
  return { note, pointsResult }
}

export function getNoteById(id: number): Note | null {
  return db.notes.find(n => n.id === id) || null
}

export function getNotesByBook(bookId: number, includePrivate: boolean = false): Note[] {
  let notes = db.notes.filter(n => n.bookId === bookId)
  if (!includePrivate) {
    notes = notes.filter(n => n.visibility === 'public')
  }
  return notes.sort((a, b) => {
    const hotA = a.likeCount * 3 + a.commentCount * 2 + a.viewCount
    const hotB = b.likeCount * 3 + b.commentCount * 2 + b.viewCount
    return hotB - hotA
  })
}

export function getNotesByUser(nickname: string): Note[] {
  return db.notes
    .filter(n => n.nickname === nickname)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getHotNotes(limit: number = 10, days?: number): Note[] {
  let notes = db.notes.filter(n => n.visibility === 'public')
  
  if (days) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    notes = notes.filter(n => new Date(n.createdAt) >= cutoff)
  }
  
  return notes
    .sort((a, b) => {
      const hotA = a.likeCount * 3 + a.commentCount * 2 + a.viewCount
      const hotB = b.likeCount * 3 + b.commentCount * 2 + b.viewCount
      return hotB - hotA
    })
    .slice(0, limit)
}

export function incrementNoteView(id: number): Note | null {
  const note = db.notes.find(n => n.id === id)
  if (!note) return null
  note.viewCount++
  persistDB()
  return note
}

export function toggleNoteLike(noteId: number, nickname: string): { note: Note; liked: boolean } | null {
  const note = db.notes.find(n => n.id === noteId)
  if (!note) return null
  
  const existingLike = db.noteLikes.find(l => l.noteId === noteId && l.nickname === nickname)
  
  if (existingLike) {
    db.noteLikes = db.noteLikes.filter(l => l.id !== existingLike.id)
    note.likeCount = Math.max(0, note.likeCount - 1)
    persistDB()
    return { note, liked: false }
  } else {
    const like: NoteLike = {
      id: db.nextNoteLikeId++,
      noteId,
      nickname,
      createdAt: new Date().toISOString(),
    }
    db.noteLikes.push(like)
    note.likeCount++
    persistDB()
    return { note, liked: true }
  }
}

export function hasLikedNote(noteId: number, nickname: string): boolean {
  return db.noteLikes.some(l => l.noteId === noteId && l.nickname === nickname)
}

export function getNoteComments(noteId: number): NoteComment[] {
  return db.noteComments
    .filter(c => c.noteId === noteId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function addNoteComment(noteId: number, data: { nickname: string; content: string }): { comment: NoteComment; note: Note } | null {
  const note = db.notes.find(n => n.id === noteId)
  if (!note) return null
  
  const comment: NoteComment = {
    id: db.nextNoteCommentId++,
    noteId,
    nickname: data.nickname,
    content: data.content,
    createdAt: new Date().toISOString(),
  }
  
  db.noteComments.push(comment)
  note.commentCount++
  
  persistDB()
  console.log(`[NoteComment] 新评论: 笔记ID ${noteId} (评论者: ${data.nickname})`)
  return { comment, note }
}

export function updateNote(id: number, data: Partial<Pick<Note, 'title' | 'content' | 'images' | 'visibility'>>): Note | null {
  const note = db.notes.find(n => n.id === id)
  if (!note) return null
  
  if (data.title !== undefined) note.title = data.title
  if (data.content !== undefined) note.content = data.content
  if (data.images !== undefined) note.images = data.images
  if (data.visibility !== undefined) note.visibility = data.visibility
  note.updatedAt = new Date().toISOString()
  
  persistDB()
  return note
}

export function deleteNote(id: number): boolean {
  const index = db.notes.findIndex(n => n.id === id)
  if (index === -1) return false
  
  db.notes.splice(index, 1)
  db.noteComments = db.noteComments.filter(c => c.noteId !== id)
  db.noteLikes = db.noteLikes.filter(l => l.noteId !== id)
  
  persistDB()
  console.log(`[Note] 删除笔记: ID ${id}`)
  return true
}

export function createExchangeListing(data: CreateExchangeListingRequest): ExchangeListing {
  const now = new Date().toISOString()
  const listing: ExchangeListing = {
    id: db.nextExchangeListingId++,
    bookId: data.bookId || 0,
    owner: data.owner,
    ownerContact: data.ownerContact,
    bookTitle: data.bookTitle,
    bookAuthor: data.bookAuthor,
    bookCover: data.bookCover,
    category: data.category,
    condition: data.condition,
    wantCategories: data.wantCategories,
    wantBookNames: data.wantBookNames,
    description: data.description,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }
  db.exchangeListings.push(listing)
  persistDB()
  console.log(`[Exchange] 新交换挂单: 《${listing.bookTitle}》 by ${listing.owner}`)
  return listing
}

export function getExchangeListings(filters?: { category?: string; condition?: string; status?: ExchangeListingStatus; search?: string }): ExchangeListing[] {
  let listings = [...db.exchangeListings]
  if (filters) {
    if (filters.status) listings = listings.filter(l => l.status === filters.status)
    if (filters.category) listings = listings.filter(l => l.category === filters.category)
    if (filters.condition) listings = listings.filter(l => l.condition === filters.condition)
    if (filters.search) {
      const keyword = filters.search.toLowerCase()
      listings = listings.filter(l =>
        l.bookTitle.toLowerCase().includes(keyword) ||
        l.bookAuthor.toLowerCase().includes(keyword) ||
        l.owner.toLowerCase().includes(keyword) ||
        l.wantBookNames.some(n => n.toLowerCase().includes(keyword)) ||
        l.wantCategories.some(c => c.toLowerCase().includes(keyword))
      )
    }
  }
  return listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getExchangeListingById(id: number): ExchangeListing | null {
  return db.exchangeListings.find(l => l.id === id) || null
}

export function cancelExchangeListing(id: number): ExchangeListing | null {
  const listing = db.exchangeListings.find(l => l.id === id)
  if (!listing || listing.status !== 'active') return null
  listing.status = 'cancelled'
  listing.updatedAt = new Date().toISOString()
  db.exchangeRequests
    .filter(r => r.listingId === id && r.status === 'pending')
    .forEach(r => {
      r.status = 'rejected'
      r.updatedAt = new Date().toISOString()
    })
  persistDB()
  console.log(`[Exchange] 取消挂单: 《${listing.bookTitle}》`)
  return listing
}

export function createExchangeRequest(listingId: number, data: CreateExchangeRequestRequest): ExchangeRequest | { error: string } {
  const listing = db.exchangeListings.find(l => l.id === listingId)
  if (!listing || listing.status !== 'active') return { error: '交换挂单不存在或已下架' }
  if (listing.owner === data.requester) return { error: '不能向自己发起交换请求' }
  const existing = db.exchangeRequests.find(r => r.listingId === listingId && r.requester === data.requester && r.status === 'pending')
  if (existing) return { error: '您已发起过交换请求，请等待回复' }
  const now = new Date().toISOString()
  const request: ExchangeRequest = {
    id: db.nextExchangeRequestId++,
    listingId,
    requester: data.requester,
    requesterContact: data.requesterContact,
    offeredBookTitle: data.offeredBookTitle,
    offeredBookAuthor: data.offeredBookAuthor,
    offeredBookCategory: data.offeredBookCategory,
    offeredBookCondition: data.offeredBookCondition,
    offeredBookCover: data.offeredBookCover,
    message: data.message,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  db.exchangeRequests.push(request)
  persistDB()
  console.log(`[Exchange] 新交换请求: ${data.requester} 想用《${data.offeredBookTitle}》换《${listing.bookTitle}》`)
  return request
}

export function getExchangeRequestsByListing(listingId: number): ExchangeRequest[] {
  return db.exchangeRequests
    .filter(r => r.listingId === listingId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getExchangeRequestsByRequester(requester: string): ExchangeRequest[] {
  return db.exchangeRequests
    .filter(r => r.requester === requester)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getExchangeRequestById(id: number): ExchangeRequest | null {
  return db.exchangeRequests.find(r => r.id === id) || null
}

export function acceptExchangeRequest(requestId: number): ExchangeRequest | { error: string } {
  const request = db.exchangeRequests.find(r => r.id === requestId)
  if (!request || request.status !== 'pending') return { error: '请求不存在或已处理' }
  const listing = db.exchangeListings.find(l => l.id === request.listingId)
  if (!listing || listing.status !== 'active') return { error: '挂单不存在或已下架' }
  request.status = 'accepted'
  request.updatedAt = new Date().toISOString()
  db.exchangeRequests
    .filter(r => r.listingId === request.listingId && r.id !== requestId && r.status === 'pending')
    .forEach(r => {
      r.status = 'rejected'
      r.updatedAt = new Date().toISOString()
    })
  persistDB()
  console.log(`[Exchange] 接受交换请求: ${request.requester} <-> ${listing.owner}`)
  return request
}

export function rejectExchangeRequest(requestId: number): ExchangeRequest | { error: string } {
  const request = db.exchangeRequests.find(r => r.id === requestId)
  if (!request || request.status !== 'pending') return { error: '请求不存在或已处理' }
  request.status = 'rejected'
  request.updatedAt = new Date().toISOString()
  persistDB()
  console.log(`[Exchange] 拒绝交换请求: ID ${requestId}`)
  return request
}

export function completeExchange(requestId: number, operator?: string): { request: ExchangeRequest; listing: ExchangeListing; ownerPointsResult: ReturnType<typeof addPoints>; requesterPointsResult: ReturnType<typeof addPoints>; newBook: Book } | { error: string } {
  const request = db.exchangeRequests.find(r => r.id === requestId)
  if (!request || request.status !== 'accepted') return { error: '请求不存在或未被接受' }
  const listing = db.exchangeListings.find(l => l.id === request.listingId)
  if (!listing) return { error: '挂单不存在' }

  const now = new Date().toISOString()

  if (listing.bookId > 0) {
    addTraceLog(listing.bookId, '转让', `《${listing.bookTitle}》由${listing.owner}转让给${request.requester}，管理员${operator || '管理员'}确认`, operator || '管理员')
  }

  const newBook: Book = {
    id: db.nextBookId++,
    traceId: randomTraceId(),
    title: request.offeredBookTitle,
    author: request.offeredBookAuthor,
    category: request.offeredBookCategory,
    sourceType: 'secondhand',
    sourceInfo: `图书交换：${request.requester}以《${request.offeredBookTitle}》交换${listing.owner}的《${listing.bookTitle}》`,
    coverImage: request.offeredBookCover,
    createdAt: now,
    borrowCount: 0,
    discussCount: 0,
  }
  db.books.push(newBook)
  addTraceLog(newBook.id, '入库', `通过图书交换入库，源自${request.requester}的《${request.offeredBookTitle}》`, operator || '管理员')

  request.status = 'completed'
  request.updatedAt = now
  listing.status = 'exchanged'
  listing.updatedAt = now

  const ownerPointsResult = addPoints(listing.owner, 'exchange', `图书交换：出让《${listing.bookTitle}》`, listing.id)
  const requesterPointsResult = addPoints(request.requester, 'exchange', `图书交换：获得《${listing.bookTitle}》`, listing.id)

  persistDB()
  console.log(`[Exchange] 交换完成: ${listing.owner}《${listing.bookTitle}》 <-> ${request.requester}《${request.offeredBookTitle}》`)
  return { request, listing, ownerPointsResult, requesterPointsResult, newBook }
}

export function getExchangeListingsByOwner(owner: string): ExchangeListing[] {
  return db.exchangeListings
    .filter(l => l.owner === owner)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
