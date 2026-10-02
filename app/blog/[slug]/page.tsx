import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import BlogArticleView from '@/components/blog/BlogArticleView';
import LocalePortfolioPage from '@/components/LocalePortfolioPage';
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

  return <LocalePortfolioPage locale="en" articleContent={<BlogArticleView post={post} comments={comments} relatedPosts={relatedPosts} />} />;
}
