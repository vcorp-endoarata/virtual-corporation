# Supabase migrations

このディレクトリは Supabase の SQL マイグレーションを保管します。

## 適用方法

通常は Supabase MCP の `apply_migration` ツール経由で本番に直接適用しています。
ローカルで Supabase CLI を使う場合は `supabase db push` で適用可能。

## ファイル命名

`{NNN}_{snake_case_description}.sql` 形式 (NNN は連番)。
過去の 018-029 はファイル化されておらず、Supabase 側にのみ存在します。
今後の新規マイグレーションはこのディレクトリに必ずコミットしてください。

## 既知のマイグレーション (Supabase 側)

- 018 user_relations_block_mute
- 019 post_tags_hashtags
- 020 bookmarks
- 021 profiles_theme
- 022 realtime_posts
- 023 avatars
- 024 pinned_post
- 025 sync_profile_email_hash_on_email_change
- 026 fix_email_hash_trigger_search_path
- 027 invite_system
- 028 realtime_replies
- 029 deletion_requests
- **030 security_cleanup** (このディレクトリ)
- **031 rls_initplan_optimization** (このディレクトリ)
