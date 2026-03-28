import { useState, useEffect, useCallback, useRef } from 'react'
import VideoGrid from './VideoGrid.jsx'
import VideoModal from './VideoModal.jsx'
import Charts from './Charts.jsx'
import {
  parseYouTubeURL, resolveChannel, fetchVideos,
  onQuotaChange, getCacheMeta, clearAllCache, timeAgo,
} from './api.js'

// ─── Cache status bar ─────────────────────────────────────────
function CacheBar({ meta, onRefresh, onClearAll, refreshing }) {
  if (!meta) return null

  const { channelCachedAt, videosCachedAt, channelFresh, videosFresh } = meta
  const oldest = Math.min(channelCachedAt ?? Infinity, videosCachedAt ?? Infinity)
  const allFresh = channelFresh && videosFresh
  const anyStale = !channelFresh || !videosFresh

  // Traffic-light colour
  const color = allFresh ? 'var(--rising)' : anyStale ? 'var(--warn)' : 'var(--hot)'
  const dot   = allFresh ? '●' : anyStale  ? '◐'       : '○'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      marginTop: 10,
      padding: '8px 14px',
      background: 'var(--bg3)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
    }}>
      {/* Status dot + label */}
      <span style={{ color, fontSize: 10 }}>{dot}</span>
      <span style={{ color: 'var(--text2)' }}>
        Cache: <span style={{ color }}>
          {allFresh ? 'fresh' : anyStale ? 'partially stale' : 'stale'}
        </span>
      </span>

      {/* Timestamps */}
      <span style={{ color: 'var(--text3)' }}>·</span>
      {channelCachedAt && (
        <span style={{ color: 'var(--text3)' }}>
          channel {channelFresh ? '✓' : '⚑'} {timeAgo(channelCachedAt)}
        </span>
      )}
      {videosCachedAt && (
        <span style={{ color: 'var(--text3)' }}>
          · videos {videosFresh ? '✓' : '⚑'} {timeAgo(videosCachedAt)}
        </span>
      )}

      {/* TTL hint */}
      <span style={{ color: 'var(--text3)', marginLeft: 4 }}>
        (channel: 1 h · videos: 30 min)
      </span>

      {/* Actions */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Fetch fresh data from YouTube API and update cache"
          style={{
            padding: '5px 12px',
            background: refreshing ? 'var(--bg4)' : anyStale ? 'var(--accent)' : 'var(--bg4)',
            border: '1px solid var(--border2)',
            borderRadius: 6,
            color: refreshing ? 'var(--text3)' : anyStale ? '#fff' : 'var(--text2)',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <RefreshIcon spinning={refreshing} />
          {refreshing ? 'Refreshing…' : 'Refresh data'}
        </button>

        <button
          onClick={onClearAll}
          disabled={refreshing}
          title="Clear all cached data from this browser"
          style={{
            padding: '5px 12px',
            background: 'transparent',
            border: '1px solid var(--border2)',
            borderRadius: 6,
            color: 'var(--text3)',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--hot)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          Clear cache
        </button>
      </div>
    </div>
  )
}

function RefreshIcon({ spinning }) {
  return (
    <span style={{
      display: 'inline-block',
      animation: spinning ? 'spin 0.7s linear infinite' : 'none',
      fontSize: 12,
      lineHeight: 1,
    }}>
      ↻
    </span>
  )
}

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState('light')
  const [channelUrl, setChannelUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [quotaUsed, setQuotaUsed] = useState(0)
  const [cacheMeta, setCacheMeta] = useState(null)

  // Keep track of current channel's playlist id to feed getCacheMeta
  const playlistIdRef = useRef(null)

  useEffect(() => { onQuotaChange(setQuotaUsed) }, [])
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])

  // Refresh cache meta every 30 s so the TTL indicators stay current
  useEffect(() => {
    if (!channel) return
    const tick = () => {
      setCacheMeta(getCacheMeta(channel.id, playlistIdRef.current))
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [channel])

  // ── Main fetch (normal + force-refresh) ─────────────────────
  const run = useCallback(async (forceRefresh = false) => {
    if (!channelUrl.trim() || !apiKey.trim()) {
      setError('Please enter both channel URL and API key')
      return
    }

    const parsed = parseYouTubeURL(channelUrl)
    if (!parsed) {
      setError('Invalid YouTube URL or handle')
      return
    }

    forceRefresh ? setRefreshing(true) : setLoading(true)
    setError('')
    setStatus(forceRefresh ? 'Refreshing from YouTube API…' : 'Parsing channel URL…')

    try {
      const ch = await resolveChannel(parsed, apiKey, setStatus, forceRefresh)
      setChannel(ch)

      const uploadsPlaylistId = ch.contentDetails.relatedPlaylists.uploads
      playlistIdRef.current = uploadsPlaylistId

      const vids = await fetchVideos(uploadsPlaylistId, apiKey, setStatus, 30, forceRefresh)
      setVideos(vids)
      setStatus('')

      // Update cache meta after fetch
      setCacheMeta(getCacheMeta(ch.id, uploadsPlaylistId))
    } catch (err) {
      setError(err.message || 'Failed to fetch channel')
      setStatus('')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [channelUrl, apiKey])

  const handleFetch   = () => run(false)
  const handleRefresh = () => run(true)

  const handleClearAll = () => {
    clearAllCache()
    setCacheMeta(null)
    setStatus('Cache cleared — next fetch will pull fresh data.')
    setTimeout(() => setStatus(''), 3000)
  }

  // ── Styles ────────────────────────────────────────────────────
  const inputStyle = {
    flex: '1 1 auto',
    minWidth: '160px',
    padding: '10px 14px',
    background: 'var(--bg3)',
    border: '1px solid var(--border2)',
    borderRadius: 6,
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'clamp(11px, 2vw, 12px)',
    outline: 'none',
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 700, margin: 0 }}>
              📺 TubeIntel
            </h1>
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              style={{
                padding: '8px 14px',
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          {/* Input row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'stretch' }}>
            <input
              type="text"
              placeholder="YouTube channel URL or @handle"
              value={channelUrl}
              onChange={e => setChannelUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border2)'}
            />
            <input
              type="password"
              placeholder="YouTube Data API key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border2)'}
            />
            <button
              onClick={handleFetch}
              disabled={loading || refreshing}
              style={{
                padding: '10px 16px',
                background: (loading || refreshing) ? 'var(--bg4)' : 'var(--accent)',
                border: 'none',
                borderRadius: 6,
                color: (loading || refreshing) ? 'var(--text3)' : '#fff',
                cursor: (loading || refreshing) ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(11px, 2vw, 12px)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {loading ? '⏳ Fetching…' : '🔍 Analyze'}
            </button>
          </div>

          {/* Status / Error */}
          {status && (
            <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>
              {status}
            </div>
          )}
          {error && (
            <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--hot)' }}>
              ❌ {error}
            </div>
          )}
          {quotaUsed > 0 && (
            <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
              API quota used: {quotaUsed.toLocaleString()} / 10,000
            </div>
          )}

          {/* ── Cache status bar (only when data is loaded) ── */}
          <CacheBar
            meta={cacheMeta}
            onRefresh={handleRefresh}
            onClearAll={handleClearAll}
            refreshing={refreshing}
          />
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(16px, 4vw, 28px) clamp(16px, 4vw, 28px) 200px' }}>

          {/* Channel hero */}
          {channel && (
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 'clamp(14px, 4vw, 20px)',
              marginBottom: 'clamp(16px, 4vw, 28px)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {channel.snippet.thumbnails?.default?.url && (
                  <img
                    src={channel.snippet.thumbnails.default.url}
                    alt={channel.snippet.title}
                    style={{ width: 60, height: 60, borderRadius: '50%', flexShrink: 0, border: '2px solid var(--border2)' }}
                  />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 700, marginBottom: 4, wordBreak: 'break-word' }}>
                    {channel.snippet.title}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2vw, 11px)', color: 'var(--text2)', margin: 0 }}>
                    📊 {parseInt(channel.statistics.viewCount).toLocaleString()} total views
                    &nbsp;·&nbsp;
                    🎬 {parseInt(channel.statistics.videoCount).toLocaleString()} videos
                    &nbsp;·&nbsp;
                    👥 {parseInt(channel.statistics.subscriberCount || 0).toLocaleString()} subscribers
                  </p>
                </div>

                {/* Inline refresh shortcut inside hero */}
                {cacheMeta && (
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    title="Fetch latest data and update cache"
                    style={{
                      padding: '8px 14px',
                      background: 'var(--bg3)',
                      border: '1px solid var(--border2)',
                      borderRadius: 8,
                      color: refreshing ? 'var(--text3)' : 'var(--text2)',
                      cursor: refreshing ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      display: 'flex', alignItems: 'center', gap: 6,
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)' }}
                  >
                    <RefreshIcon spinning={refreshing} />
                    {refreshing ? 'Refreshing…' : 'Fetch latest'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Charts + grid */}
          {videos.length > 0 ? (
            <>
              <Charts
                videos={videos}
                onVideoClick={setSelectedVideo}
                highlightId={selectedVideo?.id}
              />
              <VideoGrid
                videos={videos}
                onVideoClick={setSelectedVideo}
                highlightId={selectedVideo?.id}
              />
            </>
          ) : (
            channel && !loading && (
              <div style={{ textAlign: 'center', padding: 'clamp(40px,10vw,60px) 20px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                <p style={{ fontSize: 14, marginBottom: 8 }}>No recent videos found</p>
                <p style={{ fontSize: 12 }}>Check your API key or try another channel</p>
              </div>
            )
          )}

          {/* Empty state */}
          {!channel && !loading && (
            <div style={{ textAlign: 'center', padding: 'clamp(50px,12vw,80px) 20px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              <p style={{ fontSize: 'clamp(12px,3vw,14px)', marginBottom: 20 }}>
                Enter a YouTube channel and API key to get started
              </p>
              <p style={{ fontSize: 'clamp(11px,2vw,12px)', lineHeight: 1.6 }}>
                Get a free YouTube Data API key from{' '}
                <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  Google Cloud Console
                </a>
              </p>
              <p style={{ fontSize: 11, marginTop: 16, color: 'var(--text3)', lineHeight: 1.7 }}>
                Results are cached locally in your browser for up to 30 minutes,<br/>
                so repeated lookups won't burn your API quota.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Modal */}
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        theme={theme}
      />
    </div>
  )
}