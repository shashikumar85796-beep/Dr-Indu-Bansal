'use client';

import { useId, useRef, useState } from 'react';

const fmt = (n: number) => (n >= 10000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : Math.round(n).toLocaleString('en-IN'));
const dayLabel = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** Rounds the axis max up to a readable number. */
function niceMax(v: number) {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

/** Single-series daily line with a crosshair tooltip and a table view. */
export function LineChart({ points, label }: { points: { date: string; value: number }[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const id = useId();
  const W = 640;
  const H = 220;
  const P = { l: 40, r: 12, t: 12, b: 28 };
  if (!points.length) return <p className="muted small">No data for this period yet.</p>;
  const max = niceMax(Math.max(...points.map((p) => p.value)));
  const x = (i: number) => P.l + (points.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (points.length - 1));
  const y = (v: number) => P.t + (H - P.t - P.b) * (1 - v / max);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join('');
  const ticks = [0, max / 2, max];
  const xTicks = [0, Math.floor((points.length - 1) / 2), points.length - 1].filter((v, i, a) => a.indexOf(v) === i);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = svg.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - P.l) / (W - P.l - P.r)) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  };
  const h = hover !== null ? points[hover] : null;

  return (
    <div className="chart">
      <div className="chart-plot">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-t`} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <title id={`${id}-t`}>{`${label} per day`}</title>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="grid" />
              <text x={P.l - 8} y={y(t) + 4} textAnchor="end" className="tick">
                {fmt(t)}
              </text>
            </g>
          ))}
          {xTicks.map((i) => (
            <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} className="tick">
              {dayLabel(points[i].date)}
            </text>
          ))}
          <path d={path} className="line" />
          {h ? (
            <g>
              <line x1={x(hover!)} x2={x(hover!)} y1={P.t} y2={H - P.b} className="cross" />
              <circle cx={x(hover!)} cy={y(h.value)} r={5} className="dot" />
            </g>
          ) : null}
          {/* Wide invisible hit area so the crosshair follows the pointer anywhere in the plot. */}
          <rect x={P.l} y={P.t} width={W - P.l - P.r} height={H - P.t - P.b} fill="transparent" />
        </svg>
        {h ? (
          <div className="tip" style={{ left: `${(x(hover!) / W) * 100}%` }}>
            <b>{fmt(h.value)}</b> {label.toLowerCase()}
            <span>{dayLabel(h.date)}</span>
          </div>
        ) : null}
      </div>
      <details className="tbl">
        <summary>Show as table</summary>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>{label}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.date}>
                <td>{dayLabel(p.date)}</td>
                <td>{p.value.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

/** Ranked horizontal bars; one hue for magnitude, values in text colour. */
export function BarList({ rows, unit, emptyText = 'No data yet.' }: { rows: { label: string; value: number; href?: string }[]; unit: string; emptyText?: string }) {
  if (!rows.length) return <p className="muted small">{emptyText}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="bars">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${r.value.toLocaleString('en-IN')} ${unit}`}>
          <span className="bars-l">{r.href ? <a href={r.href} target="_blank" rel="noopener">{r.label}</a> : r.label}</span>
          <span className="bars-v">{fmt(r.value)}</span>
          <span className="bars-t">
            <span style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Headline number with change versus the previous period, shown as text and an arrow (never colour alone). */
const FORMATS = {
  number: fmt,
  percent: (n: number) => `${(n * 100).toFixed(1)}%`,
  position: (n: number) => (n ? n.toFixed(1) : '–'),
  minutes: (n: number) => `${Math.floor(n / 60)}m ${Math.round(n % 60)}s`,
};

export function Kpi({ label, value, prev, kind = 'number' }: { label: string; value: number; prev?: number; kind?: keyof typeof FORMATS }) {
  const format = FORMATS[kind];
  const change = prev ? ((value - prev) / prev) * 100 : null;
  return (
    <div className="kpi">
      <span>{label}</span>
      <b>{format(value)}</b>
      {change !== null && Number.isFinite(change) ? (
        <small className={change >= 0 ? 'up' : 'down'}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(0)}% vs previous period
        </small>
      ) : (
        <small>&nbsp;</small>
      )}
    </div>
  );
}
