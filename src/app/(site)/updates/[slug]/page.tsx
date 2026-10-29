import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Hd, Sec, StoryCard } from '@/components/site/blocks';
import { Photo } from '@/components/site/Photo';
import { absolute, isoDate, splitKeywords } from '@/lib/seo';
import { getContent } from '@/lib/store';
import { paragraphs, visible } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return visible((await getContent()).stories).map((s) => ({ slug: s.slug }));
}

async function find(slug: string) {
  const c = await getContent();
  const stories = visible(c.stories);
  const i = stories.findIndex((s) => s.slug === slug);
  return { stories, i, story: stories[i], settings: c.settings };
}

const describe = (body: string, seo?: string) => (seo || paragraphs(body)[0] || '').slice(0, 160);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { story, settings } = await find((await params).slug);
  if (!story) return {};
  const title = story.seoTitle || story.title;
  const description = describe(story.body, story.seoDescription);
  const image = story.ogImage || story.image;
  const published = isoDate(story.date);
  return {
    // A custom meta title is used as written; otherwise the headline gets the site suffix.
    title: story.seoTitle ? { absolute: story.seoTitle } : story.title,
    description,
    keywords: [...splitKeywords(story.keywords), story.category, settings.personName].filter(Boolean),
    alternates: { canonical: `/updates/${story.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/updates/${story.slug}`,
      section: story.category,
      authors: [settings.personName],
      ...(published ? { publishedTime: published } : {}),
      images: [image ? { url: image, alt: story.title } : { url: '/og', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image || '/og'] },
  };
}

export default async function StoryPage({ params }: Props) {
  const { stories, i, story, settings } = await find((await params).slug);
  if (!story) notFound();
  const more = stories.map((s, j) => ({ s, j })).filter(({ j }) => j !== i).slice(0, 4);
  const published = isoDate(story.date);
  const image = story.ogImage || story.image;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: (story.seoTitle || story.title).slice(0, 110),
    description: describe(story.body, story.seoDescription),
    articleSection: story.category,
    inLanguage: 'en-IN',
    mainEntityOfPage: absolute(settings, `/updates/${story.slug}`),
    ...(published ? { datePublished: published } : {}),
    ...(image ? { image: [absolute(settings, image)] } : {}),
    ...(story.keywords ? { keywords: splitKeywords(story.keywords).join(', ') } : {}),
    author: { '@type': 'Person', name: settings.personName, url: absolute(settings, '/about') },
    publisher: { '@type': 'Organization', name: settings.sanghName || settings.personName, url: absolute(settings, '/') },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="w">
        <article className="sd" style={{ padding: '40px 0 20px' }}>
          <div className="bc">
            <Link href="/updates">← All updates</Link>
          </div>
          <span className="ey">{story.category}</span>
          <h1 className="ld">{story.title}</h1>
          <div className="m">{[story.date, story.readTime && `${story.readTime} read`].filter(Boolean).join(' · ')}</div>
          <Photo src={story.image} i={i} alt={story.title} sizes="(max-width:800px) 100vw, 760px" eager />
          {paragraphs(story.body).map((p, k) => (
            <p key={k}>{p}</p>
          ))}
          {story.sourceUrl ? (
            <p style={{ font: 'inherit' }}>
              <a className="btn o" href={story.sourceUrl} target="_blank" rel="noopener">
                Read the original report ↗
              </a>
            </p>
          ) : null}
          <Link className="btn" href="/updates">
            More updates →
          </Link>
        </article>
      </div>
      {more.length ? (
        <Sec>
          <Hd eyebrow="Keep Reading" title="More Updates" />
          <div className="g4">
            {more.map(({ s, j }) => (
              <StoryCard key={s.id} story={s} i={j} />
            ))}
          </div>
        </Sec>
      ) : null}
    </>
  );
}
