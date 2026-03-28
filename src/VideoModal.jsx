import { useEffect, useState } from 'react'
import { X, ExternalLink, ThumbsUp, MessageSquare, Eye, Zap, Clock, TrendingUp, Play } from 'lucide-react'
import { fmtNum, formatDuration } from './api.js'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(iso) {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export default function VideoModal({ video, onClose, theme }) {
  const [isPlaying, setIsPlaying] = useState(false)

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
    { icon: Eye, label: 'Views', value: fmtNum(video.views), color: 'var(--accent)', tooltip: 'Total video views' },
    { icon: ThumbsUp, label: 'Likes', value: fmtNum(video.likes), color: 'var(--rising)', tooltip: 'Total likes received' },
    { icon: MessageSquare, label: 'Comments', value: fmtNum(video.comments), color: 'var(--warn)', tooltip: 'Total comments count' },
    { icon: TrendingUp, label: 'Engagement', value: video.engagement.toFixed(2) + '%', color: 'var(--accent2)', tooltip: '(Likes + Comments) / Views' },
    { icon: Zap, label: 'Velocity', value: fmtNum(Math.round(video.velocity)) + '/day', color: trendColor, tooltip: 'Views per day since upload' },
    { icon: Clock, label: 'Duration', value: formatDuration(video.duration), color: 'var(--text2)', tooltip: 'Video length' },
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
        overflowX: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        animation: 'fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Thumbnail */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--bg4)', borderRadius: '16px 16px 0 0', overflow: 'hidden', cursor: isPlaying ? 'default' : 'pointer', flexShrink: 0 }}>
          {isPlaying ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${video.id}?autoplay=0`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: 'block' }}
            />
          ) : (
            <>
              <img
                src={video.thumbnail}
                alt={video.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.display = 'none' }}
              />
              {/* Play button overlay */}
              <button
                onClick={() => setIsPlaying(true)}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
              >
                <div style={{
                  background: 'var(--accent)',
                  borderRadius: '50%',
                  padding: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Play size={24} fill="#fff" color="#fff" />
                </div>
              </button>
            </>
          )}
          {/* Trend badge */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: video.trend === 'hot' ? 'var(--hot)' : video.trend === 'rising' ? 'var(--rising)' : 'transparent',
            color: video.trend === 'normal' ? 'transparent' : (video.trend === 'rising' ? '#000' : '#fff'),
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
            padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.08em',
            textTransform: 'uppercase', display: video.trend === 'normal' ? 'none' : 'block',
            zIndex: 10,
          }}>
            {video.trend === 'hot' ? '🔥 Hot' : '↑ Rising'}
          </div>
          {/* Duration */}
          <div style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'rgba(0,0,0,0.8)', color: '#fff',
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            padding: '3px 8px', borderRadius: '4px',
            zIndex: 10,
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
              zIndex: 10,
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
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
            {stats.map(({ icon: Icon, label, value, color, tooltip }) => (
              <div key={label} style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px',
                cursor: 'help',
                position: 'relative',
                group: 'hover',
              }}
              title={tooltip}
              >
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


        </div>
      </div>
    </div>
  )
}
