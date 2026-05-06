-- 031_rls_initplan_optimization
-- Wrap auth.uid() in (select ...) so Postgres evaluates it once per statement
-- instead of once per row. See:
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- bookmarks
drop policy if exists "users delete own bookmarks" on public.bookmarks;
create policy "users delete own bookmarks" on public.bookmarks
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "users insert own bookmarks" on public.bookmarks;
create policy "users insert own bookmarks" on public.bookmarks
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "users select own bookmarks" on public.bookmarks;
create policy "users select own bookmarks" on public.bookmarks
  for select to authenticated using (user_id = (select auth.uid()));

-- deletion_requests
drop policy if exists "admin full deletion_requests" on public.deletion_requests;
create policy "admin full deletion_requests" on public.deletion_requests
  for all using (
    exists (select 1 from profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true)
  ) with check (
    exists (select 1 from profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true)
  );

drop policy if exists "user create own deletion_requests" on public.deletion_requests;
create policy "user create own deletion_requests" on public.deletion_requests
  for insert with check (
    requester_id = (select auth.uid())
    and exists (
      select 1 from posts
      where posts.id = deletion_requests.post_id
      and posts.author_id = (select auth.uid())
    )
  );

drop policy if exists "user read own deletion_requests" on public.deletion_requests;
create policy "user read own deletion_requests" on public.deletion_requests
  for select using (requester_id = (select auth.uid()));

-- empathy
drop policy if exists "users can delete their own empathy" on public.empathy;
create policy "users can delete their own empathy" on public.empathy
  for delete using (user_id = (select auth.uid()));

drop policy if exists "users can insert their own empathy" on public.empathy;
create policy "users can insert their own empathy" on public.empathy
  for insert with check (user_id = (select auth.uid()));

drop policy if exists "users can read their own empathy" on public.empathy;
create policy "users can read their own empathy" on public.empathy
  for select using (user_id = (select auth.uid()));

-- invite_codes
drop policy if exists "admin full invite_codes" on public.invite_codes;
create policy "admin full invite_codes" on public.invite_codes
  for all using (
    exists (select 1 from profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true)
  ) with check (
    exists (select 1 from profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true)
  );

drop policy if exists "user read own invite" on public.invite_codes;
create policy "user read own invite" on public.invite_codes
  for select using (used_by = (select auth.uid()));

-- notifications
drop policy if exists "users can delete their own notifications" on public.notifications;
create policy "users can delete their own notifications" on public.notifications
  for delete using (recipient_id = (select auth.uid()));

drop policy if exists "users can read their own notifications" on public.notifications;
create policy "users can read their own notifications" on public.notifications
  for select using (recipient_id = (select auth.uid()));

drop policy if exists "users can update their own notifications" on public.notifications;
create policy "users can update their own notifications" on public.notifications
  for update using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

-- post_media
drop policy if exists "users can delete media for own posts" on public.post_media;
create policy "users can delete media for own posts" on public.post_media
  for delete using (
    exists (
      select 1 from posts p
      where p.id = post_media.post_id and p.author_id = (select auth.uid())
    )
  );

drop policy if exists "users can insert media for own posts" on public.post_media;
create policy "users can insert media for own posts" on public.post_media
  for insert with check (
    exists (
      select 1 from posts p
      where p.id = post_media.post_id and p.author_id = (select auth.uid())
    )
  );

-- posts
drop policy if exists "posts visible by space" on public.posts;
create policy "posts visible by space" on public.posts
  for select using (
    status = 'published'::post_status
    and (
      space = 'shared'::post_space
      or (
        space = 'self'::post_space
        and exists (
          select 1 from profiles p
          where p.id = (select auth.uid()) and p.role = 'self'::role_kind
        )
      )
      or (
        space = 'family'::post_space
        and exists (
          select 1 from profiles p
          where p.id = (select auth.uid())
          and p.role = any (array['family'::role_kind, 'supporter'::role_kind])
        )
      )
    )
  );

drop policy if exists "users can insert their own posts (not banned)" on public.posts;
create policy "users can insert their own posts (not banned)" on public.posts
  for insert with check (
    author_id = (select auth.uid())
    and not exists (
      select 1 from profiles p
      where p.id = (select auth.uid())
      and p.ban_until is not null
      and (p.ban_until > now() or p.ban_until = 'infinity'::timestamptz)
    )
  );

drop policy if exists "users can read their own posts" on public.posts;
create policy "users can read their own posts" on public.posts
  for select using (author_id = (select auth.uid()));

drop policy if exists "users can update their own posts" on public.posts;
create policy "users can update their own posts" on public.posts
  for update using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

-- profiles
drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile" on public.profiles
  for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- replies
drop policy if exists "users can insert replies (not banned)" on public.replies;
create policy "users can insert replies (not banned)" on public.replies
  for insert with check (
    author_id = (select auth.uid())
    and not exists (
      select 1 from profiles p
      where p.id = (select auth.uid())
      and p.ban_until is not null
      and (p.ban_until > now() or p.ban_until = 'infinity'::timestamptz)
    )
    and exists (select 1 from posts p where p.id = replies.post_id)
  );

drop policy if exists "users can read their own replies" on public.replies;
create policy "users can read their own replies" on public.replies
  for select using (author_id = (select auth.uid()));

drop policy if exists "users can update their own replies" on public.replies;
create policy "users can update their own replies" on public.replies
  for update using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

-- reports
drop policy if exists "users can insert reports" on public.reports;
create policy "users can insert reports" on public.reports
  for insert with check (reporter_id = (select auth.uid()));

drop policy if exists "users can read their own reports" on public.reports;
create policy "users can read their own reports" on public.reports
  for select using (reporter_id = (select auth.uid()));

-- subscriptions
drop policy if exists "users can read their own subscription" on public.subscriptions;
create policy "users can read their own subscription" on public.subscriptions
  for select using (user_id = (select auth.uid()));

-- user_relations
drop policy if exists "users can delete their own relations" on public.user_relations;
create policy "users can delete their own relations" on public.user_relations
  for delete using (user_id = (select auth.uid()));

drop policy if exists "users can insert their own relations" on public.user_relations;
create policy "users can insert their own relations" on public.user_relations
  for insert with check (user_id = (select auth.uid()));

drop policy if exists "users can read their own relations" on public.user_relations;
create policy "users can read their own relations" on public.user_relations
  for select using (user_id = (select auth.uid()));

-- waitlist (admin policy)
drop policy if exists "admin full waitlist" on public.waitlist;
create policy "admin full waitlist" on public.waitlist
  for all using (
    exists (select 1 from profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true)
  ) with check (
    exists (select 1 from profiles where profiles.id = (select auth.uid()) and profiles.is_admin = true)
  );
