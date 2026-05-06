-- 032_reply_media
-- Allow media (post_media table) to attach to replies, not just posts.
-- A media row now belongs to either a post OR a reply (xor).

alter table public.post_media
  add column reply_id uuid references public.replies(id) on delete cascade;

alter table public.post_media
  alter column post_id drop not null;

-- Exactly one parent (post or reply) must be set.
alter table public.post_media
  add constraint post_media_parent_xor
  check ((post_id is null) <> (reply_id is null));

-- Index for reply_id lookups (joins).
create index post_media_reply_id_idx on public.post_media(reply_id);

-- Replace SELECT policy: visible if parent post visible OR parent reply visible.
drop policy if exists "media visible if parent post visible" on public.post_media;
create policy "media visible if parent visible" on public.post_media for select
  using (
    (post_id is not null and exists (
      select 1 from public.posts p where p.id = post_media.post_id
    ))
    or (reply_id is not null and exists (
      select 1 from public.replies r where r.id = post_media.reply_id
    ))
  );

-- INSERT policy for own reply media.
create policy "users can insert media for own replies" on public.post_media
  for insert with check (
    reply_id is not null
    and exists (
      select 1 from public.replies r
      where r.id = post_media.reply_id
      and r.author_id = (select auth.uid())
    )
  );

-- DELETE policy for own reply media.
create policy "users can delete media for own replies" on public.post_media
  for delete using (
    reply_id is not null
    and exists (
      select 1 from public.replies r
      where r.id = post_media.reply_id
      and r.author_id = (select auth.uid())
    )
  );
