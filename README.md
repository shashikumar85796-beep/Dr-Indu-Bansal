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

- There are two logins:
  - **Owner** (`SUPERADMIN_USERNAME`, default `owner`, and `SUPERADMIN_PASSWORD`): full control, including site settings, the Sangh pages, page sections, backups and the editor's login.
  - **Editor** (`ADMIN_USERNAME`, default `admin`, and `ADMIN_PASSWORD`): daily content only. That covers news and blog, press coverage, photos (including bulk upload), videos, achievements, partner logos and the inbox.
- Set them in `.env.local` locally, or in Vercel's environment variables for the live site. In development you can also create the first owner login on `/admin/login`.
- Each user changes their own login under **Admin → My account**; the owner can also set the editor's login there. Saved logins replace the environment variables.
- Never put real login details in the code: this repository is public.

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

Storage is picked automatically:

- **On Vercel:** one public Vercel Blob store holds the uploaded images and, in a hidden folder derived from the store's secret token, the content, inbox and login files.
- **Locally:** everything lives in `data/` (or `DATA_DIR`): `content.json`, `submissions.json`, `auth.json` and `uploads/`. It is git-ignored, so back it up.

The dashboard overview shows which storage is in use.

## Deploying to Vercel

1. Import this repository in Vercel, or run `npx vercel` from this folder.
2. In the Vercel project, open **Storage** and add a **Blob** store, created as **public**. This sets `BLOB_READ_WRITE_TOKEN`.
3. In **Settings → Environment Variables**, add `ADMIN_PASSWORD` (and optionally `SESSION_SECRET`).
4. Redeploy. On the first visit the site saves the starting content to Blob.

If the Blob store is ever replaced, its token changes and the site starts again from the starting content. Download a backup from the dashboard first.

Uploads larger than 3.5 MB are shrunk in the browser before upload, because Vercel limits request bodies to 4.5 MB.

## Performance

Public pages are pre-rendered as static HTML and refreshed the moment you save in the dashboard. Fonts are self-hosted through `next/font`, and images go through `next/image` (AVIF/WebP, resized per device).
