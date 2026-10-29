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

Storage is picked automatically:

- **On Vercel:** Upstash Redis holds the content, inbox and login data, and Vercel Blob holds uploaded images.
- **Locally:** everything lives in  (or ): , ,  and . It is git-ignored, so back it up.

The dashboard overview shows which storage is in use.

## Deploying to Vercel

1. Import this repository in Vercel, or run  from this folder.
2. In the Vercel project, open **Storage** and add:
   - **Upstash Redis** (from the Marketplace). This sets  and .
   - **Blob**, created as a **public** store. This sets .
3. In **Settings → Environment Variables**, add  (and optionally ).
4. Redeploy. On the first visit the site fills Redis with the starting content.

Uploads larger than 3.5 MB are shrunk in the browser before upload, because Vercel limits request bodies to 4.5 MB.

## Performance

Public pages are pre-rendered as static HTML and refreshed the moment you save in the dashboard. Fonts are self-hosted through , and images go through  (AVIF/WebP, resized per device).
