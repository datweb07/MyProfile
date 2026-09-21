import type {Metadata} from 'next';
import Link from 'next/link';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/blog/Pagination';
import {getPublishedPosts, POSTS_PER_PAGE} from '@/lib/posts';
import type {PostCard as PostCardData} from '@/types/blog';

export const metadata: Metadata = {
  title: 'Blog — Dat Truong',
  description: 'Notes about backend engineering, AI, software and the things Dat Truong learns along the way.',
  alternates: {canonical: '/blog'}
};

export default async function BlogPage({searchParams}: {searchParams: Promise<{page?: string}>}) {
  const params = await searchParams;
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);

  let posts: PostCardData[] = [];
  let count = 0;
  let databaseError = '';
  try {
    const result = await getPublishedPosts(requestedPage);
    posts = result.posts;
    count = result.count;
  } catch (error) {
    databaseError = error instanceof Error ? error.message : 'The blog is temporarily unavailable.';
  }

  const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));
  const page = Math.min(requestedPage, totalPages);

  return (
    <main className="blog-site">
      <header className="blog-header">
        <Link className="blog-logo" href="/blog">DAT / BLOG</Link>
        <nav><Link href="/en">Portfolio</Link><Link href="/admin/posts">Admin</Link></nav>
      </header>

      <section className="blog-hero">
        <span>Personal journal</span>
        <h1>Notes from building<br />software and AI.</h1>
        <p>A single stream of practical ideas, experiments and lessons—without categories or noise.</p>
      </section>

      <section className="blog-list-section">
        <div className="blog-section-heading"><h2>Latest writing</h2><span>{count} articles</span></div>
        {databaseError ? (
          <div className="blog-empty"><h2>Blog setup in progress</h2><p>{databaseError}</p></div>
        ) : posts.length ? (
          <div className="blog-grid">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
        ) : (
          <div className="blog-empty"><h2>No published posts yet.</h2><p>The first article is being written.</p></div>
        )}
        <Pagination page={page} totalPages={totalPages} basePath="/blog" />
      </section>
    </main>
  );
}
