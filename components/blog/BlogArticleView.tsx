import Link from 'next/link';
import {format} from 'date-fns';
import PostContent from '@/components/blog/PostContent';
import BlogEngagement from '@/components/blog/BlogEngagement';
import PostViewCounter from '@/components/blog/PostViewCounter';
import TrackedPostLink from '@/components/blog/TrackedPostLink';
import type {BlogComment, Post, PostCard} from '@/types/blog';

export default function BlogArticleView({post, comments, relatedPosts}: {
  post: Post;
  comments: BlogComment[];
  relatedPosts: PostCard[];
}) {
  return (
    <div className="portfolio-blog-article">
      <div className="blog-article-layout">
        <article className="blog-article">
          <header className="blog-article-header">
            <Link href="/en/writing">← Back to Blog</Link>
            <time dateTime={post.published_at}>{format(new Date(post.published_at), 'dd MMMM yyyy')}</time>
            <h1>{post.title}</h1>
            {post.description ? <p>{post.description}</p> : null}
            <div className="blog-article-stats">
              <PostViewCounter postId={post.id} initialViews={post.views_count ?? 0} />
              <span>{post.likes_count ?? 0} likes</span>
              <span>{comments.length} comments</span>
            </div>
          </header>
          {post.thumbnail ? <img className="blog-article-cover" src={post.thumbnail} alt="" /> : null}
          <PostContent html={post.content} />
          <BlogEngagement postId={post.id} initialLikes={post.likes_count ?? 0} initialComments={comments} />
        </article>

        <aside className="blog-related" aria-labelledby="related-posts-title">
          <h2 id="related-posts-title">Blog</h2>
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
    </div>
  );
}
