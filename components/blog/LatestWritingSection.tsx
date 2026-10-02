import PostCard from '@/components/blog/PostCard';
import type {PostCard as PostCardData} from '@/types/blog';

export default function LatestWritingSection({
  posts,
  count,
  locale
}: {
  posts: PostCardData[];
  count: number;
  locale: string;
}) {
  const isVietnamese = locale === 'vi';

  return (
    <section className="portfolio-writing-section" aria-labelledby="blog-section-title">
      <div className="blog-section-heading">
        <h2 id="blog-section-title" className="section-title"><span className="chonky_underline">Blog</span></h2>
        <span>{count} {isVietnamese ? 'bài viết' : count === 1 ? 'article' : 'articles'}</span>
      </div>
      {posts.length ? (
        <div className="blog-grid">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
      ) : (
        <div className="blog-empty">
          <h2>{isVietnamese ? 'Chưa có bài viết nào.' : 'No published posts yet.'}</h2>
          <p>{isVietnamese ? 'Bài viết đầu tiên đang được chuẩn bị.' : 'The first article is being written.'}</p>
        </div>
      )}
    </section>
  );
}
