'use client';

import {createClient} from '@/lib/supabase/client';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

function safeFileName(name: string) {
  const extension = name.split('.').pop()?.toLowerCase() || 'jpg';
  const base = name
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'image';
  return `${base}-${crypto.randomUUID()}.${extension}`;
}

export async function uploadImage(file: File, slug: string): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error('Unsupported image format.');
  if (file.size > MAX_IMAGE_SIZE) throw new Error('Image must be smaller than 10 MB.');
  if (!slug) throw new Error('Enter a slug before uploading images.');

  const supabase = createClient();
  const path = `posts/${slug}/${safeFileName(file.name)}`;
  const {data, error} = await supabase.storage.from('blog-images').upload(path, file, {
    cacheControl: '31536000',
    upsert: false
  });

  if (error) throw error;
  return supabase.storage.from('blog-images').getPublicUrl(data.path).data.publicUrl;
}

export async function replaceBlobImages(html: string, slug: string) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const images = Array.from(document.querySelectorAll<HTMLImageElement>('img[src^="blob:"]'));

  for (const image of images) {
    const response = await fetch(image.src);
    const blob = await response.blob();
    const extension = blob.type.split('/')[1] || 'png';
    const file = new File([blob], `editor-${Date.now()}.${extension}`, {type: blob.type});
    image.src = await uploadImage(file, slug);
  }

  return document.body.innerHTML;
}
