-- Personal blog schema for MyProfile.
-- Run this file once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  content text not null,
  description text not null default '',
  thumbnail text not null default '',
  draft boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz not null default now()
);

-- Explicit allowlist: being authenticated alone does not grant CMS access.
create table if not exists public.blog_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.blog_admins enable row level security;

drop policy if exists "Admins can read their own allowlist row" on public.blog_admins;
create policy "Admins can read their own allowlist row"
on public.blog_admins for select
to authenticated
using (user_id = auth.uid());

create or replace function public.is_blog_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blog_admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_blog_admin() from public;
grant execute on function public.is_blog_admin() to anon, authenticated;

create unique index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_published_at_idx
  on public.posts (published_at desc)
  where draft = false;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
before update on public.posts
for each row execute function public.update_updated_at();

alter table public.posts enable row level security;

drop policy if exists "Published posts are public" on public.posts;
create policy "Published posts are public"
on public.posts for select
to anon, authenticated
using (draft = false);

drop policy if exists "Authenticated admin can read all posts" on public.posts;
create policy "Authenticated admin can read all posts"
on public.posts for select
to authenticated
using (public.is_blog_admin());

drop policy if exists "Authenticated admin can insert posts" on public.posts;
create policy "Authenticated admin can insert posts"
on public.posts for insert
to authenticated
with check (public.is_blog_admin());

drop policy if exists "Authenticated admin can update posts" on public.posts;
create policy "Authenticated admin can update posts"
on public.posts for update
to authenticated
using (public.is_blog_admin())
with check (public.is_blog_admin());

drop policy if exists "Authenticated admin can delete posts" on public.posts;
create policy "Authenticated admin can delete posts"
on public.posts for delete
to authenticated
using (public.is_blog_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Blog images are public" on storage.objects;
create policy "Blog images are public"
on storage.objects for select
to public
using (bucket_id = 'blog-images');

drop policy if exists "Authenticated admin can upload blog images" on storage.objects;
create policy "Authenticated admin can upload blog images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'blog-images' and public.is_blog_admin());

drop policy if exists "Authenticated admin can update blog images" on storage.objects;
create policy "Authenticated admin can update blog images"
on storage.objects for update
to authenticated
using (bucket_id = 'blog-images' and public.is_blog_admin())
with check (bucket_id = 'blog-images' and public.is_blog_admin());

drop policy if exists "Authenticated admin can delete blog images" on storage.objects;
create policy "Authenticated admin can delete blog images"
on storage.objects for delete
to authenticated
using (bucket_id = 'blog-images' and public.is_blog_admin());

-- After creating your only admin in Authentication > Users, run this once
-- with your real email address (remove the leading -- first):
-- insert into public.blog_admins (user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL@example.com'
-- on conflict (user_id) do nothing;
