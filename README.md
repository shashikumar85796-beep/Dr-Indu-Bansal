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

- **Owner** (`SUPERADMIN_USERNAME`, default `owner`, and `SUPERADMIN_PASSWORD`): the site maintainer. Full control, plus setting the admin's login.
- **Admin** (`ADMIN_USERNAME`, default `admin`, and `ADMIN_PASSWORD`): the client. Full control of the website, including settings, team and backups.
- **Team members**: created by the owner or admin under **Team & access**, each with only the sections ticked for them (news, photos & videos, achievements, partner logos, Sangh pages, page sections, enquiries, analytics, settings). Changing or removing a member signs them out at once.
- Each user changes their own login under **My account**. Saved logins replace the environment variables. In development you can also create the first owner login on `/admin/login`.
- Never put real login details in the code: this repository is public.

## What the dashboard manages

| Area | What it controls |
| --- | --- |
| Site settings | Logo, tagline, accent colour, typography, hero text and portrait, biography, all section headings, contact details, social links, form options, footer, SEO |
| Updates & news | Stories with cover photo, category, date, body and source link. Each gets its own page at `/updates/<address>` |
| Videos, Photo gallery, Awards & roles, Milestones | Full lists with photos/icons |
| Page sections | What I do, initiatives, About highlights, stats strips, membership benefits, “In the news” names |
| Enquiries | Every Contact and Join form message, with tabs, read/unread, search, reply links and CSV export |
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

## SEO

- Every update has its own SEO panel: web address, meta title, meta description, keywords and share image, with a live Google preview and checks.
- Site-wide: canonical URLs, Open Graph and Twitter cards, a generated share image at `/og`, `NewsArticle` and `Person` structured data, `/sitemap.xml` (refreshed hourly) and `/robots.txt` (admin excluded).
- Owner settings → Search & sharing: website address, site keywords and the Google Search Console verification code.

## Analytics dashboard

**Admin → Analytics** shows visitors (Google Analytics 4) and Google searches (Search Console) for 7, 28 or 90 days. To connect:

1. Create a GA4 property; paste its measurement ID (`G-…`) and numeric property ID in Settings → Google Analytics & Search Console.
2. Add the site to Search Console (HTML tag method); paste the verification code and the property name in Settings.
3. In Google Cloud, create a service account, enable the Google Analytics Data API and the Search Console API, and create a JSON key. Set `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` in Vercel.
4. Add the service account email as a Viewer on the GA4 property and as a user on the Search Console property.
