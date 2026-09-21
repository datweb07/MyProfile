import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {format} from 'date-fns';
import PostContent from '@/components/blog/PostContent';
import BlogEngagement from '@/components/blog/BlogEngagement';
import TrackedPostLink from '@/components/blog/TrackedPostLink';
import {getPostComments, getPublishedPostBySlug, getRelatedPosts} from '@/lib/posts';

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
  const [comments, relatedPosts] = await Promise.all([
    getPostComments(post.id),
    getRelatedPosts(post.id)
  ]);

  return (
    <main className="blog-site blog-article-site">
      <header className="blog-header">
        <Link className="blog-logo" href="/en/writing">DAT / BLOG</Link>
        <nav><Link href="/en/home">Portfolio</Link></nav>
      </header>
      <div className="blog-article-layout">
        <article className="blog-article">
          <header className="blog-article-header">
            <Link href="/en/writing">← Back to portfolio</Link>
            <time dateTime={post.published_at}>{format(new Date(post.published_at), 'dd MMMM yyyy')}</time>
            <h1>{post.title}</h1>
            {post.description ? <p>{post.description}</p> : null}
            <div className="blog-article-stats"><span>{post.views_count ?? 0} views</span><span>{post.likes_count ?? 0} likes</span><span>{comments.length} comments</span></div>
          </header>
          {post.thumbnail ? <img className="blog-article-cover" src={post.thumbnail} alt="" /> : null}
          <PostContent html={post.content} />
          <BlogEngagement postId={post.id} initialLikes={post.likes_count ?? 0} initialComments={comments} />
        </article>

        <aside className="blog-related" aria-labelledby="related-posts-title">
          <h2 id="related-posts-title">Latest writing</h2>
          {relatedPosts.length ? (
            <ol>
              {relatedPosts.map((related) => (
                <li key={related.id}>
                  <TrackedPostLink postId={related.id} slug={related.slug}>
                    <time dateTime={related.published_at}>{format(new Date(related.published_at), 'dd/MM/yyyy')}</time>
                    <span>{related.title}</span>
                    <span className="blog-related-preview" aria-hidden="true">
                      {related.thumbnail ? <img src={related.thumbnail} alt="" loading="lazy" /> : <span className="blog-related-placeholder">DAT / BLOG</span>}
                      <strong>{related.title}</strong>
                      <small>{format(new Date(related.published_at), 'dd MMMM yyyy')} · {related.views_count ?? 0} views</small>
                    </span>
                  </TrackedPostLink>
                </li>
              ))}
            </ol>
          ) : <p>No other articles yet.</p>}
        </aside>
      </div>
    </main>
  );
}
