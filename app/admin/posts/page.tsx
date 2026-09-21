import Link from 'next/link';
import PostsTable from '@/components/admin/PostsTable';
import Pagination from '@/components/blog/Pagination';
import {getAdminPosts, POSTS_PER_PAGE} from '@/lib/posts';

export default async function AdminPostsPage({searchParams}: {searchParams: Promise<{page?: string}>}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);

  try {
    const {posts, count} = await getAdminPosts(page);
    const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));
    return (
      <main className="admin-list-page">
        <header className="admin-page-header">
          <div><span className="admin-eyebrow">Content</span><h1>Posts</h1><p>{count} article{count === 1 ? '' : 's'} in your library.</p></div>
          <Link className="blog-button blog-button-primary" href="/admin/posts/new">New post</Link>
        </header>
        <PostsTable posts={posts} />
        <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} basePath="/admin/posts" />
      </main>
    );
  } catch (error) {
    return (
      <main className="admin-list-page">
        <div className="admin-setup-card"><h1>Blog database is not ready</h1><p>{error instanceof Error ? error.message : 'Could not query posts.'}</p><p>Run <code>supabase/migrations/202609210001_blog.sql</code> in Supabase SQL Editor, then reload this page.</p></div>
      </main>
    );
  }
}
