'use client';

import {useState, useTransition} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {format} from 'date-fns';
import {deletePostAction, togglePostDraftAction} from '@/app/admin/posts/actions';
import TrackedPostLink from '@/components/blog/TrackedPostLink';
import type {PostCard} from '@/types/blog';

export default function PostsTable({posts}: {posts: PostCard[]}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function run(action: () => Promise<{ok: boolean; error?: string}>) {
    setError('');
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? 'Action failed.');
      else router.refresh();
    });
  }

  if (!posts.length) {
    return <div className="admin-empty">No posts yet. Create your first article.</div>;
  }

  return (
    <>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <div className="admin-table-wrap" aria-busy={pending}>
        <table className="admin-posts-table">
          <thead><tr><th>Title</th><th>Published at</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td><TrackedPostLink postId={post.id} slug={post.slug} title="Open published article in a new tab" newTab>{post.title}</TrackedPostLink><small>/{post.slug}</small></td>
                <td>{format(new Date(post.published_at), 'dd MMM yyyy, HH:mm')}</td>
                <td><span className={`admin-status ${post.draft ? 'is-draft' : 'is-published'}`}>{post.draft ? 'Draft' : 'Published'}</span></td>
                <td>
                  <div className="admin-table-actions">
                    <Link className="admin-text-button" href={`/admin/posts/${post.id}`}>Edit</Link>
                    <button className="admin-text-button" type="button" disabled={pending} onClick={() => run(() => togglePostDraftAction(post.id, !post.draft))}>
                      {post.draft ? 'Publish' : 'Unpublish'}
                    </button>
                    <button
                      className="admin-text-button is-danger"
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (window.confirm(`Delete “${post.title}” and all of its images?`)) run(() => deletePostAction(post.id));
                      }}
                    >Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
