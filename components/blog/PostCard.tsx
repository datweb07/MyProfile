'use client';

import {format} from 'date-fns';
import TrackedPostLink from '@/components/blog/TrackedPostLink';
import type {PostCard as PostCardData} from '@/types/blog';

export default function PostCard({post}: {post: PostCardData}) {
  return (
    <article className="blog-card">
      <TrackedPostLink className="blog-card-image" postId={post.id} slug={post.slug} title={`${post.title} (opens in a new tab)`}>
        {post.thumbnail ? <img src={post.thumbnail} alt="" loading="lazy" /> : <span>DAT / BLOG</span>}
      </TrackedPostLink>
      <div className="blog-card-body">
        <time dateTime={post.published_at}>{format(new Date(post.published_at), 'dd MMMM yyyy')}</time>
        <h2><TrackedPostLink postId={post.id} slug={post.slug}>{post.title}</TrackedPostLink></h2>
        {post.description ? <p>{post.description}</p> : null}
        <div className="blog-card-stats"><span>{post.views_count ?? 0} views</span><span>{post.likes_count ?? 0} likes</span></div>
        <TrackedPostLink className="blog-read-more" postId={post.id} slug={post.slug}>Read article →</TrackedPostLink>
      </div>
    </article>
  );
}
