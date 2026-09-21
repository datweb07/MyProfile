-- Public engagement for blog posts. Run after 202609210001_blog.sql.

alter table public.posts
  add column if not exists views_count bigint not null default 0 check (views_count >= 0),
  add column if not exists likes_count bigint not null default 0 check (likes_count >= 0);

-- Engagement counters must not make a post look content-edited in the CMS.
create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if row(new.title, new.slug, new.content, new.description, new.thumbnail, new.draft, new.published_at)
    is distinct from
    row(old.title, old.slug, old.content, old.description, old.thumbnail, old.draft, old.published_at) then
    new.updated_at = now();
  else
    new.updated_at = old.updated_at;
  end if;
  return new;
end;
$$;

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  content text not null check (char_length(trim(content)) between 1 and 2000),
  likes_count bigint not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_created_idx
  on public.post_comments (post_id, created_at desc);

alter table public.post_comments enable row level security;

drop policy if exists "Public can read comments on published posts" on public.post_comments;
create policy "Public can read comments on published posts"
on public.post_comments for select to anon, authenticated
using (exists (select 1 from public.posts where posts.id = post_id and posts.draft = false));

drop policy if exists "Admins can manage comments" on public.post_comments;
create policy "Admins can manage comments"
on public.post_comments for all to authenticated
using (public.is_blog_admin()) with check (public.is_blog_admin());

create or replace function public.increment_post_views(p_post_id uuid)
returns bigint language plpgsql security definer set search_path = public
as $$
declare next_count bigint;
begin
  update posts set views_count = views_count + 1
  where id = p_post_id and draft = false
  returning views_count into next_count;
  return next_count;
end;
$$;

create or replace function public.increment_post_likes(p_post_id uuid)
returns bigint language plpgsql security definer set search_path = public
as $$
declare next_count bigint;
begin
  update posts set likes_count = likes_count + 1
  where id = p_post_id and draft = false
  returning likes_count into next_count;
  return next_count;
end;
$$;

create or replace function public.create_post_comment(p_post_id uuid, p_commenter_name text, p_comment_content text)
returns public.post_comments language plpgsql security definer set search_path = public
as $$
declare created_comment public.post_comments;
begin
  if char_length(trim(p_commenter_name)) not between 1 and 80 then raise exception 'Name must be between 1 and 80 characters'; end if;
  if char_length(trim(p_comment_content)) not between 1 and 2000 then raise exception 'Comment must be between 1 and 2000 characters'; end if;
  if not exists (select 1 from posts where id = p_post_id and draft = false) then raise exception 'Post not found'; end if;
  insert into post_comments (post_id, name, content)
  values (p_post_id, trim(p_commenter_name), trim(p_comment_content))
  returning * into created_comment;
  return created_comment;
end;
$$;

create or replace function public.increment_comment_likes(p_comment_id uuid)
returns bigint language plpgsql security definer set search_path = public
as $$
declare next_count bigint;
begin
  update post_comments set likes_count = likes_count + 1
  where id = p_comment_id
    and exists (select 1 from posts where posts.id = post_comments.post_id and posts.draft = false)
  returning likes_count into next_count;
  return next_count;
end;
$$;

revoke all on function public.increment_post_views(uuid) from public;
revoke all on function public.increment_post_likes(uuid) from public;
revoke all on function public.create_post_comment(uuid, text, text) from public;
revoke all on function public.increment_comment_likes(uuid) from public;
grant execute on function public.increment_post_views(uuid) to anon, authenticated;
grant execute on function public.increment_post_likes(uuid) to anon, authenticated;
grant execute on function public.create_post_comment(uuid, text, text) to anon, authenticated;
grant execute on function public.increment_comment_likes(uuid) to anon, authenticated;

grant select on public.post_comments to anon, authenticated;
