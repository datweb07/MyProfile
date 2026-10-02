-- Abuse controls for anonymous blog engagement.
-- Run after 202609210002_blog_engagement.sql.

create table if not exists public.blog_engagement_limits (
  action text not null,
  resource_id uuid not null,
  client_hash text not null,
  window_started_at timestamptz not null default now(),
  hits integer not null default 1,
  primary key (action, resource_id, client_hash)
);

alter table public.blog_engagement_limits enable row level security;
revoke all on public.blog_engagement_limits from anon, authenticated;

create or replace function public.check_blog_engagement_rate(
  p_action text,
  p_resource_id uuid,
  p_client_token text,
  p_limit integer,
  p_window_seconds integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  next_hits integer;
  token_hash text;
begin
  if p_client_token is null or p_client_token !~ '^[0-9a-fA-F-]{36}$' then
    raise exception 'Invalid client token';
  end if;

  token_hash := encode(extensions.digest(p_client_token, 'sha256'), 'hex');

  insert into blog_engagement_limits (action, resource_id, client_hash, window_started_at, hits)
  values (p_action, p_resource_id, token_hash, now(), 1)
  on conflict (action, resource_id, client_hash) do update
  set
    hits = case
      when blog_engagement_limits.window_started_at < now() - make_interval(secs => p_window_seconds) then 1
      else blog_engagement_limits.hits + 1
    end,
    window_started_at = case
      when blog_engagement_limits.window_started_at < now() - make_interval(secs => p_window_seconds) then now()
      else blog_engagement_limits.window_started_at
    end
  returning hits into next_hits;

  if next_hits > p_limit then
    raise exception 'Rate limit exceeded. Please try again later.' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.check_blog_engagement_rate(text, uuid, text, integer, integer) from public;

drop function if exists public.increment_post_views(uuid);
create function public.increment_post_views(p_post_id uuid, p_client_token text)
returns bigint language plpgsql security definer set search_path = public
as $$
declare next_count bigint;
begin
  perform check_blog_engagement_rate('view', p_post_id, p_client_token, 120, 3600);
  update posts set views_count = views_count + 1
  where id = p_post_id and draft = false
  returning views_count into next_count;
  return next_count;
end;
$$;

drop function if exists public.increment_post_likes(uuid);
create function public.increment_post_likes(p_post_id uuid, p_client_token text)
returns bigint language plpgsql security definer set search_path = public
as $$
declare next_count bigint;
begin
  perform check_blog_engagement_rate('post-like', p_post_id, p_client_token, 10, 3600);
  update posts set likes_count = likes_count + 1
  where id = p_post_id and draft = false
  returning likes_count into next_count;
  return next_count;
end;
$$;

drop function if exists public.create_post_comment(uuid, text, text);
create function public.create_post_comment(p_post_id uuid, p_commenter_name text, p_comment_content text, p_client_token text)
returns public.post_comments language plpgsql security definer set search_path = public
as $$
declare created_comment public.post_comments;
begin
  perform check_blog_engagement_rate('comment', p_post_id, p_client_token, 5, 600);
  if char_length(trim(p_commenter_name)) not between 1 and 80 then raise exception 'Name must be between 1 and 80 characters'; end if;
  if char_length(trim(p_comment_content)) not between 1 and 2000 then raise exception 'Comment must be between 1 and 2000 characters'; end if;
  if not exists (select 1 from posts where id = p_post_id and draft = false) then raise exception 'Post not found'; end if;
  insert into post_comments (post_id, name, content)
  values (p_post_id, trim(p_commenter_name), trim(p_comment_content))
  returning * into created_comment;
  return created_comment;
end;
$$;

drop function if exists public.increment_comment_likes(uuid);
create function public.increment_comment_likes(p_comment_id uuid, p_client_token text)
returns bigint language plpgsql security definer set search_path = public
as $$
declare next_count bigint;
begin
  perform check_blog_engagement_rate('comment-like', p_comment_id, p_client_token, 20, 3600);
  update post_comments set likes_count = likes_count + 1
  where id = p_comment_id
    and exists (select 1 from posts where posts.id = post_comments.post_id and posts.draft = false)
  returning likes_count into next_count;
  return next_count;
end;
$$;

revoke all on function public.increment_post_views(uuid, text) from public;
revoke all on function public.increment_post_likes(uuid, text) from public;
revoke all on function public.create_post_comment(uuid, text, text, text) from public;
revoke all on function public.increment_comment_likes(uuid, text) from public;
grant execute on function public.increment_post_views(uuid, text) to service_role;
grant execute on function public.increment_post_likes(uuid, text) to service_role;
grant execute on function public.create_post_comment(uuid, text, text, text) to service_role;
grant execute on function public.increment_comment_likes(uuid, text) to service_role;
