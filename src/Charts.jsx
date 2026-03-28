import { useMemo } from 'react'
import {
  LineChart, Line, ScatterChart, Scatter, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { fmtNum } from './api.js'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function mono(size = 10) {
  return { fontFamily: 'var(--font-mono)', fontSize: size, fill: 'var(--text3)' }
}

// Custom dot for timeline — clickable
function ClickableDot({ cx, cy, payload, onVideoClick, highlightId }) {
  if (!payload) return null
  const isHighlighted = payload.id === highlightId
  return (
    <circle
      cx={cx} cy={cy}
      r={isHighlighted ? 7 : 4}
      fill={payload.trend === 'hot' ? 'var(--hot)' : payload.trend === 'rising' ? 'var(--rising)' : 'var(--accent)'}
      stroke={isHighlighted ? 'var(--text)' : 'var(--bg2)'}
      strokeWidth={isHighlighted ? 2 : 1}
      style={{ cursor: 'pointer', transition: 'r 0.15s' }}
      onClick={() => onVideoClick(payload)}
    />
  )
}

// Custom tooltip
function ChartTooltip({ active, payload, label, field, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border2)',
      borderRadius: 8, padding: '10px 14px',
      fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)',
      boxShadow: 'var(--shadow-sm)', maxWidth: 240, pointerEvents: 'none',
    }}>
      {d?.title && (
        <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4, lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
          {d.title}
        </p>
      )}
      <p style={{ color: 'var(--accent)', fontWeight: 500 }}>
        {prefix}{typeof d?.[field] === 'number' ? fmtNum(d[field]) : (payload[0]?.value != null ? fmtNum(payload[0].value) : label)}{suffix}
      </p>
      {d?.trend && d.trend !== 'normal' && (
        <p style={{ color: d.trend === 'hot' ? 'var(--hot)' : 'var(--rising)', fontSize: 10, marginTop: 3 }}>
          {d.trend === 'hot' ? '🔥 Hot' : '↑ Rising'}
        </p>
      )}
      <p style={{ color: 'var(--text3)', fontSize: 9, marginTop: 4 }}>Click to view video</p>
    </div>
  )
}

export default function Charts({ videos, onVideoClick, highlightId, theme }) {
  const sorted = useMemo(
    () => [...videos].sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)),
    [videos]
  )

  // Day-of-week aggregation
  const dayData = useMemo(() => {
    const counts = new Array(7).fill(0)
    const totalViews = new Array(7).fill(0)
    const byDay = Array.from({ length: 7 }, () => [])
    videos.forEach(v => {
      const d = new Date(v.publishedAt).getDay()
      counts[d]++
      totalViews[d] += v.views
      byDay[d].push(v)
    })
    return DAYS.map((day, i) => ({
      day,
      count: counts[i],
      avgViews: counts[i] > 0 ? Math.round(totalViews[i] / counts[i]) : 0,
      videos: byDay[i],
    }))
  }, [videos])

  const maxDayViews = Math.max(...dayData.map(d => d.avgViews), 1)

  // Timeline data
  const timelineData = sorted.map(v => ({
    ...v,
    label: `${MONTHS_SHORT[new Date(v.publishedAt).getMonth()]} ${new Date(v.publishedAt).getDate()}`,
  }))

  // Scatter data
  const scatterData = videos.map(v => ({
    ...v,
    x: v.views,
    y: parseFloat(v.engagement.toFixed(2)),
  }))

  const cardStyle = {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '20px',
  }

  const titleStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10, letterSpacing: '0.18em',
    color: 'var(--text3)', textTransform: 'uppercase',
    marginBottom: 16,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 28 }}>

      {/* ── Timeline ── */}
      <div style={cardStyle} title="View count trend over time. Click any point to view that video.">
        <p style={titleStyle}>// Views over time</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={timelineData} onClick={(state) => {
            if (state?.activePayload?.[0]?.payload) onVideoClick(state.activePayload[0].payload)
          }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={mono(9)} tickLine={false} axisLine={false} interval="preserveStartEnd" label={{ value: 'Date', position: 'insideBottomRight', offset: -5, style: { ...mono(9) } }} />
            <YAxis tick={mono(9)} tickLine={false} axisLine={false} tickFormatter={fmtNum} width={48} label={{ value: 'Views', angle: -90, position: 'insideLeft', style: { ...mono(9) } }} />
            <Tooltip content={<ChartTooltip field="views" />} />
            <Line
              type="monotone" dataKey="views"
              stroke="var(--accent)" strokeWidth={2}
              dot={<ClickableDot onVideoClick={onVideoClick} highlightId={highlightId} />}
              activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--bg2)', strokeWidth: 2, cursor: 'pointer' }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textAlign: 'center', marginTop: 6 }}>
          Click any dot to open video details
        </p>
      </div>

      {/* ── Scatter: views vs engagement ── */}
      <div style={cardStyle} title="Compares view count (X-axis) vs engagement rate (Y-axis). Click any dot to view that video.">
        <p style={titleStyle}>// Views vs engagement rate</p>
        <ResponsiveContainer width="100%" height={180}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="x" name="Views" tick={mono(9)} tickLine={false} axisLine={false} tickFormatter={fmtNum} label={{ value: 'Views', position: 'insideBottomRight', offset: -5, style: { ...mono(9) } }} />
            <YAxis dataKey="y" name="Engagement" tick={mono(9)} tickLine={false} axisLine={false}
              tickFormatter={v => v.toFixed(1) + '%'} width={44} label={{ value: 'Engagement %', angle: -90, position: 'insideLeft', style: { ...mono(9) } }} />
            <Tooltip content={<ChartTooltip field="engagement" suffix="%" />} />
            <Scatter
              data={scatterData}
              onClick={(payload) => { if (payload) onVideoClick(payload) }}
              style={{ cursor: 'pointer' }}
            >
              {scatterData.map((v, i) => (
                <Cell
                  key={v.id}
                  fill={
                    v.id === highlightId ? 'var(--warn)' :
                    v.trend === 'hot' ? 'var(--hot)' :
                    v.trend === 'rising' ? 'var(--rising)' :
                    'var(--accent)'
                  }
                  fillOpacity={v.id === highlightId ? 1 : 0.65}
                  r={v.id === highlightId ? 8 : 5}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textAlign: 'center', marginTop: 6 }}>
          <span style={{ color: 'var(--hot)' }}>● Hot</span>
          {'  '}
          <span style={{ color: 'var(--rising)' }}>● Rising</span>
          {'  '}
          <span style={{ color: 'var(--accent)' }}>● Normal</span>
          {'  '}
          <span style={{ color: 'var(--warn)' }}>● Selected</span>
        </p>
      </div>

      {/* ── Upload cadence ── */}
      <div style={cardStyle} title="Shows how many videos uploaded per day of week. Click a bar to view that day's top video.">
        <p style={titleStyle}>// Upload cadence (videos per day)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dayData} onClick={(state) => {
            if (state?.activePayload?.[0]?.payload?.videos?.length) {
              // Open top video for that day
              const dayVids = state.activePayload[0].payload.videos
              const top = dayVids.reduce((a, b) => b.views > a.views ? b : a, dayVids[0])
              onVideoClick(top)
            }
          }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={mono(9)} tickLine={false} axisLine={false} label={{ value: 'Day of Week', position: 'insideBottomRight', offset: -5, style: { ...mono(9) } }} />
            <YAxis tick={mono(9)} tickLine={false} axisLine={false} allowDecimals={false} width={28} label={{ value: 'Videos', angle: -90, position: 'insideLeft', style: { ...mono(9) } }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div style={{
                    background: 'var(--bg2)', border: '1px solid var(--border2)',
                    borderRadius: 8, padding: '10px 14px',
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                  }}>
                    <p style={{ color: 'var(--text)', marginBottom: 2 }}>{d.day}: {d.count} video{d.count !== 1 ? 's' : ''}</p>
                    <p style={{ color: 'var(--accent)' }}>avg {fmtNum(d.avgViews)} views</p>
                    {d.count > 0 && <p style={{ color: 'var(--text3)', fontSize: 9, marginTop: 4 }}>Click → opens top video</p>}
                  </div>
                )
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {dayData.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.count === 0 ? 'var(--bg4)' : 'var(--accent)'}
                  fillOpacity={d.count === 0 ? 1 : 0.3 + (d.count / Math.max(...dayData.map(x => x.count), 1)) * 0.7}
                  style={{ cursor: d.count > 0 ? 'pointer' : 'default' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textAlign: 'center', marginTop: 6 }}>
          Click a bar to open top video for that day
        </p>
      </div>

      {/* ── Heatmap ── */}
      <div style={cardStyle}>
        <p style={titleStyle}>// Avg views by publish day</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 8 }}>
          {dayData.map((d) => {
            const intensity = d.avgViews / maxDayViews
            const alpha = 0.1 + intensity * 0.85
            const isActive = d.videos.some(v => v.id === highlightId)
            return (
              <div
                key={d.day}
                onClick={() => {
                  if (d.videos.length) {
                    const top = d.videos.reduce((a, b) => b.views > a.views ? b : a, d.videos[0])
                    onVideoClick(top)
                  }
                }}
                title={`${d.day}: avg ${fmtNum(d.avgViews)} views (${d.count} uploads)`}
                style={{
                  flex: 1, minWidth: 64, height: 72,
                  background: d.count === 0
                    ? 'var(--bg4)'
                    : `rgba(108,99,255,${alpha})`,
                  border: isActive ? '2px solid var(--warn)' : '1px solid var(--border)',
                  borderRadius: 8,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: d.count > 0 ? 'pointer' : 'default',
                  transition: 'transform 0.15s, border-color 0.15s',
                }}
                onMouseOver={e => { if (d.count > 0) e.currentTarget.style.transform = 'scale(1.05)' }}
                onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
                  color: intensity > 0.55 ? '#fff' : 'var(--text2)',
                }}>
                  {d.day}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: intensity > 0.55 ? 'rgba(255,255,255,0.7)' : 'var(--text3)',
                  marginTop: 3,
                }}>
                  {d.count > 0 ? fmtNum(d.avgViews) : '—'}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 8,
                  color: intensity > 0.55 ? 'rgba(255,255,255,0.5)' : 'var(--text3)',
                }}>
                  {d.count} video{d.count !== 1 ? 's' : ''}
                </span>
              </div>
            )
          })}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textAlign: 'center', marginTop: 12 }}>
          Click a cell to open top video for that day
        </p>
      </div>

    </div>
  )
}
