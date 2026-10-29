import type { CollectionKey } from './types';

/**
 * Owner: the site's maintainer, with full control.
 * Editor: the client's day-to-day login, limited to publishing content.
 */
export type Role = 'owner' | 'editor';

export const ROLE_LABEL: Record<Role, string> = { owner: 'Owner', editor: 'Editor' };

export const EDITOR_COLLECTIONS: CollectionKey[] = ['stories', 'coverage', 'gallery', 'videos', 'awards', 'milestones', 'pressLogos'];

export const canEdit = (role: Role, col: string) => role === 'owner' || (EDITOR_COLLECTIONS as string[]).includes(col);

export interface AdminTab {
  label: string;
  href: string;
}

export interface AdminSection {
  id: string;
  label: string;
  icon: string;
  ownerOnly?: boolean;
  tabs: AdminTab[];
}

/** Dashboard navigation: each section opens on its first tab and shows the others as tabs. */
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: 'news',
    label: 'News',
    icon: 'news',
    tabs: [
      { label: 'Updates & blog', href: '/admin/c/stories' },
      { label: 'Press coverage', href: '/admin/c/coverage' },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    icon: 'image',
    tabs: [
      { label: 'Photos', href: '/admin/c/gallery' },
      { label: 'Videos', href: '/admin/c/videos' },
      { label: 'Image library', href: '/admin/media' },
    ],
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: 'cup',
    tabs: [
      { label: 'Awards & roles', href: '/admin/c/awards' },
      { label: 'Milestones', href: '/admin/c/milestones' },
    ],
  },
  { id: 'partners', label: 'Partners & logos', icon: 'handshake', tabs: [{ label: 'Logos', href: '/admin/c/pressLogos' }] },
  {
    id: 'sangh',
    label: 'Sangh',
    icon: 'us',
    ownerOnly: true,
    tabs: [
      { label: 'District units', href: '/admin/c/units' },
      { label: 'Demands', href: '/admin/c/demands' },
    ],
  },
  {
    id: 'sections',
    label: 'Page sections',
    icon: 'layers',
    ownerOnly: true,
    tabs: [
      { label: 'What I do', href: '/admin/c/services' },
      { label: 'Initiatives', href: '/admin/c/initiatives' },
      { label: 'About highlights', href: '/admin/c/highlights' },
      { label: 'Home stats', href: '/admin/c/homeStats' },
      { label: 'About stats', href: '/admin/c/aboutStats' },
      { label: 'Join benefits', href: '/admin/c/benefits' },
    ],
  },
];

export const sectionsFor = (role: Role) => ADMIN_SECTIONS.filter((s) => role === 'owner' || !s.ownerOnly);

const matches = (path: string, href: string) => path === href || path.startsWith(href + '/');
export const sectionOf = (path: string) => ADMIN_SECTIONS.find((s) => s.tabs.some((t) => matches(path, t.href)));
export const isTabActive = matches;
