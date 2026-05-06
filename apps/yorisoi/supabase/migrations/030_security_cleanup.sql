-- 030_security_cleanup
-- Address Supabase security advisor warnings:
-- 1. waitlist has duplicate INSERT policies with WITH CHECK (true). Drop the redundant one.
-- 2. SECURITY DEFINER trigger functions are exposed via /rest/v1/rpc to anon/authenticated.
--    They are only meant to be invoked by triggers; revoke EXECUTE.

-- 1) Drop the duplicate waitlist policy.
drop policy if exists "anyone can insert waitlist" on public.waitlist;

-- 2) Revoke EXECUTE on trigger-only SECURITY DEFINER functions.
revoke execute on function public.extract_post_tags() from public, anon, authenticated;
revoke execute on function public.sync_profile_email_hash() from public, anon, authenticated;
revoke execute on function public.update_post_empathy_count() from public, anon, authenticated;
revoke execute on function public.update_post_reply_count() from public, anon, authenticated;
