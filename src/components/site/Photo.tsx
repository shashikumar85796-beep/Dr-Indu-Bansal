import Image from 'next/image';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

// Gradient pairs used when no photo has been uploaded yet.
const TONES = [
  ['#c8323a', '#5e0b10'],
  ['#2d3142', '#151821'],
  ['#b07a54', '#4a2c1a'],
  ['#3f5f73', '#1b2a35'],
  ['#8a1c3c', '#3a0a19'],
];

export const tone = (i: number) => {
  const t = TONES[((i % 5) + 5) % 5];
  return { '--a': t[0], '--b': t[1] } as CSSProperties;
};

const OPTIMIZABLE = /^https:\/\/([a-z0-9-]+\.public\.blob\.vercel-storage\.com|i\.ytimg\.com\/vi)\//i;

/** Local, Vercel Blob and YouTube images go through next/image; pasted external URLs fall back to a lazy <img>. */
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
  if (src.startsWith('/') || OPTIMIZABLE.test(src))
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
