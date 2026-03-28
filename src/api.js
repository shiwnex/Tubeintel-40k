const BASE = 'https://www.googleapis.com/youtube/v3/'

let _quotaUsed = 0
let _onQuotaChange = null

export function onQuotaChange(fn) { _onQuotaChange = fn }

function useQuota(n) {
  _quotaUsed += n
  _onQuotaChange?.(_quotaUsed)
}

async function apiFetch(endpoint, params, apiKey) {
  const p = { ...params, key: apiKey }
  const qs = new URLSearchParams(p).toString()
  const res = await fetch(BASE + endpoint + '?' + qs)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }
  return res.json()
}

// ─── Cache layer ──────────────────────────────────────────────
const CACHE_VERSION = 'v2'
const CHANNEL_TTL   = 60 * 60 * 1000       // 1 hour
const VIDEOS_TTL    = 30 * 60 * 1000       // 30 minutes

function cacheKey(type, id) {
  return `tubeintel:${CACHE_VERSION}:${type}:${id}`
}

function cacheWrite(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch (e) {
    console.warn('Cache write failed:', e)
  }
}

function cacheRead(key, ttl) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > ttl) return null
    return { data, cachedAt: ts }
  } catch {
    return null
  }
}

function readRaw(key) {
  try {
    const r = localStorage.getItem(key)
    return r ? JSON.parse(r) : null
  } catch { return null }
}

/** All tubeintel cache keys */
export function listCacheKeys() {
  const keys = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('tubeintel:')) keys.push(k)
    }
  } catch {}
  return keys
}

/** Wipe every tubeintel cache entry */
export function clearAllCache() {
  listCacheKeys().forEach(k => { try { localStorage.removeItem(k) } catch {} })
}

/**
 * Returns cache metadata for a given channel/playlist pair.
 * channelId  — the channel's UC… id
 * playlistId — the uploads playlist id (UU…)
 */
export function getCacheMeta(channelId, playlistId) {
  if (!channelId) return null
  const chRaw  = readRaw(cacheKey('channel', channelId))
  const vidRaw = playlistId ? readRaw(cacheKey('videos', playlistId)) : null

  if (!chRaw && !vidRaw) return null

  const chValid  = chRaw  ? (Date.now() - chRaw.ts)  < CHANNEL_TTL : false
  const vidValid = vidRaw ? (Date.now() - vidRaw.ts) < VIDEOS_TTL  : false

  return {
    channelCachedAt : chRaw?.ts  ?? null,
    videosCachedAt  : vidRaw?.ts ?? null,
    channelFresh    : chValid,
    videosFresh     : vidValid,
    channelTTL      : CHANNEL_TTL,
    videosTTL       : VIDEOS_TTL,
  }
}

// ─── URL parsing ───────────────────────────────────────────────
export function parseYouTubeURL(raw) {
  const url = raw.trim().replace(/\/$/, '')
  const full = url.startsWith('http') ? url : 'https://' + url
  try {
    const u = new URL(full)
    const path = u.pathname
    const channelMatch = path.match(/\/channel\/(UC[\w-]{22})/)
    if (channelMatch) return { type: 'id', value: channelMatch[1] }
    const handleMatch = path.match(/\/@([\w.-]+)/)
    if (handleMatch) return { type: 'handle', value: handleMatch[1] }
    const customMatch = path.match(/\/(?:c|user)\/([\w.-]+)/)
    if (customMatch) return { type: 'search', value: customMatch[1] }
    if (url.startsWith('@')) return { type: 'handle', value: url.slice(1) }
    return null
  } catch {
    if (raw.trim().startsWith('@')) return { type: 'handle', value: raw.trim().slice(1) }
    return null
  }
}

// ─── Channel resolution ────────────────────────────────────────
export async function resolveChannel(parsed, apiKey, onStatus, forceRefresh = false) {
  // If we have a direct ID, try cache first
  if (parsed.type === 'id' && !forceRefresh) {
    const hit = cacheRead(cacheKey('channel', parsed.value), CHANNEL_TTL)
    if (hit) {
      onStatus?.('Channel loaded from cache ✓')
      return hit.data
    }
  }

  const channel = await _fetchChannel(parsed, apiKey, onStatus)
  cacheWrite(cacheKey('channel', channel.id), channel)
  return channel
}

async function _fetchChannel(parsed, apiKey, onStatus) {
  if (parsed.type === 'id') {
    onStatus?.('Resolving channel by ID…')
    useQuota(1)
    const data = await apiFetch('channels', {
      part: 'snippet,contentDetails,statistics',
      id: parsed.value,
    }, apiKey)
    if (!data.items?.length) throw new Error('Channel not found')
    return data.items[0]
  }
  if (parsed.type === 'handle') {
    onStatus?.(`Resolving @${parsed.value}…`)
    useQuota(1)
    // Check cache by handle key too (stored after first resolution)
    if (true) { /* always fetch fresh handle→id mapping */ }
    const data = await apiFetch('channels', {
      part: 'snippet,contentDetails,statistics',
      forHandle: parsed.value,
    }, apiKey)
    if (data.items?.length) return data.items[0]
    return _resolveViaSearch(parsed.value, apiKey, onStatus)
  }
  return _resolveViaSearch(parsed.value, apiKey, onStatus)
}

async function _resolveViaSearch(query, apiKey, onStatus) {
  onStatus?.(`Searching for "${query}"…`)
  useQuota(100)
  const search = await apiFetch('search', {
    part: 'snippet', type: 'channel', q: query, maxResults: 1,
  }, apiKey)
  if (!search.items?.length) throw new Error('Channel not found')
  const channelId = search.items[0].snippet.channelId
  useQuota(1)
  const data = await apiFetch('channels', {
    part: 'snippet,contentDetails,statistics',
    id: channelId,
  }, apiKey)
  if (!data.items?.length) throw new Error('Could not load channel details')
  return data.items[0]
}

// ─── Video fetching ────────────────────────────────────────────
export async function fetchVideos(uploadsPlaylistId, apiKey, onStatus, days = 30, forceRefresh = false) {
  const key = cacheKey('videos', uploadsPlaylistId)

  if (!forceRefresh) {
    const hit = cacheRead(key, VIDEOS_TTL)
    if (hit) {
      onStatus?.(`${hit.data.length} videos loaded from cache ✓`)
      return hit.data
    }
  }

  const videos = await _fetchVideosFromAPI(uploadsPlaylistId, apiKey, onStatus, days)
  cacheWrite(key, videos)
  return videos
}

async function _fetchVideosFromAPI(uploadsPlaylistId, apiKey, onStatus, days) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString()

  let allMeta = []
  let pageToken = ''
  for (let i = 0; i < 12; i++) {
    const params = { part: 'contentDetails,snippet', playlistId: uploadsPlaylistId, maxResults: 50 }
    if (pageToken) params.pageToken = pageToken
    onStatus?.(`Fetching playlist page ${i + 1}…`)
    useQuota(1)
    const page = await apiFetch('playlistItems', params, apiKey)
    let done = false
    for (const item of page.items || []) {
      const pub = item.snippet?.publishedAt
      if (pub < sinceISO) { done = true; break }
      allMeta.push({
        id: item.contentDetails.videoId,
        publishedAt: pub,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      })
    }
    if (done || !page.nextPageToken) break
    pageToken = page.nextPageToken
  }

  if (!allMeta.length) return []

  const enriched = []
  for (let i = 0; i < allMeta.length; i += 50) {
    const batch = allMeta.slice(i, i + 50)
    onStatus?.(`Enriching ${i + 1}–${Math.min(i + 50, allMeta.length)} of ${allMeta.length} videos…`)
    useQuota(1)
    const stats = await apiFetch('videos', {
      part: 'statistics,contentDetails',
      id: batch.map(v => v.id).join(','),
    }, apiKey)
    const map = {}
    for (const v of stats.items || []) map[v.id] = v
    for (const v of batch) {
      const s = map[v.id]
      if (!s) continue
      const views    = parseInt(s.statistics.viewCount    || 0)
      const likes    = parseInt(s.statistics.likeCount    || 0)
      const comments = parseInt(s.statistics.commentCount || 0)
      const daysOld  = Math.max(0.5, (Date.now() - new Date(v.publishedAt)) / 86400000)
      enriched.push({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        publishedAt: v.publishedAt,
        views, likes, comments,
        engagement: views > 0 ? (likes + comments) / views * 100 : 0,
        velocity: views / daysOld,
        duration: parseDuration(s.contentDetails?.duration || 'PT0S'),
        daysOld: Math.round(daysOld),
      })
    }
  }

  const avgVelocity = enriched.reduce((a, v) => a + v.velocity, 0) / (enriched.length || 1)
  return enriched.map(v => ({
    ...v,
    trend: v.velocity > avgVelocity * 2.5 ? 'hot'
         : v.velocity > avgVelocity * 1.3 ? 'rising'
         : 'normal',
  }))
}

// ─── Helpers ───────────────────────────────────────────────────
export function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0)
}

export function formatDuration(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${m}:${String(s).padStart(2,'0')}`
}

export function fmtNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return Math.round(n).toLocaleString()
}

/** Human-readable relative time from a timestamp */
export function timeAgo(ts) {
  if (!ts) return ''
  const diff  = Date.now() - ts
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function exportCSV(videos, channelName) {
  const headers = ['Title','Views','Likes','Comments','Engagement%','Velocity/day','Duration(s)','PublishedAt','Trend']
  const rows = videos.map(v => [
    `"${v.title.replace(/"/g,'""')}"`,
    v.views, v.likes, v.comments,
    v.engagement.toFixed(3),
    Math.round(v.velocity),
    v.duration, v.publishedAt, v.trend,
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  downloadBlob('tubeintel_export.csv', csv, 'text/csv')
}

export function exportJSON(videos, channel) {
  const data = { channel: channel?.snippet?.title, exportedAt: new Date().toISOString(), videos }
  downloadBlob('tubeintel_export.json', JSON.stringify(data, null, 2), 'application/json')
}

function downloadBlob(name, content, type) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = name
  a.click()
}