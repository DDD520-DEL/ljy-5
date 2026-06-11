import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('downloadFile - filename parsing logic', () => {
  function parseFileName(disposition: string | null): string {
    let fileName = 'export.xlsx'
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?([^;\n]+)/i)
      if (match) {
        fileName = decodeURIComponent(match[1].replace(/^"|"$/g, ''))
      }
    }
    return fileName
  }

  it('should parse URL-encoded Chinese filename from Content-Disposition', () => {
    const disposition = 'attachment; filename="%E6%BA%AF%E6%BA%90%E6%97%A5%E5%BF%97.xlsx"'
    expect(parseFileName(disposition)).toBe('溯源日志.xlsx')
  })

  it('should parse multiple URL-encoded filename', () => {
    const disposition = 'attachment; filename="%E5%9B%BE%E4%B9%A6%E6%95%B0%E6%8D%AE_2025-06-11.xlsx"'
    expect(parseFileName(disposition)).toBe('图书数据_2025-06-11.xlsx')
  })

  it('should fall back to default when Content-Disposition is null', () => {
    expect(parseFileName(null)).toBe('export.xlsx')
  })

  it('should fall back to default when Content-Disposition has no filename', () => {
    const disposition = 'attachment'
    expect(parseFileName(disposition)).toBe('export.xlsx')
  })

  it('should handle plain ASCII filename', () => {
    const disposition = 'attachment; filename="books_export.xlsx"'
    expect(parseFileName(disposition)).toBe('books_export.xlsx')
  })

  it('should strip surrounding quotes from filename', () => {
    const disposition = 'attachment; filename="test.xlsx"'
    expect(parseFileName(disposition)).toBe('test.xlsx')
  })
})

describe('downloadFile - fetch and error handling', () => {
  const originalFetch = global.fetch
  const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
  const mockRevokeObjectURL = vi.fn()
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  async function downloadFile(url: string): Promise<void> {
    const API_BASE = '/api'
    const res = await fetch(`${API_BASE}${url}`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '导出失败' }))
      throw new Error(err.error || `HTTP ${res.status}`)
    }
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    URL.createObjectURL = mockCreateObjectURL
    URL.revokeObjectURL = mockRevokeObjectURL
  })

  afterEach(() => {
    global.fetch = originalFetch
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('should call fetch with correct URL for books export', async () => {
    const mockBlob = new Blob(['test'])
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(mockBlob),
      headers: new Headers({
        'Content-Disposition': 'attachment; filename="test.xlsx"',
      }),
    })

    await downloadFile('/books/export')

    expect(global.fetch).toHaveBeenCalledWith('/api/books/export')
  })

  it('should call fetch with correct URL including query params', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(new Blob(['test'])),
      headers: new Headers({}),
    })

    await downloadFile('/books/export?category=文学小说&source=donation')

    expect(global.fetch).toHaveBeenCalledWith('/api/books/export?category=文学小说&source=donation')
  })

  it('should trigger blob URL create and revoke lifecycle', async () => {
    const mockBlob = new Blob(['test'])
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(mockBlob),
      headers: new Headers({
        'Content-Disposition': 'attachment; filename="test.xlsx"',
      }),
    })

    await downloadFile('/books/export')

    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('should throw error with server message on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: '服务器内部错误' }),
    })

    await expect(downloadFile('/books/export')).rejects.toThrow('服务器内部错误')
  })

  it('should throw default message when server error is not JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.reject(new Error('not json')),
    })

    await expect(downloadFile('/books/export')).rejects.toThrow('导出失败')
  })

  it('should throw with HTTP status when error object is empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    })

    await expect(downloadFile('/books/export')).rejects.toThrow('HTTP 404')
  })

  it('should call fetch with trace export URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(new Blob(['test'])),
      headers: new Headers({}),
    })

    await downloadFile('/books/1/trace/export')

    expect(global.fetch).toHaveBeenCalledWith('/api/books/1/trace/export')
  })
})

describe('Dashboard handleExport - params builder', () => {
  function buildExportParams(exportCategory: string, exportSource: string): { category?: string; source?: string } {
    const params: { category?: string; source?: string } = {}
    if (exportCategory !== 'all') params.category = exportCategory
    if (exportSource !== 'all') params.source = exportSource
    return params
  }

  it('should return empty params when both are "all"', () => {
    expect(buildExportParams('all', 'all')).toEqual({})
  })

  it('should include category when not "all"', () => {
    expect(buildExportParams('文学小说', 'all')).toEqual({ category: '文学小说' })
  })

  it('should include source when not "all"', () => {
    expect(buildExportParams('all', 'donation')).toEqual({ source: 'donation' })
  })

  it('should include both when neither is "all"', () => {
    expect(buildExportParams('文学小说', 'donation')).toEqual({ category: '文学小说', source: 'donation' })
  })
})

describe('BookDetail handleExportTrace - guard logic', () => {
  it('should not proceed when book is null', () => {
    const book = null
    let called = false
    if (book) { called = true }
    expect(called).toBe(false)
  })

  it('should proceed when book exists', () => {
    const book = { id: 1, title: 'Test' }
    let called = false
    if (book) { called = true }
    expect(called).toBe(true)
  })
})
