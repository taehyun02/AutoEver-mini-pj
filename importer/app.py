import os, json, re
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict

import asyncpg
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query

load_dotenv()

DSN = os.environ["DATABASE_DSN"]
SERVICE_KEY = os.environ.get("DATA_GO_KR_SERVICE_KEY", "")
SEOUL_ZCODE = "11"
NUM_ROWS = 9999
BASE_URL = "http://apis.data.go.kr/B552584/EvCharger/getChargerInfo"

app = FastAPI(title="EV Station One-time Importer")

@app.on_event("startup")
async def startup():
    app.state.pool = await asyncpg.create_pool(DSN, min_size=1, max_size=5)

@app.on_event("shutdown")
async def shutdown():
    await app.state.pool.close()

def xml_to_items(xml_text: str):
    root = ET.fromstring(xml_text)
    total_text = root.findtext(".//totalCount")
    total = int(total_text) if total_text and total_text.isdigit() else None

    items = []
    for item in root.findall(".//items/item"):
        d = {}
        for child in list(item):
            d[child.tag] = (child.text or "").strip()
        items.append(d)
    return items, total

def yn_to_bool(v: str | None):
    if not v:
        return None
    vv = v.strip().upper()
    if vv == "Y": return True
    if vv == "N": return False
    return None

def to_float(v: str | None):
    if not v:
        return None
    try:
        return float(v)
    except:
        return None

def extract_gu(addr: str | None) -> str:
    """
    주소에서 'OO구' 추출 (예: '서울특별시 금천구 ...' -> '금천구')
    못 찾으면 UNKNOWN
    """
    if not addr:
        return "UNKNOWN"
    m = re.search(r"([가-힣]{2,}구)", addr)
    return m.group(1) if m else "UNKNOWN"

UPSERT_SQL = """
INSERT INTO ev_station (
  stat_id, stat_nm, zcode, zscode, gu_name, addr, lat, lng,
  use_time, location_desc, operator_name, operator_call,
  parking_free, limit_yn, limit_detail, note,
  charger_count, charger_type_counts, max_output_kw,
  raw_json
) VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,
  $9,$10,$11,$12,
  $13,$14,$15,$16,
  $17,$18::jsonb,$19,
  $20::jsonb
)
ON CONFLICT (stat_id) DO UPDATE SET
  stat_nm = EXCLUDED.stat_nm,
  zcode   = EXCLUDED.zcode,
  zscode  = EXCLUDED.zscode,
  gu_name = EXCLUDED.gu_name,
  addr    = EXCLUDED.addr,
  lat     = EXCLUDED.lat,
  lng     = EXCLUDED.lng,
  use_time      = EXCLUDED.use_time,
  location_desc = EXCLUDED.location_desc,
  operator_name = EXCLUDED.operator_name,
  operator_call = EXCLUDED.operator_call,
  parking_free  = EXCLUDED.parking_free,
  limit_yn      = EXCLUDED.limit_yn,
  limit_detail  = EXCLUDED.limit_detail,
  note          = EXCLUDED.note,
  charger_count       = EXCLUDED.charger_count,
  charger_type_counts = EXCLUDED.charger_type_counts,
  max_output_kw       = EXCLUDED.max_output_kw,
  raw_json            = EXCLUDED.raw_json,
  updated_at = now()
;
"""

async def fetch_all_seoul_items():
    if not SERVICE_KEY:
        raise HTTPException(500, "DATA_GO_KR_SERVICE_KEY is missing")

    items_all = []
    page_no = 1

    async with httpx.AsyncClient() as client:
        while True:
            params = {
                "ServiceKey": SERVICE_KEY,
                "pageNo": page_no,
                "numOfRows": NUM_ROWS,
                "zcode": SEOUL_ZCODE,
            }
            r = await client.get(BASE_URL, params=params, timeout=40.0)
            r.raise_for_status()

            items, total = xml_to_items(r.text)
            if not items:
                break

            items_all.extend(items)

            if total is not None and page_no * NUM_ROWS >= total:
                break
            if len(items) < NUM_ROWS:
                break

            page_no += 1

    return items_all

@app.post("/import/seoul")
async def import_seoul(confirm: bool = Query(False, description="true로 줘야 실행")):
    if not confirm:
        raise HTTPException(400, "confirm=true is required")

    items = await fetch_all_seoul_items()

    grouped = defaultdict(list)
    for it in items:
        sid = it.get("statId")
        if sid:
            grouped[sid].append(it)

    upserted = 0
    skipped_no_coords = 0

    async with app.state.pool.acquire() as conn:
        async with conn.transaction():
            for sid, rows in grouped.items():
                rep = rows[0]

                lat = to_float(rep.get("lat"))
                lng = to_float(rep.get("lng"))
                if lat is None or lng is None:
                    skipped_no_coords += 1
                    continue

                addr = rep.get("addr") or ""
                gu_name = extract_gu(addr)

                chger_ids = {r.get("chgerId") for r in rows if r.get("chgerId")}
                charger_count = len(chger_ids)

                type_counts = dict(Counter([(r.get("chgerType") or "UNKNOWN") for r in rows]))
                outputs = [to_float(r.get("output")) for r in rows]
                outputs = [v for v in outputs if v is not None]
                max_output_kw = max(outputs) if outputs else None

                await conn.execute(
                    UPSERT_SQL,
                    sid,
                    rep.get("statNm") or "",
                    (rep.get("zcode") or SEOUL_ZCODE),
                    (rep.get("zscode") or "00000"),
                    gu_name,
                    addr,
                    lat,
                    lng,
                    rep.get("useTime"),
                    rep.get("location"),
                    (rep.get("busiNm") or rep.get("bnm")),
                    rep.get("busiCall"),
                    yn_to_bool(rep.get("parkingFree")),
                    yn_to_bool(rep.get("limitYn")),
                    rep.get("limitDetail"),
                    rep.get("note"),
                    charger_count,
                    json.dumps(type_counts, ensure_ascii=False),
                    max_output_kw,
                    json.dumps(rep, ensure_ascii=False),
                )
                upserted += 1

    return {
        "items_fetched": len(items),
        "stations_upserted": upserted,
        "stations_skipped_no_coords": skipped_no_coords,
        "zcode": SEOUL_ZCODE,
    }
