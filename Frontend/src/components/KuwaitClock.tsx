import React, { useEffect, useState } from 'react';
import { getKuwaitParts, KUWAIT_LABEL, KUWAIT_TZ } from '../utils/kuwaitTime';
import './KuwaitClock.css';

interface KuwaitClockProps {
  /** Hide the round clock face and show only the digital readout. */
  compact?: boolean;
  /** Custom CSS classes for container positioning. */
  className?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const weekdayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: KUWAIT_TZ });

/**
 * Live clock that always shows KUWAIT time, styled to match the dashboard UI.
 * Drop it anywhere:  <KuwaitClock />
 */
const KuwaitClock: React.FC<KuwaitClockProps> = ({ compact = false, className = '' }) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const p = getKuwaitParts(now);

  const secDeg = p.second * 6;
  const minDeg = p.minute * 6 + p.second * 0.1;
  const hourDeg = (p.hour % 12) * 30 + p.minute * 0.5;

  const h12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
  const ampm = p.hour >= 12 ? 'PM' : 'AM';
  const two = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className={`kc-card ${className}`.trim()}
      role="timer"
      aria-label={`Current time in Kuwait ${h12}:${two(p.minute)} ${ampm}`}
    >
      {!compact && (
        <div className="kc-face-wrapper">
          <svg className="kc-face" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="56" className="kc-ring" />
            {Array.from({ length: 12 }, (_, i) => (
              <line
                key={i}
                x1="60"
                y1="9"
                x2="60"
                y2={i % 3 === 0 ? '19' : '15'}
                className={i % 3 === 0 ? 'kc-tick kc-tick-major' : 'kc-tick'}
                transform={`rotate(${i * 30} 60 60)`}
              />
            ))}
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="33"
              className="kc-hand kc-hour"
              transform={`rotate(${hourDeg} 60 60)`}
            />
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="20"
              className="kc-hand kc-minute"
              transform={`rotate(${minDeg} 60 60)`}
            />
            <line
              x1="60"
              y1="66"
              x2="60"
              y2="16"
              className="kc-hand kc-second"
              transform={`rotate(${secDeg} 60 60)`}
            />
            <circle cx="60" cy="60" r="3.5" className="kc-pin" />
          </svg>
        </div>
      )}

      <div className="kc-digital">
        <div className="kc-header">
          <span className="kc-live-badge">
            <span className="kc-live-dot" /> LIVE
          </span>
          <span className="kc-zone">{KUWAIT_LABEL}</span>
        </div>

        <div className="kc-time">
          <span className="kc-num">{two(h12)}</span>
          <span className="kc-colon">:</span>
          <span className="kc-num">{two(p.minute)}</span>
          <span className="kc-colon">:</span>
          <span className="kc-sec">{two(p.second)}</span>
          <span className="kc-ampm">{ampm}</span>
        </div>

        <div className="kc-date">
          {weekdayFmt.format(now)}, {two(p.day)} {MONTHS[p.month - 1]} {p.year}
        </div>
      </div>
    </div>
  );
};

export default KuwaitClock;