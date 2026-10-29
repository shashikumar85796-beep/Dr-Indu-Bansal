/**
 * Owner: the site's maintainer. Admin: the client, with full control of the website.
 * Member: a team login created by the owner or admin, limited to the sections ticked for it.
 */
export type Role = 'owner' | 'admin' | 'member';

export const ROLE_LABEL: Record<Role, string> = { owner: 'Owner', admin: 'Admin', member: 'Team' };

export const PERMS = [
  { id: 'news', label: 'News & press coverage' },
  { id: 'media', label: 'Photos & videos' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'partners', label: 'Partner logos' },
  { id: 'sangh', label: 'Sangh pages' },
  { id: 'sections', label: 'Page sections' },
  { id: 'inbox', label: 'Enquiries' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Site settings' },
] as const;

export type Perm = (typeof PERMS)[number]['id'];
export const PERM_IDS = PERMS.map((p) => p.id) as Perm[];

/** What the dashboard knows about the signed-in user. */
export interface Session {
  id: string;
  role: Role;
  username: string;
  name: string;
  perms: Perm[];
}

export const isManager = (s: Session) => s.role === 'owner' || s.role === 'admin';
export const can = (s: Session, perm: Perm) => isManager(s) || s.perms.includes(perm);

export interface AdminTab {
  label: string;
  href: string;
}

export interface AdminSection {
  id: Perm;
  label: string;
  icon: string;
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
    tabs: [
      { label: 'District units', href: '/admin/c/units' },
      { label: 'Demands', href: '/admin/c/demands' },
    ],
  },
  {
    id: 'sections',
    label: 'Page sections',
    icon: 'layers',
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

export const ENQUIRY_TABS: AdminTab[] = [
  { label: 'All enquiries', href: '/admin/inbox' },
  { label: 'Contact messages', href: '/admin/inbox?type=contact' },
  { label: 'Membership requests', href: '/admin/inbox?type=join' },
];

export const sectionsFor = (s: Session) => ADMIN_SECTIONS.filter((sec) => can(s, sec.id));

const matches = (path: string, href: string) => path === href || path.startsWith(href + '/');
export const sectionOf = (path: string) => ADMIN_SECTIONS.find((s) => s.tabs.some((t) => matches(path, t.href)));
export const isTabActive = matches;

/** The permission that guards a content list, from the section whose tabs include it. */
export const permForCollection = (col: string): Perm | null => sectionOf(`/admin/c/${col}`)?.id ?? null;

export const canEditCollection = (s: Session, col: string) => {
  const perm = permForCollection(col);
  return perm ? can(s, perm) : isManager(s);
};
