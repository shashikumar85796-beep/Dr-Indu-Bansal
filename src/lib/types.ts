export interface Base {
  id: string;
  published: boolean;
}

export interface Story extends Base {
  slug: string;
  category: string;
  title: string;
  date: string;
  readTime: string;
  image: string;
  body: string;
  sourceUrl: string;
}

export interface Video extends Base {
  title: string;
  platform: string;
  url: string;
  image: string;
  featured: boolean;
}

export interface GalleryItem extends Base {
  image: string;
  caption: string;
  category: string;
}

export interface Award extends Base {
  kind: 'Honour' | 'Role';
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface Milestone extends Base {
  year: string;
  title: string;
  text: string;
}

export interface Feature extends Base {
  icon: string;
  title: string;
  text: string;
}

export interface Stat extends Base {
  value: string;
  suffix: string;
  label: string;
}

export interface TextItem extends Base {
  text: string;
}

export interface Settings {
  logoFirst: string;
  logoAccent: string;
  tagline: string;
  personName: string;
  seoTitle: string;
  seoSuffix: string;
  seoDescription: string;
  ogDescription: string;
  accentColor: string;
  defaultFont: string;
  showPreloader: boolean;
  showFontSwitcher: boolean;
  showWhatsApp: boolean;
  storeSubmissions: boolean;

  heroEyebrow: string;
  heroTitle: string;
  heroRedFrom: number;
  heroText: string;
  heroImage: string;
  heroCta1Label: string;
  heroCta1Link: string;
  heroCta2Label: string;
  heroCta2Link: string;

  aboutShort: string;
  aboutBio: string;
  aboutIntro: string;
  aboutImage: string;

  servicesEyebrow: string;
  servicesTitle: string;
  initiativesEyebrow: string;
  initiativesTitle: string;
  updatesEyebrow: string;
  updatesTitle: string;
  updatesIntro: string;
  honoursEyebrow: string;
  honoursTitle: string;
  awardsIntro: string;
  videoEyebrow: string;
  videoTitle: string;
  videoText: string;
  mediaIntro: string;
  galleryEyebrow: string;
  galleryTitle: string;
  galleryIntro: string;
  galleryCategories: string;
  milestonesEyebrow: string;
  milestonesTitle: string;
  pressEyebrow: string;

  bandTitle: string;
  bandText: string;
  joinCta: string;
  connectTitle: string;
  connectText: string;

  location: string;
  phone: string;
  whatsapp: string;
  waGreeting: string;
  email: string;
  instagram: string;
  instagramHandle: string;
  facebook: string;
  x: string;
  youtube: string;

  contactIntro: string;
  contactTopics: string;
  contactNote: string;

  joinIntro: string;
  joinNote: string;
  benefitsNote: string;
  districts: string;
  joinRoles: string;

  footerText: string;
  footerScript: string;
}

export interface Content {
  settings: Settings;
  stories: Story[];
  videos: Video[];
  gallery: GalleryItem[];
  awards: Award[];
  milestones: Milestone[];
  services: Feature[];
  initiatives: Feature[];
  highlights: Feature[];
  homeStats: Stat[];
  aboutStats: Stat[];
  benefits: TextItem[];
  pressLogos: TextItem[];
}

export type CollectionKey = Exclude<keyof Content, 'settings'>;
export type AnyItem = Base & Record<string, unknown>;

export interface Submission {
  id: string;
  kind: 'contact' | 'join';
  createdAt: string;
  read: boolean;
  fields: Record<string, string>;
}
