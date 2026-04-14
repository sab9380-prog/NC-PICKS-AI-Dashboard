-- activity_log: 점수 변경 사유 기록 테이블
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS activity_log (
  id          BIGSERIAL PRIMARY KEY,
  system_id   TEXT NOT NULL,
  week_label  TEXT NOT NULL,           -- e.g. '2026-W15' (ISO week)
  prev_score  INTEGER NOT NULL DEFAULT 0,
  new_score   INTEGER NOT NULL DEFAULT 0,
  reason      TEXT,                     -- PM이 입력하는 변경 사유
  created_by  TEXT,                     -- member_id
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_activity_log_system ON activity_log(system_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_week ON activity_log(week_label);

-- RLS 정책
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read activity_log"
  ON activity_log FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert activity_log"
  ON activity_log FOR INSERT
  WITH CHECK (true);
