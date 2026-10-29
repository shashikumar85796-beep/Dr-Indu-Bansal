import type { Award, Coverage, Demand, TextItem, Unit, Video } from './types';

/*
 * Facts gathered from public sources (news reports, the Sangh's YouTube channel and Instagram bio,
 * and Dr. Bansal's LinkedIn profile). Every link here was checked to open when this was written.
 * Used for new sites and to add these items once to existing content (see migrate in store.ts).
 */

export const YOUTUBE_CHANNEL = 'https://www.youtube.com/@SPSHARYANA';
export const LINKEDIN = 'https://www.linkedin.com/in/dr-indu-bansal-jain-862b7a2b2/';

const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const RM_PALWAL =
  'https://rajneetimanch.in/2026/10/plvl-jile-ke-ptrkaron-ko-vitrit-huee-5-lakh-kee-nihshulk-beema-p-lisee-v-pres-phchan-ptr-evan-vahn-pas/';
const RM_GOHANA =
  'https://rajneetimanch.in/2026/09/gohana-ke-ptrkaron-ko-milee-5-lakh-kee-beema-p-lisee-pres-phchan-ptr-aur-vahn-pas-kee-saugat/';
const BNT_FOUNDATION = 'https://bntlive.com/1726';
const ATAL_PATAUDI = 'https://www.atalhind.com/pataudi-journalists-5-lakh-insurance-naresh-sharma/';
const SK_FATEHABAD =
  'https://www.sachkahoon.com/with-the-formation-of-fatehabad-district-unit-shramik-journalist-association-haryana-got-strengthened-dr-indu-bansal/';

export const KHABAR_PALIKA_ROLE: Award = {
  id: 'a-khabar-palika',
  published: true,
  kind: 'Role',
  icon: 'doc',
  title: 'Founder & Editor-in-Chief',
  subtitle: 'Khabar Palika, Sonipat NCR',
  description: 'Founder and editor-in-chief of Khabar Palika, based in Sonipat NCR.',
};

export const CHANNEL_VIDEOS: Video[] = (
  [
    ['Fa8LWYGRV5s', 'पलवल · श्रमजीवी पत्रकार संघ हरियाणा', 'News'],
    ['nVjne54ht5U', 'झज्जर · श्रमजीवी पत्रकार संघ हरियाणा', 'News'],
    ['tNkraqzh9JE', 'गोहाना, सोनीपत · श्रमजीवी पत्रकार संघ हरियाणा', 'News'],
    ['II9BJlE8Kqc', 'सोहना, गुरुग्राम · श्रमजीवी पत्रकार संघ हरियाणा', 'News'],
    ['zs_YHpL_x4U', 'हिसार · श्रमजीवी पत्रकार संघ हरियाणा', 'News'],
    ['P6c6KGqrQWc', 'हांसी · श्रमजीवी पत्रकार संघ हरियाणा', 'News'],
    ['YUbcAsSrQ78', 'हरिद्वार · श्रमजीवी पत्रकार संघ हरियाणा', 'News'],
    ['RrKRsO2_h54', 'फ़तेहाबाद · श्रमजीवी पत्रकार संघ हरियाणा', 'News'],
    ['jVlLd_nRwwA', 'गोहाना · श्रमजीवी पत्रकार संघ हरियाणा', 'News'],
    ['Vd6riz-acXk', 'झज्जर · श्रमजीवी पत्रकार संघ हरियाणा', 'News'],
    ['bbAoWvcxGCE', 'संघर्ष गीत (पुरुष स्वर) · हिंदी · 13', 'Songs'],
    ['2sVVOVY7xf0', 'संघर्ष गीत (पुरुष स्वर) · हिंदी · 12', 'Songs'],
    ['NYV4nHuMVRA', 'संघर्ष गीत (महिला स्वर) · हिंदी · 14', 'Songs'],
    ['LbmmAHcLtPY', 'तिरंगा यात्रा गीत · हिंदी · 11', 'Songs'],
    ['i2sK4CZRrSI', 'तिरंगा यात्रा गीत · हिंदी · 10', 'Songs'],
    ['PSGPYlKz1gY', 'तिरंगा यात्रा गीत · हिंदी · 9', 'Songs'],
    ['xI5k4WHH0d0', 'हिंदी गीत · 3', 'Songs'],
    ['52_NHRPjDcY', 'हिंदी गीत · 6', 'Songs'],
    ['32vEs1GgpRQ', 'हरियाणवी गीत · 7', 'Songs'],
    ['q-efBypbq0c', 'राजस्थानी गीत · 8', 'Songs'],
    ['7jKPhRsFod4', 'पंजाबी गीत · 1', 'Songs'],
    ['tNIAQSUMfGE', 'पंजाबी गीत · 2', 'Songs'],
    ['Tqzj3rDHNco', 'ब्रज गीत · 4', 'Songs'],
    ['iS8_pAI1WSo', 'ब्रज गीत · 5', 'Songs'],
  ] as const
).map(([id, title, section]) => ({
  id: `yt-${id}`,
  published: true,
  title,
  section,
  platform: 'YouTube',
  url: yt(id),
  image: '',
  featured: false,
}));

export const UNITS: Unit[] = [
  {
    name: 'Palwal',
    president: 'Bhushan Ohlian',
    text: 'Free ₹5 lakh insurance policies, press ID cards and vehicle passes were handed to the district’s journalists on 26 October 2026. A seminar was held here on Foundation Day 2025.',
    videoUrl: yt('Fa8LWYGRV5s'),
    sourceUrl: RM_PALWAL,
  },
  {
    name: 'Pataudi',
    president: 'Naresh Sharma',
    text: 'Naresh Sharma was named district president again at an event where a free ₹5 lakh insurance policy for journalists was announced. Senior citizens were honoured here on Foundation Day 2025.',
    videoUrl: '',
    sourceUrl: ATAL_PATAUDI,
  },
  {
    name: 'Gohana (Sonipat)',
    president: '',
    text: 'Journalists received ₹5 lakh insurance policies, press ID cards and vehicle passes in September 2026. A seminar was held here on Foundation Day 2025.',
    videoUrl: yt('tNkraqzh9JE'),
    sourceUrl: RM_GOHANA,
  },
  {
    name: 'Jhajjar',
    president: '',
    text: 'District unit formed at a meeting of local journalists at the PWD rest house, where Sangh press ID cards and vehicle passes were distributed.',
    videoUrl: yt('nVjne54ht5U'),
    sourceUrl: '',
  },
  {
    name: 'Fatehabad',
    president: '',
    text: 'District unit formed, strengthening the Sangh ahead of the Jantar Mantar mahadharna (reported March 2026).',
    videoUrl: yt('RrKRsO2_h54'),
    sourceUrl: SK_FATEHABAD,
  },
  {
    name: 'Gurugram (incl. Sohna)',
    president: '',
    text: 'Journalists were felicitated here on Foundation Day 2025.',
    videoUrl: yt('II9BJlE8Kqc'),
    sourceUrl: BNT_FOUNDATION,
  },
  {
    name: 'Rewari',
    president: '',
    text: 'Among the first districts to submit the Sangh’s demand letter. A tree-planting drive was held here on Foundation Day 2025.',
    videoUrl: '',
    sourceUrl: BNT_FOUNDATION,
  },
  {
    name: 'Nuh',
    president: '',
    text: 'A memorial meeting for a late journalist was held here on Foundation Day 2025.',
    videoUrl: '',
    sourceUrl: BNT_FOUNDATION,
  },
  {
    name: 'Hisar',
    president: '',
    text: 'Video from Hisar on the Sangh’s YouTube channel.',
    videoUrl: yt('zs_YHpL_x4U'),
    sourceUrl: '',
  },
  {
    name: 'Hansi',
    president: '',
    text: 'Named as one of the next district headquarters for the Sangh’s demand-letter campaign.',
    videoUrl: yt('P6c6KGqrQWc'),
    sourceUrl: '',
  },
].map((u, i) => ({ id: `u${i + 1}`, published: true, ...u }));

export const DEMANDS: Demand[] = [
  [
    'Journalist Protection Act',
    'The main demand of the Jantar Mantar mahadharna in March 2026, where a memorandum addressed to the Prime Minister and the Haryana Chief Minister was submitted.',
    'Memorandum submitted',
  ],
  ['Free toll tax for journalists', 'Raised at the state executive meeting in Sonipat, February 2025.', 'Raised with government'],
  ['Cashless insurance scheme', 'Raised at the state executive meeting in Sonipat, February 2025.', 'Raised with government'],
  ['Journalist security scheme', 'Raised at the state executive meeting in Sonipat, February 2025.', 'Raised with government'],
  ['Simpler pension rules for journalists', 'Raised at the state executive meeting in Sonipat, February 2025.', 'Raised with government'],
  ['Affordable group housing for journalists', 'Raised at the state executive meeting in Sonipat, February 2025.', 'Raised with government'],
].map(([title, text, status], i) => ({ id: `d${i + 1}`, published: true, title, text, status }));

export const COVERAGE: Coverage[] = [
  ['Rajneeti Manch', 'पलवल जिले के पत्रकारों को वितरित हुई 5 लाख की निःशुल्क बीमा पॉलिसी व प्रेस पहचान पत्र एवं वाहन पास', '26 Oct 2026', RM_PALWAL],
  ['Atal Hind', 'पटौदी: पत्रकारों को 5 लाख का बीमा, नरेश शर्मा फिर अध्यक्ष', '11 Oct 2026', ATAL_PATAUDI],
  ['Rajneeti Manch', 'गोहाना के पत्रकारों को मिली 5 लाख की बीमा पॉलिसी, प्रेस पहचान पत्र और वाहन पास की सौगात', '29 Sep 2026', RM_GOHANA],
  [
    'Sach Kahoon',
    'ऐतिहासक रहा हरियाणा के श्रमजीवी पत्रकारों का पहला व विशाल महाधरना: डॉ इंदु बंसल',
    '23 Mar 2026',
    'https://www.sachkahoon.com/hundreds-of-working-journalists-from-haryana-protest-at-delhis-jantar-mantar/',
  ],
  [
    'Swadesh News',
    'Haryana Journalists Protest: ऐतिहासक रहा हरियाणा के श्रमजीवी पत्रकारों का पहला व विशाल महाधरना: डॉ इंदु बंसल',
    '23 Mar 2026',
    'https://swadeshlive.com/haryana-journalists-protest/',
  ],
  ['Sach Kahoon', 'दिल्ली जंतर-मंतर पर गरजेंगे हरियाणा के श्रमजीवी पत्रकार: डॉ. इंदु बंसल', '3 Mar 2026', SK_FATEHABAD],
  [
    'G Express News',
    'लंबित मांगों के लिए होगा इतिहास का पहला विशाल महाधरना; दिल्ली जंतर-मंतर पर गरजेंगे हरियाणा के श्रमजीवी पत्रकार: डॉ. इंदु बंसल',
    '3 Mar 2026',
    'https://gexpressnews.com/58906',
  ],
  [
    'Haryana News Update',
    'रेवाड़ी दैनिक भास्कर के श्रमजीवी पत्रकार को धमकियाँ देने वाले आरोपियों की जल्द हो गिरफ़्तारी: डॉ इन्दु बंसल',
    '24 Jan 2026',
    'https://www.haryananewsupdate.in/2026/01/blog-post.html',
  ],
  ['G Express News', 'हरियाणा के श्रमजीवी पत्रकारों की ट्रेड यूनियन का तेजी बढ़ रहा कारवां: डॉ इन्दु बंसल', '13 Jan 2026', 'https://gexpressnews.com/57397'],
  ['Dainik Darpan', 'दिल्ली जंतर-मंतर पर होगा श्रमजीवी पत्रकारों का महाधरना: डॉ. इन्दु बंसल', '7 Jan 2026', 'https://www.dainikdarpancg.com/2026/01/blog-post_86.html'],
  ['G Express News', 'पत्रकार सम्मान समारोह में शामिल होंगी राजनीतिक हस्तियां: डॉ इन्दु बंसल', '2 Dec 2025', 'https://gexpressnews.com/56001'],
  ['BNT Live', 'एकता की मिसाल बना श्रमजीवी पत्रकार संघ हरियाणा का प्रथम स्थापना दिवस: डॉ इन्दु बंसल', '17 Nov 2025', BNT_FOUNDATION],
  [
    'Morning Kashmir',
    'Ashok Pandey to Lead BSPS Again, Dr. Naveen Anand Joshi Appointed General Secretary',
    '2 May 2025',
    'https://www.morningkashmir.com/ashok-pandey-to-lead-bsps-again-dr-naveen-anand-joshi-appointed-general-secretary/',
  ],
  [
    'Muslim Mirror',
    'Journalists demand implementation of Protection Law, hold massive protest at Jantar Mantar',
    '27 Mar 2025',
    'https://muslimmirror.com/journalists-demand-implementation-of-protection-law-hold-massive-protest-at-jantar-mantar/',
  ],
  [
    'Discovery Times',
    'Shramjeevi Journalists Association will soon form District Executive with an insurance policy of Rs 5 lakh across Haryana: Dr. Indu Bansal',
    'Feb 2025',
    'https://www.discoverytimes.in/2025/02/shramjeevi-journalists-association-will.html',
  ],
].map(([outlet, title, date, url], i) => ({ id: `c${i + 1}`, published: true, outlet, title, date, url }));

export const EXTRA_PRESS: string[] = [
  'Sach Kahoon',
  'Swadesh News',
  'G Express News',
  'Rajneeti Manch',
  'Atal Hind',
  'Haryana News Update',
  'Dainik Darpan',
];

export const pressItems = (names: string[]): TextItem[] => names.map((text, i) => ({ id: `p-${i}-${text.toLowerCase().replace(/\W+/g, '-')}`, published: true, text }));
