-- Migration: Alpha invite-only system for ひとつ
-- Tables: invite_codes, waitlist
-- Created: 2026-05-05

-- =========================================================
-- invite_codes: 招待コード台帳
-- =========================================================
CREATE TABLE IF NOT EXISTS public.invite_codes (
  code         text PRIMARY KEY,
  product      text NOT NULL DEFAULT 'hitotsu' CHECK (product IN ('yorisoi','hitotsu','both')),
  created_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at      timestamptz,
  expires_at   timestamptz,
  source       text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','x_reply','waitlist','founder')),
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invite_codes_unused_idx
  ON public.invite_codes (product, created_at DESC)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS invite_codes_used_by_idx
  ON public.invite_codes (used_by);

-- RLS: コードは service_role + admin のみ読み書き可能
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- service_role は無条件でアクセス可 (SUPABASE_SERVICE_ROLE_KEY 経由)
-- 一般ユーザー (anon, authenticated) からは何も見せない / 書かせない
-- → ポリシー定義不要 (RLS 有効で許可ポリシーがなければ拒否される)


-- =========================================================
-- waitlist: ウェイトリスト
-- =========================================================
CREATE TABLE IF NOT EXISTS public.waitlist (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text NOT NULL,
  product      text NOT NULL DEFAULT 'hitotsu' CHECK (product IN ('yorisoi','hitotsu','both')),
  source       text NOT NULL DEFAULT 'lp' CHECK (source IN ('lp','login','x','referral','other')),
  invited_at   timestamptz,
  invited_code text REFERENCES public.invite_codes(code) ON DELETE SET NULL,
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 同一メアド × 同一プロダクトは 1 件まで
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_product_uidx
  ON public.waitlist (lower(email), product);

CREATE INDEX IF NOT EXISTS waitlist_uninvited_idx
  ON public.waitlist (product, created_at ASC)
  WHERE invited_at IS NULL;

-- RLS: 一般ユーザーは insert のみ可 (自分のメアド登録)、参照は service_role 限定
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY waitlist_anon_insert
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);


-- =========================================================
-- ヘルパ関数: 招待コードの検証 (atomic)
-- =========================================================
-- 引数 code が「未使用 + 期限切れでない + product=hitotsu/both」なら true
CREATE OR REPLACE FUNCTION public.invite_code_is_valid(p_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invite_codes
    WHERE code = p_code
      AND used_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
      AND product IN ('hitotsu','both')
  );
$$;

GRANT EXECUTE ON FUNCTION public.invite_code_is_valid(text) TO anon, authenticated;
