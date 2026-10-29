import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Hd, Sec, StoryCard } from '@/components/site/blocks';
import { Photo } from '@/components/site/Photo';
import { getContent } from '@/lib/store';
import { paragraphs, visible } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return visible((await getContent()).stories).map((s) => ({ slug: s.slug }));
}

async function find(slug: string) {
  const stories = visible((await getContent()).stories);
  const i = stories.findIndex((s) => s.slug === slug);
  return { stories, i, story: stories[i] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { story } = await find((await params).slug);
  if (!story) return {};
  const desc = paragraphs(story.body)[0]?.slice(0, 160);
  return { title: story.title, description: desc, openGraph: { title: story.title, description: desc, type: 'article' } };
}

export default async function StoryPage({ params }: Props) {
  const { stories, i, story } = await find((await params).slug);
  if (!story) notFound();
  const more = stories.map((s, j) => ({ s, j })).filter(({ j }) => j !== i).slice(0, 4);
  return (
    <>
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
