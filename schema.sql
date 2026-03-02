-- schema.sql
CREATE EXTENSION IF NOT EXISTS postgis;

-- 예약 상태
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ev_reservation_status') THEN
    CREATE TYPE ev_reservation_status AS ENUM ('READY', 'USED', 'CANCEL');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS ev_station (
  stat_id  text PRIMARY KEY,
  stat_nm  text NOT NULL,

  zcode    char(2) NOT NULL,
  zscode   char(5) NOT NULL,

  -- ✅ 추가: 구 이름(금천구 등)
  gu_name  text NOT NULL,

  addr     text NOT NULL,
  lat      double precision NOT NULL,
  lng      double precision NOT NULL,

  geom     geometry(Point, 4326) GENERATED ALWAYS AS
             (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,

  use_time      text,
  location_desc text,
  operator_name text,
  operator_call text,
  parking_free  boolean,
  limit_yn      boolean,
  limit_detail  text,
  note          text,

  charger_count       integer NOT NULL DEFAULT 0,
  charger_type_counts jsonb   NOT NULL DEFAULT '{}'::jsonb,
  max_output_kw       numeric,

  capacity       integer NOT NULL DEFAULT 0,
  reserved_count integer NOT NULL DEFAULT 0,

  raw_json  jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_lat_range CHECK (lat BETWEEN -90 AND 90),
  CONSTRAINT chk_lng_range CHECK (lng BETWEEN -180 AND 180),
  CONSTRAINT chk_capacity_nonneg CHECK (capacity >= 0),
  CONSTRAINT chk_reserved_nonneg CHECK (reserved_count >= 0),
  CONSTRAINT chk_reserved_le_capacity CHECK (reserved_count <= capacity)
);

CREATE INDEX IF NOT EXISTS ev_station_zscode_idx ON ev_station (zscode);
CREATE INDEX IF NOT EXISTS ev_station_gu_name_idx ON ev_station (gu_name);
CREATE INDEX IF NOT EXISTS ev_station_geom_gix  ON ev_station USING GIST (geom);

CREATE TABLE IF NOT EXISTS ev_reservation (
  reserv_id char(26) PRIMARY KEY,
  user_id   varchar(100) NOT NULL,
  status    ev_reservation_status NOT NULL DEFAULT 'READY',
  stat_id   text NOT NULL REFERENCES ev_station(stat_id),
  start_dt  timestamptz NOT NULL,
  end_dt    timestamptz NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_reservation_time CHECK (end_dt > start_dt)
);

CREATE INDEX IF NOT EXISTS ev_reservation_stat_idx   ON ev_reservation (stat_id);
CREATE INDEX IF NOT EXISTS ev_reservation_user_idx   ON ev_reservation (user_id);
CREATE INDEX IF NOT EXISTS ev_reservation_status_idx ON ev_reservation (status);
