'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {createPostAction, updatePostAction} from '@/app/admin/posts/actions';
import MetadataForm, {type MetadataValue} from '@/components/admin/MetadataForm';
import RichTextEditor from '@/components/admin/RichTextEditor';
import {replaceBlobImages} from '@/lib/blog-images';
import type {Post} from '@/types/blog';

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function PostEditorForm({post}: {post?: Post}) {
  const router = useRouter();
  const [metadata, setMetadata] = useState<MetadataValue>({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    description: post?.description ?? '',
    thumbnail: post?.thumbnail ?? '',
    draft: post?.draft ?? true,
    published_at: toDateTimeLocal(post?.published_at ?? new Date().toISOString())
  });
  const [content, setContent] = useState(post?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [toast, setToast] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    setToast('');
    setFieldErrors({});

    try {
      const publishedAt = new Date(metadata.published_at);
      if (!metadata.published_at || Number.isNaN(publishedAt.getTime())) {
        setError('Published date is required.');
        return;
      }
      const normalizedContent = await replaceBlobImages(content, metadata.slug);
      const payload = {
        ...metadata,
        content: normalizedContent,
        published_at: publishedAt.toISOString()
      };
      const result = post
        ? await updatePostAction({...payload, id: post.id})
        : await createPostAction(payload);

      if (!result.ok) {
        setError(result.error ?? 'Could not save the post.');
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setContent(normalizedContent);
      setToast(post ? 'Post updated successfully.' : 'Post created successfully.');
      router.push('/admin/posts');
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the post.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-editor-page">
      <div className="admin-editor-topbar">
        <div>
          <span className="admin-eyebrow">{post ? 'Edit post' : 'New post'}</span>
          <h1>{metadata.title || 'Untitled article'}</h1>
        </div>
        <div className="admin-save-area">
          {error ? <span className="admin-form-error" role="alert">{error}</span> : null}
          {toast ? <span className="admin-success" role="status">{toast}</span> : null}
          <button className="blog-button blog-button-primary" type="button" disabled={saving || uploading} onClick={() => void save()}>
            {saving ? 'Saving…' : uploading ? 'Uploading…' : post ? 'Update post' : 'Publish post'}
          </button>
        </div>
      </div>
      <div className="admin-editor-grid">
        <MetadataForm value={metadata} onChange={setMetadata} errors={fieldErrors} />
        <main className="admin-editor-main">
          <RichTextEditor content={content} onChange={setContent} slug={metadata.slug} onUploadStateChange={setUploading} />
          {fieldErrors.content?.[0] ? <p className="admin-form-error">{fieldErrors.content[0]}</p> : null}
        </main>
      </div>
    </div>
  );
}
