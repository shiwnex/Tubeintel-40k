import { useEffect } from 'react'
import { X, ExternalLink, ThumbsUp, MessageSquare, Eye, Zap, Clock, TrendingUp } from 'lucide-react'
import { fmtNum, formatDuration } from './api.js'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(iso) {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export default function VideoModal({ video, onClose, theme }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!video) return null

  const pub = new Date(video.publishedAt)
  const trendColor = video.trend === 'hot' ? 'var(--hot)'
    : video.trend === 'rising' ? 'var(--rising)'
    : 'var(--text3)'

  const stats = [
    { icon: Eye, label: 'Views', value: fmtNum(video.views), color: 'var(--accent)' },
    { icon: ThumbsUp, label: 'Likes', value: fmtNum(video.likes), color: 'var(--rising)' },
    { icon: MessageSquare, label: 'Comments', value: fmtNum(video.comments), color: 'var(--warn)' },
    { icon: TrendingUp, label: 'Engagement', value: video.engagement.toFixed(2) + '%', color: 'var(--accent2)' },
    { icon: Zap, label: 'Velocity', value: fmtNum(Math.round(video.velocity)) + '/day', color: trendColor },
    { icon: Clock, label: 'Duration', value: formatDuration(video.duration), color: 'var(--text2)' },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border2)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '660px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        animation: 'fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Thumbnail */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--bg4)', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
          <img
            src={video.thumbnail}
            alt={video.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          {/* Trend badge */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: video.trend === 'hot' ? 'var(--hot)' : video.trend === 'rising' ? 'var(--rising)' : 'transparent',
            color: video.trend === 'normal' ? 'transparent' : (video.trend === 'rising' ? '#000' : '#fff'),
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
            padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.08em',
            textTransform: 'uppercase', display: video.trend === 'normal' ? 'none' : 'block',
          }}>
            {video.trend === 'hot' ? '🔥 Hot' : '↑ Rising'}
          </div>
          {/* Duration */}
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'rgba(0,0,0,0.8)', color: '#fff',
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            padding: '3px 8px', borderRadius: '4px',
          }}>
            {formatDuration(video.duration)}
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(0,0,0,0.6)', border: 'none',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '17px', fontWeight: 600,
            lineHeight: 1.4, color: 'var(--text)',
            marginBottom: '8px',
          }}>
            {video.title}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text3)' }}>
              {fmtDate(video.publishedAt)} · {DAYS[pub.getDay()]}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text3)' }}>
              {video.daysOld} days ago
            </span>
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20,
          }}>
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Icon size={13} color={color} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase' }}>
                    {label}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 500, color }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Engagement bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Engagement rate
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)' }}>
                {video.engagement.toFixed(2)}%
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(video.engagement * 10, 100)}%`,
                background: `linear-gradient(90deg, var(--accent), var(--accent2))`,
                borderRadius: 3,
                transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
              }} />
            </div>
          </div>

          {/* Action */}
          <a
            href={`https://youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px',
              background: 'var(--accent)', color: '#fff',
              borderRadius: 8, textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              fontWeight: 500, letterSpacing: '0.06em',
              transition: 'opacity 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            <ExternalLink size={14} /> Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  )
}
