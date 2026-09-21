'use server';

import {revalidatePath} from 'next/cache';
import {CreatePostSchema, UpdatePostSchema} from '@/lib/blog-schema';
import {createClient} from '@/lib/supabase/server';
import type {PostActionResult} from '@/types/blog';

type SaveResult = PostActionResult & {id?: string};

async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Your admin session has expired. Please sign in again.');

  const {data: admin} = await supabase
    .from('blog_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!admin) throw new Error('This account is not authorized to manage the blog.');
  return supabase;
}

function validationError(error: {flatten: () => {fieldErrors: Record<string, string[]>}}): SaveResult {
  const fieldErrors = error.flatten().fieldErrors;
  return {ok: false, error: Object.values(fieldErrors).flat()[0] ?? 'Invalid post data.', fieldErrors};
}

export async function createPostAction(input: unknown): Promise<SaveResult> {
  const parsed = CreatePostSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const supabase = await authenticatedClient();
    const {data: existing} = await supabase.from('posts').select('id').eq('slug', parsed.data.slug).maybeSingle();
    if (existing) return {ok: false, error: 'This slug is already in use.', fieldErrors: {slug: ['Slug must be unique']}};

    const {data, error} = await supabase.from('posts').insert(parsed.data).select('id').single();
    if (error) throw error;

    revalidatePath('/blog');
    revalidatePath('/en', 'layout');
    revalidatePath('/vi', 'layout');
    revalidatePath(`/blog/${parsed.data.slug}`);
    revalidatePath('/admin/posts');
    return {ok: true, id: data.id};
  } catch (error) {
    return {ok: false, error: error instanceof Error ? error.message : 'Could not create the post.'};
  }
}

export async function updatePostAction(input: unknown): Promise<SaveResult> {
  const parsed = UpdatePostSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const supabase = await authenticatedClient();
    const {data: existing} = await supabase
      .from('posts')
      .select('id')
      .eq('slug', parsed.data.slug)
      .neq('id', parsed.data.id)
      .maybeSingle();
    if (existing) return {ok: false, error: 'This slug is already in use.', fieldErrors: {slug: ['Slug must be unique']}};

    const {id, ...changes} = parsed.data;
    const {error} = await supabase.from('posts').update(changes).eq('id', id);
    if (error) throw error;

    revalidatePath('/blog');
    revalidatePath('/en', 'layout');
    revalidatePath('/vi', 'layout');
    revalidatePath(`/blog/${changes.slug}`);
    revalidatePath('/admin/posts');
    revalidatePath(`/admin/posts/${id}`);
    return {ok: true, id};
  } catch (error) {
    return {ok: false, error: error instanceof Error ? error.message : 'Could not update the post.'};
  }
}

async function removePostImages(slug: string) {
  const supabase = await authenticatedClient();
  const {data, error} = await supabase.storage.from('blog-images').list(`posts/${slug}`, {limit: 1000});
  if (error) throw error;
  if (!data?.length) return;
  const paths = data.filter((item) => item.name !== '.emptyFolderPlaceholder').map((item) => `posts/${slug}/${item.name}`);
  if (paths.length) {
    const {error: removeError} = await supabase.storage.from('blog-images').remove(paths);
    if (removeError) throw removeError;
  }
}

export async function deletePostAction(id: string): Promise<PostActionResult> {
  try {
    const supabase = await authenticatedClient();
    const {data: post, error: findError} = await supabase.from('posts').select('slug').eq('id', id).single();
    if (findError) throw findError;
    await removePostImages(post.slug);
    const {error} = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/blog');
    revalidatePath('/en', 'layout');
    revalidatePath('/vi', 'layout');
    revalidatePath('/admin/posts');
    return {ok: true};
  } catch (error) {
    return {ok: false, error: error instanceof Error ? error.message : 'Could not delete the post.'};
  }
}

export async function togglePostDraftAction(id: string, draft: boolean): Promise<PostActionResult> {
  try {
    const supabase = await authenticatedClient();
    const {error} = await supabase.from('posts').update({draft}).eq('id', id);
    if (error) throw error;
    revalidatePath('/blog');
    revalidatePath('/en', 'layout');
    revalidatePath('/vi', 'layout');
    revalidatePath('/admin/posts');
    return {ok: true};
  } catch (error) {
    return {ok: false, error: error instanceof Error ? error.message : 'Could not change post status.'};
  }
}
