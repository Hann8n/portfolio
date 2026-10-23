-- Accepts class_schedule_open (the apps' full class schedule) and class_signup_tap (its Sign Up button). SQLite can't change a CHECK constraint,
-- so the table is rebuilt with the same columns, defaults and indexes, and every row is copied.
CREATE TABLE metric_events_new (
  event_id TEXT PRIMARY KEY,
  event TEXT NOT NULL CHECK(event IN ('app_session','event_open','passport_open','settings_open','class_schedule_open','class_signup_tap','siri_crowds','siri_events','siri_event_details','ad_impression','ad_tap')),
  installation_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  received_at TEXT NOT NULL,
  app_version TEXT NOT NULL,
  build TEXT NOT NULL,
  os_version TEXT NOT NULL,
  ad_id TEXT,
  creative_version TEXT NOT NULL DEFAULT '',
  placement TEXT,
  status TEXT,
  platform TEXT NOT NULL DEFAULT 'ios' CHECK(platform IN ('ios','android'))
);
INSERT INTO metric_events_new
  (event_id, event, installation_id, session_id, received_at, app_version, build, os_version, ad_id, creative_version, placement, status, platform)
  SELECT event_id, event, installation_id, session_id, received_at, app_version, build, os_version, ad_id, creative_version, placement, status, platform
  FROM metric_events;
DROP TABLE metric_events;
ALTER TABLE metric_events_new RENAME TO metric_events;
CREATE INDEX metrics_received ON metric_events(received_at);
CREATE INDEX metrics_campaign ON metric_events(ad_id, received_at);
CREATE INDEX metrics_installation ON metric_events(installation_id, received_at);
CREATE INDEX metrics_platform ON metric_events(platform, received_at);
