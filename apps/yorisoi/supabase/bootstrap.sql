-- ============================================================
-- よりそい Database Bootstrap
-- ============================================================
-- 新規 Supabase プロジェクトに 1 度だけ貼り付けて Run してください。
-- Migration 001〜017 を統合した状態 (= 現状の DB スキーマ全体) です。
--
-- 既存プロジェクトには既に適用済みなので、再実行不要。
-- 二重実行すると enum / table / policy 重複エラーが出ます。
--
-- 適用後は別途以下の手動設定が必要:
-- 1. Supabase Auth: Site URL = https://yorisoi.community
-- 2. Supabase Auth: Redirect URLs に /auth/callback を追加
-- 3. Supabase Auth: SMTP に Resend を設定 (Magic Link 用)
-- 4. Vercel 環境変数を新プロジェクトの URL/keys に更新
-- ============================================================

-- ==========
-- 1. Enums
-- ==========

create type role_kind as enum ('self', 'family', 'supporter');
create type post_space as enum ('self', 'family', 'shared');
create type post_status as enum ('published', 'hidden', 'deleted');
create type post_category as enum ('feeling', 'worry', 'experience', 'question', 'celebration', 'diary');
create type media_kind as enum ('image', 'video');
create type report_target_type as enum ('post', 'user', 'media', 'reply');
create type report_reason as enum (
  'attack_individual', 'spam', 'sexual', 'self_harm', 'crisis',
  'minor_safety', 'no_consent_media', 'misinformation', 'other'
);
create type report_status as enum (
  'pending', 'reviewing', 'resolved_action', 'resolved_no_action', 'dismissed'
);
create type mod_action_type as enum (
  'post_hidden', 'post_deleted', 'user_warned',
  'user_suspended', 'user_banned', 'user_unbanned', 'media_removed'
);
create type sub_status as enum (
  'trialing', 'active', 'past_due', 'canceled', 'incomplete'
);
create type notify_freq as enum ('realtime', 'daily', 'weekly', 'never');
create type font_size_kind as enum ('small', 'medium', 'large');
create type notification_kind as enum ('unazuki', 'reply');

-- ==========
-- 2. Tables (FK 依存順)
-- ==========

-- waitlist (LP 公開、auth 不要)
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text check (role = any (array['self', 'family', 'supporter'])),
  referrer text,
  user_agent text,
  created_at timestamptz default now()
);
comment on table public.waitlist is 'よりそい オープン前のウェイトリスト';

-- profiles (auth.users 拡張)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  role role_kind not null,
  prefecture text,
  city text check (city is null or char_length(city) <= 50),
  bio text check (bio is null or char_length(bio) <= 200),
  email_hash text not null,
  ban_until timestamptz,
  is_admin boolean not null default false,
  -- privacy settings
  show_role boolean not null default true,
  show_prefecture boolean not null default true,
  show_city boolean not null default true,
  show_bio boolean not null default true,
  -- notification settings
  notify_unazuki boolean not null default true,
  notify_reply boolean not null default true,
  notify_admin_response boolean not null default true,
  notify_email_freq notify_freq not null default 'realtime',
  -- accessibility
  font_size font_size_kind not null default 'medium',
  reduce_motion boolean not null default false,
  high_contrast boolean not null default false,
  --
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table public.profiles is 'ユーザープロフィール (auth.users 拡張)';
create index profiles_admin_idx on public.profiles(is_admin) where is_admin = true;

-- posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  space post_space not null,
  body text not null check (char_length(body) > 0 and char_length(body) <= 500),
  status post_status not null default 'published',
  category post_category not null default 'diary',
  ai_safety_score double precision check (
    ai_safety_score is null or (ai_safety_score >= 0 and ai_safety_score <= 1)
  ),
  crisis_detected boolean not null default false,
  empathy_count integer not null default 0,
  reply_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table public.posts is '投稿本体 (テキスト 500字以内)';

-- post_media
create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  kind media_kind not null,
  storage_path text not null,
  width integer,
  height integer,
  bytes integer,
  duration_ms integer,
  blurred boolean not null default false,
  consent_confirmed boolean not null default true,
  ai_unsafe_score double precision check (
    ai_unsafe_score is null or (ai_unsafe_score >= 0 and ai_unsafe_score <= 1)
  ),
  created_at timestamptz default now()
);

-- empathy (うなずき: 1ユーザー1投稿に1回)
create table public.empathy (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);
comment on table public.empathy is 'うなずき (1ユーザー1投稿に1回まで)';

-- replies (コメント・返信)
create table public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 500),
  status post_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.replies is 'コメント・返信 (1投稿に複数、ネスト無し)';
create index replies_post_id_idx on public.replies(post_id, created_at);
create index replies_author_id_idx on public.replies(author_id);

-- reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type report_target_type not null,
  target_id uuid not null,
  reason report_reason not null,
  detail text check (detail is null or char_length(detail) <= 1000),
  status report_status not null default 'pending',
  resolved_by uuid references public.profiles(id) on delete set null,
  resolution_note text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- moderation_actions
create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid references public.profiles(id) on delete set null,
  target_post_id uuid references public.posts(id) on delete set null,
  related_report_id uuid references public.reports(id) on delete set null,
  action_type mod_action_type not null,
  reason text not null,
  duration_hours integer,
  created_at timestamptz default now()
);

-- crisis_events
create table public.crisis_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.posts(id) on delete set null,
  ai_response jsonb,
  resources_shown text[],
  user_acknowledged boolean default false,
  reviewed_by_admin boolean not null default false,
  reviewed_by_admin_at timestamptz,
  reviewed_by_admin_id uuid references public.profiles(id) on delete set null,
  admin_note text,
  created_at timestamptz default now()
);
create index crisis_events_pending_admin_review_idx
  on public.crisis_events(created_at desc)
  where reviewed_by_admin = false;

-- audit_logs (service_role 専用)
create table public.audit_logs (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- subscriptions (Stripe ¥300/月)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  status sub_status not null,
  trial_end timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind notification_kind not null,
  post_id uuid references public.posts(id) on delete cascade,
  reply_id uuid references public.replies(id) on delete cascade,
  read_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);
comment on table public.notifications is 'ユーザー通知 (うなずき・返信)';
create index notifications_recipient_idx on public.notifications(recipient_id, created_at desc);
create index notifications_unread_idx on public.notifications(recipient_id) where read_at is null;
create unique index notifications_dedup_idx
  on public.notifications(recipient_id, actor_id, kind, post_id)
  where reply_id is null;

-- ==========
-- 3. Triggers (count キャッシュ更新)
-- ==========

create or replace function public.update_post_empathy_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts set empathy_count = empathy_count + 1 where id = NEW.post_id;
  elsif (TG_OP = 'DELETE') then
    update public.posts set empathy_count = greatest(empathy_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$;
create trigger empathy_count_trigger
  after insert or delete on public.empathy
  for each row execute function public.update_post_empathy_count();

create or replace function public.update_post_reply_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (TG_OP = 'INSERT') then
    if NEW.status = 'published' then
      update public.posts set reply_count = reply_count + 1 where id = NEW.post_id;
    end if;
  elsif (TG_OP = 'DELETE') then
    if OLD.status = 'published' then
      update public.posts set reply_count = greatest(reply_count - 1, 0) where id = OLD.post_id;
    end if;
  elsif (TG_OP = 'UPDATE') then
    if OLD.status = 'published' and NEW.status != 'published' then
      update public.posts set reply_count = greatest(reply_count - 1, 0) where id = NEW.post_id;
    elsif OLD.status != 'published' and NEW.status = 'published' then
      update public.posts set reply_count = reply_count + 1 where id = NEW.post_id;
    end if;
  end if;
  return null;
end;
$$;
create trigger replies_count_trigger
  after insert or update or delete on public.replies
  for each row execute function public.update_post_reply_count();

-- ==========
-- 4. RLS
-- ==========

-- waitlist: 公開挿入のみ (LP からの登録)
alter table public.waitlist enable row level security;
create policy "anyone can insert waitlist" on public.waitlist for insert
  to anon, authenticated with check (true);

-- profiles: 公開読み + 本人更新
alter table public.profiles enable row level security;
create policy "anyone can read public profile fields" on public.profiles for select using (true);
create policy "users can update their own profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "service role full access on profiles" on public.profiles for all
  to service_role using (true) with check (true);

-- posts: space + role でアクセス制御
alter table public.posts enable row level security;
create policy "posts visible by space" on public.posts for select using (
  status = 'published' and (
    space = 'shared'
    or (space = 'self' and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'self'
    ))
    or (space = 'family' and exists (
      select 1 from public.profiles p where p.id = auth.uid()
        and p.role = any (array['family', 'supporter']::role_kind[])
    ))
  )
);
create policy "users can read their own posts" on public.posts for select
  using (author_id = auth.uid());
create policy "users can insert their own posts (not banned)" on public.posts for insert
  with check (
    author_id = auth.uid()
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.ban_until is not null
        and (p.ban_until > now() or p.ban_until = 'infinity'::timestamptz)
    )
  );
create policy "users can update their own posts" on public.posts for update
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "service role full access on posts" on public.posts for all
  to service_role using (true) with check (true);

-- post_media: 親 post が見えれば見える
alter table public.post_media enable row level security;
create policy "media visible if parent post visible" on public.post_media for select
  using (exists (select 1 from public.posts p where p.id = post_media.post_id));
create policy "users can insert media for own posts" on public.post_media for insert
  with check (exists (
    select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()
  ));
create policy "users can delete media for own posts" on public.post_media for delete
  using (exists (
    select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()
  ));
create policy "service role full access on post_media" on public.post_media for all
  to service_role using (true) with check (true);

-- empathy: 自分のうなずきだけ読める (誰がうなずいたかは隠す)
alter table public.empathy enable row level security;
create policy "users can read their own empathy" on public.empathy for select
  using (user_id = auth.uid());
create policy "users can insert their own empathy" on public.empathy for insert
  with check (user_id = auth.uid());
create policy "users can delete their own empathy" on public.empathy for delete
  using (user_id = auth.uid());
create policy "service role full access on empathy" on public.empathy for all
  to service_role using (true) with check (true);

-- replies: 親 post 同様 + 本人
alter table public.replies enable row level security;
create policy "replies visible if parent visible" on public.replies for select using (
  status = 'published'
  and exists (select 1 from public.posts p where p.id = replies.post_id)
);
create policy "users can read their own replies" on public.replies for select
  using (author_id = auth.uid());
create policy "users can insert replies (not banned)" on public.replies for insert
  with check (
    author_id = auth.uid()
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.ban_until is not null
        and (p.ban_until > now() or p.ban_until = 'infinity'::timestamptz)
    )
    and exists (select 1 from public.posts p where p.id = post_id)
  );
create policy "users can update their own replies" on public.replies for update
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "service role full access on replies" on public.replies for all
  to service_role using (true) with check (true);

-- reports: 通報者本人 + service_role
alter table public.reports enable row level security;
create policy "users can insert reports" on public.reports for insert
  with check (reporter_id = auth.uid());
create policy "users can read their own reports" on public.reports for select
  using (reporter_id = auth.uid());
create policy "service role full access on reports" on public.reports for all
  to service_role using (true) with check (true);

-- moderation_actions: service_role only
alter table public.moderation_actions enable row level security;
create policy "service role full access on moderation_actions" on public.moderation_actions for all
  to service_role using (true) with check (true);

-- crisis_events: service_role only (admin は service_role 経由でアクセス)
alter table public.crisis_events enable row level security;
create policy "service role full access on crisis_events" on public.crisis_events for all
  to service_role using (true) with check (true);

-- audit_logs: service_role only
alter table public.audit_logs enable row level security;
create policy "service role full access on audit_logs" on public.audit_logs for all
  to service_role using (true) with check (true);

-- subscriptions: 本人 select + service_role 全権 (Webhook 経由更新)
alter table public.subscriptions enable row level security;
create policy "users can read their own subscription" on public.subscriptions for select
  using (user_id = auth.uid());
create policy "service role full access on subscriptions" on public.subscriptions for all
  to service_role using (true) with check (true);

-- notifications: 本人 only
alter table public.notifications enable row level security;
create policy "users can read their own notifications" on public.notifications for select
  using (recipient_id = auth.uid());
create policy "users can update their own notifications" on public.notifications for update
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
create policy "users can delete their own notifications" on public.notifications for delete
  using (recipient_id = auth.uid());
create policy "service role full access on notifications" on public.notifications for all
  to service_role using (true) with check (true);

-- ==========
-- 5. Storage (post-media bucket + RLS)
-- ==========

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media', 'post-media', true,
  52428800, -- 50 MB
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ユーザーは自分の {user_id}/... 配下にのみ書込可
create policy "Authenticated upload to own folder" on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Anyone can view post-media" on storage.objects for select
  to public using (bucket_id = 'post-media');

create policy "Users delete own files" on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'post-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users update own files" on storage.objects for update
  to authenticated
  using (
    bucket_id = 'post-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
