import Image from 'next/image';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

// Gradient pairs used when no photo has been uploaded yet.
const TONES = [
  ['#8f9a6a', '#33401f'],
  ['#a58b72', '#40332a'],
  ['#b48a7c', '#4a2f2c'],
  ['#8d9aa4', '#2f3b45'],
  ['#a89678', '#3a3022'],
];

export const tone = (i: number) => {
  const t = TONES[((i % 5) + 5) % 5];
  return { '--a': t[0], '--b': t[1] } as CSSProperties;
};

const BLOB_HOST = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;

/** Local and Vercel Blob images go through next/image; pasted external URLs fall back to a lazy <img>. */
export function SmartImg({
  src,
  alt,
  sizes,
  fill,
  width,
  height,
  eager,
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  eager?: boolean;
  className?: string;
}) {
  const load = eager ? { loading: 'eager' as const, fetchPriority: 'high' as const } : { loading: 'lazy' as const };
  if (src.startsWith('/') || BLOB_HOST.test(src))
    return fill ? (
      <Image src={src} alt={alt} fill sizes={sizes} className={className} {...load} />
    ) : (
      <Image src={src} alt={alt} width={width || 800} height={height || 800} sizes={sizes} className={className} {...load} />
    );
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      className={className}
      {...load}
      {...(fill ? { style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } } : { width, height })}
    />
  );
}

type PhotoProps = {
  src?: string;
  i?: number;
  alt?: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export function Photo({ src, i = 0, alt = '', className = '', sizes = '(max-width:560px) 100vw, 33vw', eager, children, style, ...rest }: PhotoProps) {
  return (
    <div className={`ph ${className}${src ? ' im' : ''}`} style={{ ...tone(i), ...style }} {...rest}>
      {src ? <SmartImg src={src} alt={alt} fill sizes={sizes} eager={eager} /> : null}
      {children}
    </div>
  );
}
