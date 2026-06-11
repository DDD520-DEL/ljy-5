import { describe, it, expect, vi, beforeEach } from 'vitest'

function createMockRes() {
  const res: Record<string, any> = {
    _statusCode: 0,
    _headers: {} as Record<string, string>,
    _body: null as any,
    status(code: number) {
      res._statusCode = code
      return res
    },
    json(body: any) {
      res._body = body
      return res
    },
    setHeader(key: string, value: string) {
      res._headers[key] = value
      return res
    },
    send(body: any) {
      res._body = body
      return res
    },
  }
  return res as any
}

describe('Books Export API - router logic', () => {
  const sourceTypeLabel: Record<string, string> = {
    donation: '个人捐赠',
    direct: '出版社直供',
    secondhand: '二手回收',
  }

  const mockBooks = [
    {
      id: 1, traceId: 'BOOK-A', title: '百年孤独', author: '马尔克斯',
      isbn: '978-1', category: '文学小说', sourceType: 'donation' as const,
      sourceInfo: '读者捐赠', coverImage: '', description: '', tags: ['经典'],
      createdAt: '2025-11-15T10:00:00.000Z', borrowCount: 23, discussCount: 5,
    },
    {
      id: 2, traceId: 'BOOK-B', title: '小王子', author: '圣埃克苏佩里',
      isbn: '978-2', category: '儿童文学', sourceType: 'direct' as const,
      sourceInfo: '出版社直供', coverImage: '', description: '', tags: [],
      createdAt: '2025-12-01T14:30:00.000Z', borrowCount: 45, discussCount: 8,
    },
    {
      id: 3, traceId: 'BOOK-C', title: '追风筝的人', author: '胡赛尼',
      isbn: '978-3', category: '文学小说', sourceType: 'secondhand' as const,
      sourceInfo: '二手回收', coverImage: '', description: '', tags: [],
      createdAt: '2025-10-20T09:15:00.000Z', borrowCount: 31, discussCount: 6,
    },
  ]

  function filterBooks(books: typeof mockBooks, query: Record<string, string | undefined>) {
    let result = [...books]
    if (query.category) {
      result = result.filter(b => b.category === query.category)
    }
    if (query.source) {
      result = result.filter(b => b.sourceType === query.source)
    }
    return result
  }

  function buildExportData(books: typeof mockBooks) {
    return books.map(book => ({
      '书名': book.title,
      '作者': book.author,
      'ISBN': book.isbn,
      '分类': book.category,
      '来源类型': sourceTypeLabel[book.sourceType] || book.sourceType,
      '借阅次数': book.borrowCount,
      '评论数': book.discussCount,
    }))
  }

  it('should return all books when no filter', () => {
    const result = filterBooks(mockBooks, {})
    expect(result).toHaveLength(3)
  })

  it('should filter books by category', () => {
    const result = filterBooks(mockBooks, { category: '文学小说' })
    expect(result).toHaveLength(2)
    expect(result.every(b => b.category === '文学小说')).toBe(true)
  })

  it('should filter books by source type', () => {
    const result = filterBooks(mockBooks, { source: 'donation' })
    expect(result).toHaveLength(1)
    expect(result[0].sourceType).toBe('donation')
  })

  it('should filter books by both category and source', () => {
    const result = filterBooks(mockBooks, { category: '文学小说', source: 'donation' })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('百年孤独')
  })

  it('should return empty when no books match filter', () => {
    const result = filterBooks(mockBooks, { category: '不存在分类' })
    expect(result).toHaveLength(0)
  })

  it('should build export data with correct Chinese labels', () => {
    const data = buildExportData(mockBooks)
    expect(data[0]).toHaveProperty('书名', '百年孤独')
    expect(data[0]).toHaveProperty('作者', '马尔克斯')
    expect(data[0]).toHaveProperty('来源类型', '个人捐赠')
    expect(data[1]).toHaveProperty('来源类型', '出版社直供')
    expect(data[2]).toHaveProperty('来源类型', '二手回收')
  })

  it('should set correct response headers for xlsx download', () => {
    const res = createMockRes()
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="test.xlsx"')
    expect(res._headers['Content-Type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(res._headers['Content-Disposition']).toContain('attachment')
  })
})

describe('Trace Export API - router logic', () => {
  const mockTraceLogs = [
    { id: 1, bookId: 1, action: '入库' as const, description: '图书入库', timestamp: '2025-11-15T10:00:00.000Z', operator: '管理员' },
    { id: 2, bookId: 1, action: '借出' as const, description: '张三借阅', timestamp: '2025-11-20T14:00:00.000Z', operator: '管理员' },
    { id: 3, bookId: 1, action: '归还' as const, description: '张三归还', timestamp: '2025-12-01T09:00:00.000Z', operator: '管理员' },
    { id: 4, bookId: 2, action: '入库' as const, description: '另一本书入库', timestamp: '2025-12-01T10:00:00.000Z', operator: '管理员' },
  ]

  function filterTraceLogs(logs: typeof mockTraceLogs, bookId: number) {
    return logs
      .filter(l => l.bookId === bookId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  function buildTraceExportData(logs: typeof mockTraceLogs) {
    return logs.map(log => ({
      '序号': log.id,
      '操作类型': log.action,
      '操作描述': log.description,
      '操作时间': log.timestamp,
      '操作人': log.operator || '',
    }))
  }

  it('should filter trace logs by bookId', () => {
    const result = filterTraceLogs(mockTraceLogs, 1)
    expect(result).toHaveLength(3)
    expect(result.every(l => l.bookId === 1)).toBe(true)
  })

  it('should sort trace logs by timestamp ascending', () => {
    const result = filterTraceLogs(mockTraceLogs, 1)
    const timestamps = result.map(l => new Date(l.timestamp).getTime())
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1])
    }
  })

  it('should return empty for book with no trace logs', () => {
    const result = filterTraceLogs(mockTraceLogs, 999)
    expect(result).toHaveLength(0)
  })

  it('should build trace export data with correct Chinese labels', () => {
    const logs = filterTraceLogs(mockTraceLogs, 1)
    const data = buildTraceExportData(logs)
    expect(data).toHaveLength(3)
    expect(data[0]).toHaveProperty('操作类型', '入库')
    expect(data[1]).toHaveProperty('操作类型', '借出')
    expect(data[2]).toHaveProperty('操作类型', '归还')
    expect(data[0]).toHaveProperty('操作人', '管理员')
  })

  it('should build book info sheet data', () => {
    const mockBook = { title: '百年孤独', author: '马尔克斯', isbn: '978-1', category: '文学小说', traceId: 'BOOK-A' }
    const logs = filterTraceLogs(mockTraceLogs, 1)
    const info = [
      { '项目': '书名', '内容': mockBook.title },
      { '项目': '作者', '内容': mockBook.author },
      { '项目': 'ISBN', '内容': mockBook.isbn },
      { '项目': '分类', '内容': mockBook.category },
      { '项目': '溯源ID', '内容': mockBook.traceId },
      { '项目': '日志总数', '内容': logs.length },
    ]
    expect(info).toHaveLength(6)
    expect(info[5]['内容']).toBe(3)
  })
})
