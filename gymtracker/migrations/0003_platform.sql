-- Splits reporting by app platform. Existing rows default to iOS unless their OS says Android.
ALTER TABLE metric_events ADD COLUMN platform TEXT NOT NULL DEFAULT 'ios' CHECK(platform IN ('ios','android'));
CREATE INDEX IF NOT EXISTS metrics_platform ON metric_events(platform, received_at);
-- Rows from Android builds that reached the Worker before this migration.
UPDATE metric_events SET platform = 'android' WHERE os_version LIKE 'Android%';
