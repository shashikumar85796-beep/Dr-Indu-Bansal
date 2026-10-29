import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="w" style={{ padding: '120px 24px', textAlign: 'center' }}>
      <span className="ey" style={{ display: 'inline-block' }}>
        404
      </span>
      <h1 style={{ fontSize: 'clamp(34px,5vw,56px)' }}>Page not found</h1>
      <p style={{ color: 'var(--mute)', margin: '14px 0 26px' }}>The page you were looking for has moved or no longer exists.</p>
      <Link className="btn" href="/">
        Back to home →
      </Link>
    </div>
  );
}
