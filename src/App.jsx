import { useState, useEffect } from 'react'
import VideoGrid from './VideoGrid.jsx'
import VideoModal from './VideoModal.jsx'
import Charts from './Charts.jsx'
import { parseYouTubeURL, resolveChannel, fetchVideos, onQuotaChange } from './api.js'

export default function App() {
  const [theme, setTheme] = useState('dark')
  const [channelUrl, setChannelUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [quotaUsed, setQuotaUsed] = useState(0)

  useEffect(() => {
    onQuotaChange(setQuotaUsed)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleFetch = async () => {
    if (!channelUrl.trim() || !apiKey.trim()) {
      setError('Please enter both channel URL and API key')
      return
    }

    setLoading(true)
    setError('')
    setStatus('Parsing channel URL...')

    try {
      const parsed = parseYouTubeURL(channelUrl)
      if (!parsed) {
        throw new Error('Invalid YouTube URL or handle')
      }

      const ch = await resolveChannel(parsed, apiKey, setStatus)
      setChannel(ch)

      const uploadsPlaylistId = ch.contentDetails.relatedPlaylists.uploads
      const vids = await fetchVideos(uploadsPlaylistId, apiKey, setStatus)
      setVideos(vids)
      setStatus('')
    } catch (err) {
      setError(err.message || 'Failed to fetch channel')
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 700, margin: 0 }}>
              📺 TubeIntel
            </h1>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
              onMouseEnter={e => e.target.style.background = 'var(--bg4)'}
              onMouseLeave={e => e.target.style.background = 'var(--bg3)'}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          {/* Input Form */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'stretch' }}>
            <input
              type="text"
              placeholder="YouTube channel URL or @handle"
              value={channelUrl}
              onChange={e => setChannelUrl(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleFetch()}
              style={{
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
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
            <input
              type="password"
              placeholder="YouTube Data API key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleFetch()}
              style={{
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
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
            <button
              onClick={handleFetch}
              disabled={loading}
              style={{
                padding: '10px 16px',
                background: loading ? 'var(--bg4)' : 'var(--accent)',
                border: 'none',
                borderRadius: 6,
                color: loading ? 'var(--text3)' : '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(11px, 2vw, 12px)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => !loading && (e.target.style.opacity = '0.88')}
              onMouseLeave={e => !loading && (e.target.style.opacity = '1')}
            >
              {loading ? '⏳ Fetching...' : '🔍 Analyze'}
            </button>
          </div>

          {/* Status/Error Messages */}
          {status && (
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', animation: 'pulse 1s infinite' }}>
              {status}
            </div>
          )}
          {error && (
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--hot)' }}>
              ❌ {error}
            </div>
          )}
          {quotaUsed > 0 && (
            <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
              API quota used: {quotaUsed} / 10,000
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(16px, 4vw, 28px)' }}>
          {channel && (
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 'clamp(14px, 4vw, 20px)',
              marginBottom: 'clamp(16px, 4vw, 28px)',
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {channel.snippet.thumbnails?.default?.url && (
                  <img
                    src={channel.snippet.thumbnails.default.url}
                    alt={channel.snippet.title}
                    style={{ width: 60, height: 60, borderRadius: '50%', flexShrink: 0 }}
                  />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 600, marginBottom: 4, wordBreak: 'break-word', margin: 0 }}>
                    {channel.snippet.title}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2vw, 11px)', color: 'var(--text2)', margin: 0 }}>
                  📊 {channel.statistics.viewCount} total views · 🎬 {channel.statistics.videoCount} videos
                </p>
              </div>
            </div>
          </div>
        )}

        {videos.length > 0 ? (
          <>
            <Charts videos={videos} onVideoClick={setSelectedVideo} highlightId={selectedVideo?.id} />
            <VideoGrid videos={videos} onVideoClick={setSelectedVideo} highlightId={selectedVideo?.id} />
          </>
        ) : (
          channel && (
            <div style={{
              textAlign: 'center',
              padding: 'clamp(40px, 10vw, 60px) 20px',
              color: 'var(--text3)',
              fontFamily: 'var(--font-mono)',
            }}>
              <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', marginBottom: 8 }}>No recent videos found</p>
              <p style={{ fontSize: 'clamp(11px, 2vw, 12px)' }}>Check your API key or try another channel</p>
            </div>
          )
        )}

        {!channel && !loading && (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(50px, 12vw, 80px) 20px',
            color: 'var(--text3)',
            fontFamily: 'var(--font-mono)',
          }}>
            <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', marginBottom: 20 }}>Enter a YouTube channel and API key to get started</p>
            <p style={{ fontSize: 'clamp(11px, 2vw, 12px)', lineHeight: 1.6 }}>
              Get a free YouTube Data API key from{' '}
              <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Google Cloud Console
              </a>
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Modal */}
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} theme={theme} />
    </div>
  )
}
