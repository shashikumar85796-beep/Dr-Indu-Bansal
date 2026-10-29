import {
  Bricolage_Grotesque,
  Caveat,
  Fraunces,
  Inter,
  Noto_Sans_Devanagari,
  Plus_Jakarta_Sans,
  Source_Sans_3,
  Source_Serif_4,
} from 'next/font/google';

// Self-hosted at build time. Only the default pair is preloaded; the rest load when used.
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
const serif4 = Source_Serif_4({ subsets: ['latin'], variable: '--font-ss4', display: 'swap', preload: false });
const sans3 = Source_Sans_3({ subsets: ['latin'], variable: '--font-ssans', display: 'swap', preload: false });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', preload: false });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', preload: false });
const deva = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '600', '700'],
  variable: '--font-deva',
  display: 'swap',
  preload: false,
});
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap', preload: false });

export const fontVars = [bricolage, jakarta, serif4, sans3, fraunces, inter, deva, caveat].map((f) => f.variable).join(' ');
