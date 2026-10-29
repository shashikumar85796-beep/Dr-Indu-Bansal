import { Inter, Noto_Sans_Devanagari, Source_Serif_4 } from 'next/font/google';

// One professional pairing, self-hosted at build time: a newspaper serif for headings, Inter for text.
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const deva = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-deva',
  display: 'swap',
  preload: false,
});

export const fontVars = [serif, inter, deva].map((f) => f.variable).join(' ');
