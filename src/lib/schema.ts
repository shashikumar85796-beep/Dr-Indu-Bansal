import type { CollectionKey } from './types';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'paragraphs'
  | 'lines'
  | 'url'
  | 'select'
  | 'icon'
  | 'image'
  | 'bool'
  | 'number'
  | 'color'
  | 'digits';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  /** Options come from a settings list (one per line), e.g. gallery categories. */
  optionsFrom?: 'galleryCategories';
  /** Offer existing values of this field as suggestions. */
  suggest?: boolean;
  help?: string;
  required?: boolean;
  placeholder?: string;
  wide?: boolean;
}

export interface CollectionDef {
  label: string;
  singular: string;
  group: 'Content' | 'Sangh' | 'Page sections';
  description: string;
  titleKey: string;
  subKeys: string[];
  imageKey?: string;
  iconKey?: string;
  fields: Field[];
}

const published: Field = { key: 'published', label: 'Show on website', type: 'bool' };

export const COLLECTIONS: Record<CollectionKey, CollectionDef> = {
  stories: {
    label: 'Updates & blog',
    singular: 'Update',
    group: 'Content',
    description: 'News stories shown on the Updates page and the home page (first four).',
    titleKey: 'title',
    subKeys: ['category', 'date'],
    imageKey: 'image',
    fields: [
      { key: 'title', label: 'Headline', type: 'text', required: true, wide: true },
      { key: 'category', label: 'Category', type: 'text', suggest: true, required: true, help: 'Used for the filter buttons on the Updates page.' },
      { key: 'date', label: 'Date', type: 'text', placeholder: '26 Oct 2026' },
      { key: 'readTime', label: 'Read time', type: 'text', placeholder: '3 min' },
      { key: 'slug', label: 'Web address', type: 'text', help: 'Leave empty to create it from the headline. Shown as /updates/<address>.' },
      { key: 'image', label: 'Cover photo', type: 'image', wide: true },
      { key: 'body', label: 'Story', type: 'paragraphs', required: true, wide: true },
      { key: 'sourceUrl', label: 'Original report link', type: 'url', wide: true, placeholder: 'https://…' },
      published,
    ],
  },
  videos: {
    label: 'Videos',
    singular: 'Video',
    group: 'Content',
    description: 'Video links shown on the Media page. The featured one appears large on the home page.',
    titleKey: 'title',
    subKeys: ['section', 'platform'],
    imageKey: 'image',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, wide: true },
      { key: 'section', label: 'Shown under', type: 'select', options: ['News', 'Songs'], help: 'Media page groups videos into News & programmes and Sangh songs.' },
      { key: 'platform', label: 'Platform', type: 'text', suggest: true, placeholder: 'YouTube' },
      { key: 'url', label: 'Video link', type: 'url', required: true, placeholder: 'https://youtube.com/…' },
      { key: 'image', label: 'Thumbnail', type: 'image', wide: true, help: 'Optional for YouTube links: the video’s own thumbnail is used automatically.' },
      { key: 'featured', label: 'Feature on home page', type: 'bool' },
      published,
    ],
  },
  gallery: {
    label: 'Photo gallery',
    singular: 'Photo',
    group: 'Content',
    description: 'Photos on the Gallery page. The first five also appear on the home page.',
    titleKey: 'caption',
    subKeys: ['category'],
    imageKey: 'image',
    fields: [
      { key: 'image', label: 'Photo', type: 'image', wide: true },
      { key: 'caption', label: 'Caption', type: 'text', wide: true },
      { key: 'category', label: 'Category', type: 'select', optionsFrom: 'galleryCategories', help: 'Edit the category list in Settings → Gallery.' },
      published,
    ],
  },
  awards: {
    label: 'Awards & roles',
    singular: 'Award or role',
    group: 'Content',
    description: 'Honours and leadership roles on the Awards page. The first four honours appear on the home page.',
    titleKey: 'title',
    subKeys: ['kind', 'subtitle'],
    iconKey: 'icon',
    fields: [
      { key: 'kind', label: 'Type', type: 'select', options: ['Honour', 'Role'] },
      { key: 'icon', label: 'Icon', type: 'icon', wide: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Given by / year', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea', wide: true },
      published,
    ],
  },
  milestones: {
    label: 'Milestones',
    singular: 'Milestone',
    group: 'Content',
    description: 'The career timeline on the About page.',
    titleKey: 'title',
    subKeys: ['year'],
    fields: [
      { key: 'year', label: 'Year', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'text', label: 'Description', type: 'textarea', wide: true },
      published,
    ],
  },
  services: {
    label: 'What I do',
    singular: 'Card',
    group: 'Page sections',
    description: 'The four “What I Do” cards on the home page.',
    titleKey: 'title',
    subKeys: ['text'],
    iconKey: 'icon',
    fields: [
      { key: 'icon', label: 'Icon', type: 'icon', wide: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'text', label: 'Text', type: 'textarea', wide: true },
      published,
    ],
  },
  initiatives: {
    label: 'Sangh initiatives',
    singular: 'Initiative',
    group: 'Page sections',
    description: 'The “Leading the Sangh” cards on the home page.',
    titleKey: 'title',
    subKeys: ['text'],
    iconKey: 'icon',
    fields: [
      { key: 'icon', label: 'Icon', type: 'icon', wide: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'text', label: 'Text', type: 'textarea', wide: true },
      published,
    ],
  },
  highlights: {
    label: 'About highlights',
    singular: 'Highlight',
    group: 'Page sections',
    description: 'The icon list beside the portrait in the home page About section.',
    titleKey: 'title',
    subKeys: ['text'],
    iconKey: 'icon',
    fields: [
      { key: 'icon', label: 'Icon', type: 'icon', wide: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'text', label: 'Subtitle', type: 'text' },
      published,
    ],
  },
  homeStats: {
    label: 'Home stats',
    singular: 'Stat',
    group: 'Page sections',
    description: 'The figures strip under the home page hero. Whole numbers count up when they scroll into view.',
    titleKey: 'value',
    subKeys: ['label'],
    fields: [
      { key: 'value', label: 'Value', type: 'text', required: true, help: 'A number (e.g. 23) or short text (e.g. State President).' },
      { key: 'suffix', label: 'Suffix', type: 'text', placeholder: '+' },
      { key: 'label', label: 'Label', type: 'text', wide: true },
      published,
    ],
  },
  aboutStats: {
    label: 'About stats',
    singular: 'Stat',
    group: 'Page sections',
    description: 'The figures strip on the About page.',
    titleKey: 'value',
    subKeys: ['label'],
    fields: [
      { key: 'value', label: 'Value', type: 'text', required: true },
      { key: 'suffix', label: 'Suffix', type: 'text', placeholder: '+' },
      { key: 'label', label: 'Label', type: 'text', wide: true },
      published,
    ],
  },
  benefits: {
    label: 'Membership benefits',
    singular: 'Benefit',
    group: 'Page sections',
    description: 'The ticked list on the Join page.',
    titleKey: 'text',
    subKeys: [],
    fields: [{ key: 'text', label: 'Benefit', type: 'textarea', required: true, wide: true }, published],
  },
  units: {
    label: 'District units',
    singular: 'District unit',
    group: 'Sangh',
    description: 'District units and their activity, shown on the Sangh page and counted on the home page.',
    titleKey: 'name',
    subKeys: ['president'],
    fields: [
      { key: 'name', label: 'District / unit', type: 'text', required: true },
      { key: 'president', label: 'District president', type: 'text', help: 'Leave empty if not confirmed.' },
      { key: 'text', label: 'Activity', type: 'textarea', wide: true },
      { key: 'videoUrl', label: 'Video link', type: 'url', placeholder: 'https://youtube.com/…' },
      { key: 'sourceUrl', label: 'News report link', type: 'url', placeholder: 'https://…' },
      published,
    ],
  },
  demands: {
    label: 'Demands',
    singular: 'Demand',
    group: 'Sangh',
    description: 'The Sangh’s demands to the government, with their current status. The first three appear on the home page.',
    titleKey: 'title',
    subKeys: ['status'],
    fields: [
      { key: 'title', label: 'Demand', type: 'text', required: true, wide: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Raised with government', 'Memorandum submitted', 'In progress', 'Achieved'] },
      { key: 'text', label: 'Details', type: 'textarea', wide: true },
      published,
    ],
  },
  coverage: {
    label: 'Press coverage',
    singular: 'News report',
    group: 'Sangh',
    description: 'Links to news reports, shown on the In the News page. The first three appear on the home page.',
    titleKey: 'title',
    subKeys: ['outlet', 'date'],
    fields: [
      { key: 'title', label: 'Headline', type: 'text', required: true, wide: true },
      { key: 'outlet', label: 'Newspaper / website', type: 'text', suggest: true, required: true },
      { key: 'date', label: 'Date', type: 'text', placeholder: '26 Oct 2026' },
      { key: 'url', label: 'Article link', type: 'url', required: true, wide: true, placeholder: 'https://…' },
      published,
    ],
  },
  pressLogos: {
    label: 'Partners & logos',
    singular: 'Logo',
    group: 'Content',
    description: 'Partners and media outlets shown in the scrolling logo band. Add a logo image, or leave it empty to show the name.',
    titleKey: 'text',
    subKeys: ['url'],
    imageKey: 'image',
    fields: [
      { key: 'text', label: 'Name', type: 'text', required: true, wide: true },
      { key: 'image', label: 'Logo (optional)', type: 'image', wide: true, help: 'A wide logo on a transparent or white background works best.' },
      { key: 'url', label: 'Website link (optional)', type: 'url', wide: true, placeholder: 'https://…' },
      published,
    ],
  },
};

export const COLLECTION_KEYS = Object.keys(COLLECTIONS) as CollectionKey[];
export const isCollection = (k: string): k is CollectionKey => k in COLLECTIONS;

export const SETTINGS_GROUPS: { id: string; title: string; fields: Field[] }[] = [
  {
    id: 'brand',
    title: 'Brand & appearance',
    fields: [
      { key: 'logoFirst', label: 'Logo text', type: 'text' },
      { key: 'logoAccent', label: 'Logo text (red part)', type: 'text' },
      { key: 'tagline', label: 'Tagline under logo', type: 'text', wide: true },
      { key: 'personName', label: 'Full name', type: 'text' },
      { key: 'accentColor', label: 'Accent colour', type: 'color' },
      { key: 'showPreloader', label: 'Show intro animation on first visit', type: 'bool' },
      { key: 'showWhatsApp', label: 'Show floating WhatsApp button', type: 'bool' },
    ],
  },
  {
    id: 'seo',
    title: 'Search & sharing',
    fields: [
      { key: 'seoTitle', label: 'Home page title', type: 'text', wide: true },
      { key: 'seoSuffix', label: 'Title suffix for other pages', type: 'text', help: 'e.g. “About · Journalist, Haryana”.' },
      { key: 'seoDescription', label: 'Search description', type: 'textarea', wide: true },
      { key: 'ogDescription', label: 'Social share description', type: 'text', wide: true },
    ],
  },
  {
    id: 'hero',
    title: 'Home hero',
    fields: [
      { key: 'heroEyebrow', label: 'Small heading (roles)', type: 'text', wide: true },
      { key: 'heroName', label: 'Name (big heading)', type: 'text', help: 'The last word is shown in red.' },
      { key: 'heroNameHindi', label: 'Name in Hindi', type: 'text' },
      { key: 'heroTitle', label: 'Slogan', type: 'lines', wide: true, help: 'Shown under the name. Line breaks become spaces; wrap a word in _underscores_ to underline it.' },
      { key: 'heroRedFrom', label: 'Slogan red from line number', type: 'number' },
      { key: 'heroText', label: 'Intro text', type: 'textarea', wide: true },
      { key: 'heroImage', label: 'Portrait (transparent PNG/WebP works best)', type: 'image', wide: true },
      { key: 'heroCta1Label', label: 'Main button text', type: 'text' },
      { key: 'heroCta1Link', label: 'Main button link', type: 'url' },
      { key: 'heroCta2Label', label: 'Second button text', type: 'text' },
      { key: 'heroCta2Link', label: 'Second button link', type: 'url' },
    ],
  },
  {
    id: 'about',
    title: 'About',
    fields: [
      { key: 'aboutShort', label: 'Short bio (home page)', type: 'textarea', wide: true },
      { key: 'aboutIntro', label: 'About page subtitle', type: 'text', wide: true },
      { key: 'aboutBio', label: 'Full biography', type: 'paragraphs', wide: true },
      { key: 'aboutImage', label: 'About portrait (uses hero portrait if empty)', type: 'image', wide: true },
      { key: 'milestonesEyebrow', label: 'Milestones small heading', type: 'text' },
      { key: 'milestonesTitle', label: 'Milestones heading', type: 'text' },
    ],
  },
  {
    id: 'sections',
    title: 'Section headings',
    fields: [
      { key: 'servicesEyebrow', label: '“What I do” small heading', type: 'text' },
      { key: 'servicesTitle', label: '“What I do” heading', type: 'text' },
      { key: 'initiativesEyebrow', label: 'Initiatives small heading', type: 'text' },
      { key: 'initiativesTitle', label: 'Initiatives heading', type: 'text' },
      { key: 'updatesEyebrow', label: 'Updates small heading', type: 'text' },
      { key: 'updatesTitle', label: 'Updates heading', type: 'text' },
      { key: 'updatesIntro', label: 'Updates page subtitle', type: 'text', wide: true },
      { key: 'honoursEyebrow', label: 'Honours small heading', type: 'text' },
      { key: 'honoursTitle', label: 'Honours heading', type: 'text' },
      { key: 'awardsIntro', label: 'Awards page subtitle', type: 'text', wide: true },
      { key: 'videoEyebrow', label: 'Video small heading', type: 'text' },
      { key: 'videoTitle', label: 'Video heading', type: 'text' },
      { key: 'videoText', label: 'Video section text', type: 'textarea', wide: true },
      { key: 'mediaIntro', label: 'Media page subtitle', type: 'text', wide: true },
      { key: 'pressEyebrow', label: '“In the news” heading', type: 'text' },
      { key: 'bandTitle', label: 'Red band heading', type: 'text', wide: true },
      { key: 'bandText', label: 'Red band text', type: 'textarea', wide: true },
      { key: 'joinCta', label: 'Join button text', type: 'text' },
      { key: 'connectTitle', label: '“Let’s connect” heading', type: 'text' },
      { key: 'connectText', label: '“Let’s connect” text', type: 'text', wide: true },
    ],
  },
  {
    id: 'sangh',
    title: 'Sangh page',
    fields: [
      { key: 'sanghName', label: 'Union name', type: 'text', wide: true },
      { key: 'sanghIntro', label: 'Introduction', type: 'textarea', wide: true },
      { key: 'credentials', label: 'Registrations & certifications', type: 'lines', wide: true, help: 'One per line. Shown as trust badges on the home and Sangh pages.' },
      { key: 'foundationDay', label: 'Foundation Day note', type: 'textarea', wide: true },
      { key: 'demandsIntro', label: 'Demands intro', type: 'text', wide: true },
      { key: 'unitsIntro', label: 'District units intro', type: 'text', wide: true },
      { key: 'pressIntro', label: 'In the News page subtitle', type: 'text', wide: true },
      { key: 'followTitle', label: 'Social section heading', type: 'text' },
      { key: 'followText', label: 'Social section text', type: 'text', wide: true },
    ],
  },
  {
    id: 'gallery',
    title: 'Gallery',
    fields: [
      { key: 'galleryEyebrow', label: 'Small heading', type: 'text' },
      { key: 'galleryTitle', label: 'Heading', type: 'text' },
      { key: 'galleryIntro', label: 'Gallery page subtitle', type: 'text', wide: true },
      { key: 'galleryCategories', label: 'Categories', type: 'lines', help: 'One per line. Used for filters and photo categories.' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact & social',
    fields: [
      { key: 'location', label: 'Based in', type: 'text' },
      { key: 'phone', label: 'Phone (as shown)', type: 'text' },
      { key: 'whatsapp', label: 'WhatsApp number', type: 'digits', help: 'Country code and number, digits only, e.g. 918760308030.' },
      { key: 'waGreeting', label: 'WhatsApp button greeting', type: 'text', wide: true },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'instagram', label: 'Instagram link', type: 'url' },
      { key: 'instagramHandle', label: 'Instagram handle', type: 'text' },
      { key: 'linkedin', label: 'LinkedIn link', type: 'url' },
      { key: 'facebook', label: 'Facebook link', type: 'url' },
      { key: 'x', label: 'X (Twitter) link', type: 'url' },
      { key: 'youtube', label: 'YouTube link', type: 'url' },
      { key: 'contactIntro', label: 'Contact page subtitle', type: 'text', wide: true },
      { key: 'contactTopics', label: 'Message topics', type: 'lines' },
      { key: 'contactNote', label: 'Note under the form', type: 'text', wide: true },
    ],
  },
  {
    id: 'join',
    title: 'Join form & inbox',
    fields: [
      { key: 'joinIntro', label: 'Join page subtitle', type: 'textarea', wide: true },
      { key: 'joinNote', label: 'Note under the form', type: 'text', wide: true },
      { key: 'benefitsNote', label: 'Note under benefits', type: 'text', wide: true },
      { key: 'districts', label: 'Districts', type: 'lines' },
      { key: 'joinRoles', label: 'Roles', type: 'lines' },
      { key: 'storeSubmissions', label: 'Save form messages to the admin inbox', type: 'bool' },
    ],
  },
  {
    id: 'footer',
    title: 'Footer',
    fields: [
      { key: 'footerText', label: 'Footer text', type: 'textarea', wide: true },
      { key: 'footerScript', label: 'Handwritten note', type: 'lines' },
    ],
  },
];

export const SETTINGS_FIELDS = SETTINGS_GROUPS.flatMap((g) => g.fields);

export function blankItem(col: CollectionKey): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const f of COLLECTIONS[col].fields) {
    item[f.key] = f.type === 'bool' ? f.key === 'published' : f.type === 'select' && f.options ? f.options[0] : f.type === 'icon' ? 'star' : '';
  }
  return item;
}
