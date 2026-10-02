'use client';

import {useState, useTransition} from 'react';
import {format} from 'date-fns';
import {sendEngagement} from '@/lib/engagement-client';
import type {BlogComment} from '@/types/blog';

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 22v-9h3l.45-3.5H13.6V7.27c0-1.01.28-1.7 1.73-1.7h1.85V2.44A24.8 24.8 0 0 0 14.48 2c-2.67 0-4.5 1.63-4.5 4.62V9.5H7v3.5h2.98v9h3.62Z"/></svg>;
}

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.34 3.5A2.34 2.34 0 1 1 .66 3.5a2.34 2.34 0 0 1 4.68 0ZM1.05 7.05h3.86V22H1.05V7.05Zm6.3 0h3.7v2.04h.05c.52-.98 1.78-2.02 3.66-2.02 3.91 0 4.64 2.58 4.64 5.93v9h-3.86v-7.98c0-1.9-.04-4.35-2.65-4.35-2.65 0-3.06 2.07-3.06 4.21V22H7.35V7.05Z"/></svg>;
}

function HeartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"/></svg>;
}

export default function BlogEngagement({postId, initialLikes, initialComments}: {postId: string; initialLikes: number; initialComments: BlogComment[]}) {
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function likePost() {
    startTransition(async () => {
      try {
        const data = await sendEngagement({action: 'like-post', postId});
        setLikes(Number(data ?? likes + 1));
      } catch (likeError) {
        setError(likeError instanceof Error ? likeError.message : 'Could not like article.');
      }
    });
  }

  function share(network: 'facebook' | 'linkedin') {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const shareUrl = network === 'facebook'
      ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=720,height=620');
  }

  function submitComment(formData: FormData) {
    const name = String(formData.get('name') ?? '').trim();
    const content = String(formData.get('content') ?? '').trim();
    if (!name || !content) {
      setError('Please enter both your name and comment.');
      return;
    }
    setError('');
    startTransition(async () => {
      try {
        const data = await sendEngagement({action: 'comment', postId, name, content});
        setComments((current) => [data as BlogComment, ...current]);
        (document.getElementById('blog-comment-form') as HTMLFormElement | null)?.reset();
      } catch (commentError) {
        setError(commentError instanceof Error ? commentError.message : 'Could not post comment.');
        return;
      }
    });
  }

  function likeComment(commentId: string) {
    startTransition(async () => {
      try {
        const data = await sendEngagement({action: 'like-comment', commentId});
        setComments((current) => current.map((comment) => comment.id === commentId ? {...comment, likes_count: Number(data)} : comment));
      } catch (likeError) {
        setError(likeError instanceof Error ? likeError.message : 'Could not like comment.');
      }
    });
  }

  return (
    <section className="blog-engagement" aria-label="Article engagement">
      <div className="blog-post-actions">
        <button className="blog-like-button" type="button" onClick={likePost} disabled={pending}><HeartIcon /><span>Like article</span><strong>{likes}</strong></button>
        <div className="blog-share-buttons" aria-label="Share this article">
          <button type="button" onClick={() => share('facebook')}><FacebookIcon /><span>Facebook</span></button>
          <button type="button" onClick={() => share('linkedin')}><LinkedInIcon /><span>LinkedIn</span></button>
        </div>
      </div>

      <div className="blog-comments">
        <div className="blog-comments-heading"><h2>Comments</h2><span>{comments.length}</span></div>
        <form id="blog-comment-form" className="blog-comment-form" action={submitComment}>
          <label><span>Your name</span><input name="name" maxLength={80} required /></label>
          <label><span>Comment</span><textarea name="content" rows={5} maxLength={2000} required /></label>
          <button className="blog-button blog-button-primary" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Post comment'}</button>
        </form>
        {error ? <p className="blog-engagement-error" role="alert">{error}</p> : null}
        <div className="blog-comment-list">
          {comments.map((comment) => (
            <article className="blog-comment" key={comment.id}>
              <header><strong>{comment.name}</strong><time dateTime={comment.created_at}>{format(new Date(comment.created_at), 'dd MMM yyyy, HH:mm')}</time></header>
              <p>{comment.content}</p>
              <button type="button" onClick={() => likeComment(comment.id)} disabled={pending} aria-label={`Like comment by ${comment.name}`}><HeartIcon /><span>{comment.likes_count}</span></button>
            </article>
          ))}
          {!comments.length ? <p className="blog-no-comments">No comments yet. Be the first to join the conversation.</p> : null}
        </div>
      </div>
    </section>
  );
}
