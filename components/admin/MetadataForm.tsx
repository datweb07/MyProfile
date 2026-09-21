'use client';

import ImageUpload from '@/components/admin/ImageUpload';
import {createSlug} from '@/lib/slugify';

export type MetadataValue = {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  draft: boolean;
  published_at: string;
};

export default function MetadataForm({
  value,
  onChange,
  errors = {}
}: {
  value: MetadataValue;
  onChange: (next: MetadataValue) => void;
  errors?: Record<string, string[]>;
}) {
  function set<Key extends keyof MetadataValue>(key: Key, fieldValue: MetadataValue[Key]) {
    onChange({...value, [key]: fieldValue});
  }

  return (
    <aside className="admin-metadata-panel">
      <div className="admin-field">
        <label htmlFor="post-title">Title</label>
        <input id="post-title" value={value.title} onChange={(event) => set('title', event.target.value)} required />
        {errors.title?.[0] ? <small className="admin-form-error">{errors.title[0]}</small> : null}
      </div>

      <div className="admin-field">
        <div className="admin-label-row">
          <label htmlFor="post-slug">Slug</label>
          <button className="admin-text-button" type="button" onClick={() => set('slug', createSlug(value.title))}>Generate</button>
        </div>
        <input id="post-slug" value={value.slug} onChange={(event) => set('slug', createSlug(event.target.value))} required />
        {errors.slug?.[0] ? <small className="admin-form-error">{errors.slug[0]}</small> : null}
      </div>

      <div className="admin-field">
        <label htmlFor="post-description">Description</label>
        <textarea id="post-description" rows={5} value={value.description} onChange={(event) => set('description', event.target.value)} />
      </div>

      <div className="admin-field">
        <label>Thumbnail</label>
        <ImageUpload slug={value.slug} value={value.thumbnail} onChange={(url) => set('thumbnail', url)} />
      </div>

      <div className="admin-field">
        <label htmlFor="post-status">Status</label>
        <select id="post-status" value={value.draft ? 'draft' : 'published'} onChange={(event) => set('draft', event.target.value === 'draft')}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="admin-field">
        <label htmlFor="published-at">Published at</label>
        <input id="published-at" type="datetime-local" value={value.published_at} onChange={(event) => set('published_at', event.target.value)} required />
      </div>
    </aside>
  );
}
