-- ============================================================
-- AI 시스템 진척 대시보드 — Supabase 초기 스키마
-- ============================================================

-- 1. members
CREATE TABLE members (
  id         text        PRIMARY KEY,
  name       text        NOT NULL,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. system_states
CREATE TABLE system_states (
  system_id     text        PRIMARY KEY,
  score         int         NOT NULL DEFAULT 0,
  status        text        NOT NULL DEFAULT 'normal'
                            CHECK (status IN ('normal', 'delay', 'hold')),
  status_reason text,
  owner_id      text,
  start_month   text,
  target_month  text,
  note          text,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  updated_by    text
);

-- 3. score_snapshots
CREATE TABLE score_snapshots (
  id          bigserial   PRIMARY KEY,
  system_id   text        NOT NULL,
  score       int         NOT NULL DEFAULT 0,
  snapshot_at date        NOT NULL DEFAULT CURRENT_DATE
);

-- 4. share_tokens
CREATE TABLE share_tokens (
  token      text        PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text,
  is_active  boolean     NOT NULL DEFAULT true
);

-- 5. app_config (password 등 앱 설정 저장)
CREATE TABLE app_config (
  key   text PRIMARY KEY,
  value text
);

-- ============================================================
-- RLS — MVP 단계: anon 키로 전체 CRUD 허용
-- ============================================================
ALTER TABLE members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_states   ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_tokens    ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON members         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON system_states   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON score_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON share_tokens    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON app_config      FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 기본 데이터: members (12명)
-- ============================================================
INSERT INTO members (id, name, is_active, created_at) VALUES
  ('m-kimjy',  '김재열', true, '2026-04-01T00:00:00Z'),
  ('m-kimje',  '김지은', true, '2026-04-01T00:00:00Z'),
  ('m-jungsm', '정수만', true, '2026-04-01T00:00:00Z'),
  ('m-tipa',   'TIPA',   true, '2026-04-01T00:00:00Z'),
  ('m-baeksh', '백서현', true, '2026-04-01T00:00:00Z'),
  ('m-hanjh',  '한정훈', true, '2026-04-01T00:00:00Z'),
  ('m-johik',  '조한익', true, '2026-04-01T00:00:00Z'),
  ('m-yunsh',  '윤성하', true, '2026-04-01T00:00:00Z'),
  ('m-hongik', '홍임경', true, '2026-04-01T00:00:00Z'),
  ('m-kimyh',  '김영환', true, '2026-04-01T00:00:00Z'),
  ('m-yangsh', '양세훈', true, '2026-04-01T00:00:00Z'),
  ('m-ohkm',   '오광묵', true, '2026-04-01T00:00:00Z');

-- ============================================================
-- 기본 데이터: system_states (18개 시스템)
-- ============================================================
INSERT INTO system_states (system_id, score, status, owner_id, start_month, target_month, updated_at) VALUES
  ('s01', 20, 'normal', 'm-kimjy',              '2026-04', '2026-10', now()),
  ('s02',  5, 'normal', 'm-kimjy',              '2026-04', '2026-10', now()),
  ('s03',  0, 'normal', 'm-baeksh,m-hanjh,m-johik', '2026-04', '2026-12', now()),
  ('s04', 20, 'normal', 'm-kimjy',              '2026-04', '2026-12', now()),
  ('s05', 15, 'normal', 'm-kimjy',              '2026-04', '2026-12', now()),
  ('s06',  0, 'normal', 'm-baeksh,m-hanjh,m-johik', '2026-04', '2027-04', now()),
  ('s07',  0, 'normal', 'm-yunsh,m-hongik,m-kimyh',  '2026-04', '2027-04', now()),
  ('s08', 60, 'normal', 'm-tipa',               '2026-04', '2027-01', now()),
  ('s09',  0, 'normal', 'm-yangsh',             '2026-04', '2027-01', now()),
  ('s10',  0, 'normal', 'm-ohkm',               '2026-04', '2027-01', now()),
  ('s11',  0, 'normal', 'm-yangsh',             '2026-04', '2027-01', now()),
  ('s12', 30, 'normal', 'm-kimje',              '2026-04', '2027-07', now()),
  ('s13',  0, 'normal', 'm-jungsm',             '2026-04', '2027-07', now()),
  ('s14',  0, 'normal', 'm-jungsm',             '2026-04', '2027-07', now()),
  ('s15',  0, 'normal', 'm-jungsm',             '2026-04', '2027-07', now()),
  ('s16', 30, 'normal', 'm-jungsm',             '2026-04', '2027-07', now()),
  ('s17',  0, 'normal', 'm-jungsm',             '2026-04', '2027-07', now()),
  ('s18',  0, 'normal', 'm-johik',              '2026-04', '2027-07', now());

-- 기본 비밀번호
INSERT INTO app_config (key, value) VALUES ('password', 'picks2026');
