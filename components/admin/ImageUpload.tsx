'use client';

import {useRef, useState} from 'react';
import {uploadImage} from '@/lib/blog-images';

export default function ImageUpload({
  slug,
  value,
  onChange
}: {
  slug: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file?: File) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      onChange(await uploadImage(file, slug));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="admin-image-upload">
      {value ? <img src={value} alt="Thumbnail preview" /> : <div className="admin-image-placeholder">No thumbnail</div>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={(event) => void handleFile(event.target.files?.[0])}
        hidden
      />
      <div className="admin-inline-actions">
        <button className="blog-button" type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
        </button>
        {value ? <button className="blog-button blog-button-danger-text" type="button" onClick={() => onChange('')}>Remove</button> : null}
      </div>
      {error ? <small className="admin-form-error">{error}</small> : null}
    </div>
  );
}
