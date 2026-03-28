import { useMemo } from 'react';
import { fmtNum } from './api.js';

export default function CalendarView({ videos, activeDate, onDateClick }) {
  const calendarData = useMemo(() => {
    if (!videos.length) return { days: [], monthName: '' };

    // Get the range based on the most recent video
    const latestDate = new Date(videos[0].publishedAt);
    const year = latestDate.getFullYear();
    const month = latestDate.getMonth();
    const monthName = latestDate.toLocaleString('default', { month: 'long' });

    // Calculate days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    // Map videos to days
    const dayMap = {};
    let maxViews = 0;

    videos.forEach(v => {
      const d = new Date(v.publishedAt);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const dateKey = d.getDate();
        if (!dayMap[dateKey]) dayMap[dateKey] = { count: 0, views: 0, vids: [] };
        dayMap[dateKey].count++;
        dayMap[dateKey].views += v.views;
        dayMap[dateKey].vids.push(v);
        if (dayMap[dateKey].views > maxViews) maxViews = dayMap[dateKey].views;
      }
    });

    return { daysInMonth, firstDayIndex, dayMap, maxViews, monthName, year };
  }, [videos]);

  const { daysInMonth, firstDayIndex, dayMap, maxViews, monthName, year } = calendarData;

  return (
    <div style={{ background: 'var(--bg2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>{monthName} {year} // Content Density</h3>
        <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>CLICK A DAY TO FILTER</span>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {['S','M','T','W','T','F','S'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text3)', paddingBottom: '8px' }}>{d}</div>
        ))}

        {/* Empty cells for start of month */}
        {[...Array(firstDayIndex)].map((_, i) => <div key={`empty-${i}`} />)}

        {/* Actual Days */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const data = dayMap[day];
          const intensity = data ? (data.views / maxViews) : 0;
          const isActive = activeDate === day;

          return (
            <div
              key={day}
              onClick={() => data && onDateClick(day)}
              style={{
                aspectRatio: '1/1',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: data ? 'pointer' : 'default',
                background: data ? `rgba(108,99,255, ${0.1 + intensity * 0.9})` : 'var(--bg3)',
                border: isActive ? '2px solid var(--hot)' : '1px solid transparent',
                transition: 'transform 0.1s'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: intensity > 0.6 ? '#fff' : 'var(--text)' }}>{day}</span>
              {data && (
                <div style={{ 
                  position: 'absolute', top: '2px', right: '4px', 
                  background: 'var(--hot)', width: '12px', height: '12px', 
                  borderRadius: '50%', fontSize: '8px', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', color: '#fff' 
                }}>
                  {data.count}
                </div>
              )}
              {data && (
                <span style={{ fontSize: '8px', opacity: 0.7, color: intensity > 0.6 ? '#fff' : 'var(--text2)' }}>
                  {fmtNum(data.views)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}