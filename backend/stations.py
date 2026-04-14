from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from db_postgres import get_pg
from schemas import StationResponse

router = APIRouter(tags=["stations"])


@router.get("/map/{regionName}", response_model=StationResponse)
def get_stations_by_gu(regionName: str, db: Session = Depends(get_pg)):
    # regionName 최소 검증
    regionName = regionName.strip()
    if not regionName.endswith("구"):
        raise HTTPException(
            status_code=400,
            detail="regionName must end with '구' (e.g., 강남구)",
        )

    query = text(
        """
        SELECT stat_id, stat_nm, addr, lat, lng
        FROM ev_station
        WHERE gu_name = :gu
        ORDER BY stat_nm ASC
    """
    )

    rows = db.execute(query, {"gu": regionName}).fetchall()

    # 검색 결과가 없을 때도 200 + 빈 배열로 반환
    stations = []
    for r in rows:
        # lat/lng가 문자열일 수 있어 방어적으로 float 변환
        lat = float(r.lat) if r.lat is not None and str(r.lat).strip() != "" else None
        lng = float(r.lng) if r.lng is not None and str(r.lng).strip() != "" else None

        stations.append(
            {
                "stat_id": str(r.stat_id),
                "stat_nm": r.stat_nm,
                "addr": r.addr,
                "lat": lat,
                "lng": lng,
            }
        )

    return {"regionName": regionName, "stations": stations}
