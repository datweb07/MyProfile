import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {format} from 'date-fns';
import PostContent from '@/components/blog/PostContent';
import {getPublishedPostBySlug} from '@/lib/posts';

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {title: 'Article not found — Dat Truong'};

  return {
    title: `${post.title} — Dat Truong`,
    description: post.description || undefined,
    alternates: {canonical: `/blog/${post.slug}`},
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description || undefined,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      images: post.thumbnail ? [{url: post.thumbnail}] : undefined
    },
    twitter: {card: 'summary_large_image', images: post.thumbnail ? [post.thumbnail] : undefined}
  };
}

export default async function BlogPostPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="blog-site blog-article-site">
      <header className="blog-header">
        <Link className="blog-logo" href="/en/writing">DAT / BLOG</Link>
        <nav><Link href="/en/home">Portfolio</Link></nav>
      </header>
      <article className="blog-article">
        <header className="blog-article-header">
          <Link href="/en/writing">← Back to portfolio</Link>
          <time dateTime={post.published_at}>{format(new Date(post.published_at), 'dd MMMM yyyy')}</time>
          <h1>{post.title}</h1>
          {post.description ? <p>{post.description}</p> : null}
        </header>
        {post.thumbnail ? <img className="blog-article-cover" src={post.thumbnail} alt="" /> : null}
        <PostContent html={post.content} />
      </article>
    </main>
  );
}
