import 'server-only';

import {createClient as createSupabaseClient} from '@supabase/supabase-js';
import {createClient as createServerClient} from '@/lib/supabase/server';
import type {Post, PostCard} from '@/types/blog';

export const POSTS_PER_PAGE = 10;

function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {auth: {persistSession: false, autoRefreshToken: false}}
  );
}

export async function getPublishedPosts(page = 1, pageSize = POSTS_PER_PAGE) {
  const supabase = createPublicClient();
  const from = Math.max(0, page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {data, count, error} = await supabase
    .from('posts')
    .select('id,title,slug,description,thumbnail,draft,published_at', {count: 'exact'})
    .eq('draft', false)
    .lte('published_at', new Date().toISOString())
    .order('published_at', {ascending: false})
    .range(from, to);

  if (error) throw new Error(error.message);
  return {posts: (data ?? []) as PostCard[], count: count ?? 0};
}

export async function getPublishedPostBySlug(slug: string) {
  const supabase = createPublicClient();
  const {data, error} = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('draft', false)
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Post | null;
}

export async function getAdminPosts(page = 1, pageSize = POSTS_PER_PAGE) {
  const supabase = await createServerClient();
  const from = Math.max(0, page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {data, count, error} = await supabase
    .from('posts')
    .select('id,title,slug,description,thumbnail,draft,published_at', {count: 'exact'})
    .order('updated_at', {ascending: false})
    .range(from, to);

  if (error) throw new Error(error.message);
  return {posts: (data ?? []) as PostCard[], count: count ?? 0};
}

export async function getAdminPostById(id: string) {
  const supabase = await createServerClient();
  const {data, error} = await supabase.from('posts').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Post | null;
}
