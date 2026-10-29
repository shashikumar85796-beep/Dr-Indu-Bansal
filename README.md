# Dr. Indu Bansal: website and admin dashboard

Next.js 16 (App Router, TypeScript). Every text, list, image and option on the public site is editable from `/admin`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, admin at /admin
```

Production:

```bash
npm run build
npm run start
```

## Admin sign-in

- Set `ADMIN_PASSWORD` in `.env.local` (copy `.env.example`). In development you can also create the first password on `/admin/login`.
- Change the password any time under **Admin → Account**. The saved password then replaces `ADMIN_PASSWORD`, and other devices are signed out.

## What the dashboard manages

| Area | What it controls |
| --- | --- |
| Site settings | Logo, tagline, accent colour, typography, hero text and portrait, biography, all section headings, contact details, social links, form options, footer, SEO |
| Updates & news | Stories with cover photo, category, date, body and source link. Each gets its own page at `/updates/<address>` |
| Videos, Photo gallery, Awards & roles, Milestones | Full lists with photos/icons |
| Page sections | What I do, initiatives, About highlights, stats strips, membership benefits, “In the news” names |
| Inbox | Contact and membership form messages, with read/unread, search, reply links and CSV export |
| Media library | Drag-and-drop uploads (JPG, PNG, WebP, GIF, AVIF up to 10 MB), usage check, delete |
| Backup & restore | Download/restore all content as one JSON file |

Every list supports add, edit, duplicate, delete, show/hide, search, and drag-to-reorder.

## How content is stored

Everything lives in `data/` (or `DATA_DIR`):

- `content.json`: all site content (created from `src/lib/seed.ts` on first run)
- `submissions.json`: inbox messages
- `uploads/`: uploaded images, served at `/uploads/<file>`
- `auth.json`: password hash and session secret

Back up the `data/` folder. It is git-ignored.

## Performance

Public pages are pre-rendered as static HTML and refreshed the moment you save in the dashboard. Fonts are self-hosted through `next/font`, and images go through `next/image` (AVIF/WebP, resized per device).

## Hosting

The site writes to `data/`, so it needs a Node.js host with a persistent disk: a VPS, Railway, Render (with a disk), Fly.io (with a volume) or similar. Serverless hosts with a read-only filesystem (such as Vercel) would need the storage in `src/lib/store.ts` moved to a database.
