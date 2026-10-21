-- Splits reporting by app platform. Every event before the Android release came from iOS.
ALTER TABLE metric_events ADD COLUMN platform TEXT NOT NULL DEFAULT 'ios' CHECK(platform IN ('ios','android'));
CREATE INDEX IF NOT EXISTS metrics_platform ON metric_events(platform, received_at);
