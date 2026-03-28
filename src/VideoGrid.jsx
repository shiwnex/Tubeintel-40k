import { useState, useMemo } from 'react'
import { fmtNum, formatDuration } from './api.js'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(iso) {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

function TrendBadge({ trend }) {
  if (trend === 'normal') return null
  return (
    <span style={{
      position: 'absolute', top: 8, left: 8,
      background: trend === 'hot' ? 'var(--hot)' : 'var(--rising)',
      color: trend === 'rising' ? '#000' : '#fff',
      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500,
      padding: '3px 8px', borderRadius: 4,
      letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>
      {trend === 'hot' ? '🔥 Hot' : '↑ Rising'}
    </span>
  )
}

function VideoCard({ video, onClick, isHighlighted, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => onClick(video)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg2)',
        border: isHighlighted
          ? '2px solid var(--accent)'
          : hovered ? '1px solid var(--border3)' : '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: isHighlighted ? 'var(--highlight-ring), var(--shadow)'
          : hovered ? 'var(--shadow-sm)' : 'none',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        animation: `fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) ${index * 0.03}s both`,
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--bg4)', overflow: 'hidden' }}>
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.35s ease',
          }}
          onError={e => { e.target.style.display = 'none' }}
        />
        <TrendBadge trend={video.trend} />
        <span style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(0,0,0,0.82)', color: '#fff',
          fontFamily: 'var(--font-mono)', fontSize: 10,
          padding: '2px 7px', borderRadius: 4,
        }}>
          {formatDuration(video.duration)}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: 'clamp(10px, 3vw, 14px)' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 600, lineHeight: 1.4,
          color: 'var(--text)', marginBottom: 10, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {video.title}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 0' }}>
          {[
            { label: 'Views', value: fmtNum(video.views), color: video.trend === 'hot' ? 'var(--hot)' : video.trend === 'rising' ? 'var(--rising)' : 'var(--text)' },
            { label: 'Likes', value: fmtNum(video.likes), color: 'var(--text)' },
            { label: 'Eng %', value: video.engagement.toFixed(1) + '%', color: video.engagement > 5 ? 'var(--accent)' : 'var(--text)' },
            { label: 'Comments', value: fmtNum(video.comments), color: 'var(--text)' },
            { label: 'Velocity', value: fmtNum(Math.round(video.velocity)) + '/d', color: video.trend !== 'normal' ? (video.trend === 'hot' ? 'var(--hot)' : 'var(--rising)') : 'var(--text)' },
            { label: 'Age', value: video.daysOld + 'd', color: 'var(--text2)' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(7px, 1.5vw, 8px)', letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 1, margin: 0 }}>{label}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 500, color, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(8px, 1.5vw, 9px)', color: 'var(--text3)', marginTop: 8, margin: 0 }}>
          {fmtDate(video.publishedAt)}
        </p>
      </div>
    </div>
  )
}

function TableRow({ video, onClick, isHighlighted }) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      onClick={() => onClick(video)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isHighlighted ? 'var(--highlight)' : hovered ? 'var(--bg3)' : 'transparent',
        cursor: 'pointer', transition: 'background 0.15s',
        outline: isHighlighted ? '2px solid var(--accent)' : 'none',
      }}
    >
      <td style={{ padding: '10px 14px', maxWidth: 320 }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500,
          color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden',
          textOverflow: 'ellipsis', maxWidth: 300,
        }}>
          {video.title}
        </p>
      </td>
      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtNum(video.views)}</td>
      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtNum(video.likes)}</td>
      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtNum(video.comments)}</td>
      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: video.engagement > 5 ? 'var(--accent)' : 'var(--text2)', textAlign: 'right', whiteSpace: 'nowrap' }}>{video.engagement.toFixed(2)}%</td>
      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: video.trend === 'hot' ? 'var(--hot)' : video.trend === 'rising' ? 'var(--rising)' : 'var(--text2)', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtNum(Math.round(video.velocity))}/d</td>
      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)', textAlign: 'right', whiteSpace: 'nowrap' }}>{formatDuration(video.duration)}</td>
      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtDate(video.publishedAt)}</td>
      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: video.trend === 'hot' ? 'var(--hot)' : video.trend === 'rising' ? 'var(--rising)' : 'var(--text3)',
        }}>
          {video.trend}
        </span>
      </td>
    </tr>
  )
}

export default function VideoGrid({ videos, onVideoClick, highlightId }) {
  const [sortBy, setSortBy] = useState('views')
  const [filterBy, setFilterBy] = useState('all')
  const [view, setView] = useState('grid')

  const processed = useMemo(() => {
    let list = [...videos]
    if (filterBy === 'hot') list = list.filter(v => v.trend === 'hot')
    else if (filterBy === 'rising') list = list.filter(v => v.trend === 'rising')
    else if (filterBy === 'short') list = list.filter(v => v.duration < 180)
    else if (filterBy === 'long') list = list.filter(v => v.duration > 600)

    list.sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views
      if (sortBy === 'engagement') return b.engagement - a.engagement
      if (sortBy === 'velocity') return b.velocity - a.velocity
      if (sortBy === 'date') return new Date(b.publishedAt) - new Date(a.publishedAt)
      if (sortBy === 'likes') return b.likes - a.likes
      if (sortBy === 'comments') return b.comments - a.comments
      return 0
    })
    return list
  }, [videos, sortBy, filterBy])

  const selectStyle = {
    background: 'var(--bg2)', border: '1px solid var(--border2)',
    borderRadius: 6, padding: 'clamp(6px, 2vw, 8px) clamp(8px, 2vw, 12px)',
    fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2vw, 11px)',
    color: 'var(--text)', outline: 'none', cursor: 'pointer',
  }

  const viewBtnStyle = (active) => ({
    padding: 'clamp(6px, 2vw, 8px) clamp(10px, 2vw, 14px)',
    fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 2vw, 11px)',
    color: active ? 'var(--accent)' : 'var(--text2)',
    background: active ? 'var(--bg4)' : 'transparent',
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
  })

  const thStyle = {
    textAlign: 'right', padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2vw, 14px)',
    fontFamily: 'var(--font-mono)', fontSize: 'clamp(8px, 1.5vw, 9px)',
    letterSpacing: '0.14em', color: 'var(--text3)',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 2vw, 10px)', letterSpacing: '0.18em', color: 'var(--text3)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          // {processed.length} videos
        </span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
          <option value="views">Sort: Views</option>
          <option value="engagement">Sort: Engagement</option>
          <option value="velocity">Sort: Trending velocity</option>
          <option value="date">Sort: Most recent</option>
          <option value="likes">Sort: Likes</option>
          <option value="comments">Sort: Comments</option>
        </select>
        <select value={filterBy} onChange={e => setFilterBy(e.target.value)} style={selectStyle}>
          <option value="all">Filter: All</option>
          <option value="hot">🔥 Hot only</option>
          <option value="rising">↑ Rising</option>
          <option value="short">Shorts (&lt;3 min)</option>
          <option value="long">Long-form (&gt;10 min)</option>
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
          <button onClick={() => setView('grid')} style={viewBtnStyle(view === 'grid')}>Grid</button>
          <button onClick={() => setView('table')} style={viewBtnStyle(view === 'table')}>Table</button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(160px, 100%, 280px), 1fr))',
          gap: 14,
        }}>
          {processed.map((v, i) => (
            <VideoCard
              key={v.id} video={v}
              onClick={onVideoClick}
              isHighlighted={v.id === highlightId}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div style={{ overflowX: 'auto', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr>
                {['Title','Views','Likes','Comments','Eng %','Velocity','Duration','Date','Trend'].map((h, i) => (
                  <th key={h} style={{ ...thStyle, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processed.map(v => (
                <TableRow
                  key={v.id} video={v}
                  onClick={onVideoClick}
                  isHighlighted={v.id === highlightId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {processed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          No videos match this filter.
        </div>
      )}
    </div>
  )
}
