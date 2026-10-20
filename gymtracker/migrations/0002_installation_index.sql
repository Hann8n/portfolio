-- Supports first-seen (new install) and per-installation engagement queries without full scans.
CREATE INDEX IF NOT EXISTS metrics_installation ON metric_events(installation_id, received_at);
