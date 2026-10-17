CREATE TABLE metric_events (
  event_id TEXT PRIMARY KEY,
  event TEXT NOT NULL CHECK(event IN ('app_session','event_open','passport_open','settings_open','siri_crowds','siri_events','siri_event_details','ad_impression','ad_tap')),
  installation_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  received_at TEXT NOT NULL,
  app_version TEXT NOT NULL,
  build TEXT NOT NULL,
  os_version TEXT NOT NULL,
  ad_id TEXT,
  creative_version TEXT NOT NULL DEFAULT '',
  placement TEXT,
  status TEXT
);
CREATE INDEX metrics_received ON metric_events(received_at);
CREATE INDEX metrics_campaign ON metric_events(ad_id, received_at);
