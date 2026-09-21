import Link from 'next/link';
import {format} from 'date-fns';
import type {PostCard as PostCardData} from '@/types/blog';

export default function PostCard({post}: {post: PostCardData}) {
  return (
    <article className="blog-card">
      <Link className="blog-card-image" href={`/blog/${post.slug}`} aria-label={post.title}>
        {post.thumbnail ? <img src={post.thumbnail} alt="" loading="lazy" /> : <span>DAT / BLOG</span>}
      </Link>
      <div className="blog-card-body">
        <time dateTime={post.published_at}>{format(new Date(post.published_at), 'dd MMMM yyyy')}</time>
        <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
        {post.description ? <p>{post.description}</p> : null}
        <Link className="blog-read-more" href={`/blog/${post.slug}`}>Read article →</Link>
      </div>
    </article>
  );
}
