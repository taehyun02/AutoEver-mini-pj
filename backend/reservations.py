from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, time
import ulid  # pip install python-ulid 필수
from db_postgres import get_pg  # db_postgres.py에서 가져옴
from db_mongo import get_mongo
from schemas import ReservationCreateRequest, ReservationCreateResponse, ReservationListResponse

router = APIRouter(tags=["reservations"])

@router.post("/reservations", response_model=ReservationCreateResponse)
async def create_reservation(req: ReservationCreateRequest, db: Session = Depends(get_pg)):
    # 1. [시간 변환] 프론트 정수 -> DB용 TIMESTAMP로 조립
    today = datetime.now().date()
    start_dt_obj = datetime.combine(today, time(hour=req.start_dt))
    
    # 24시 예외 처리 (DB 저장 시 에러 방지)
    if req.end_dt == 24:
        end_dt_obj = datetime.combine(today, time(hour=23, minute=59, second=59))
    else:
        end_dt_obj = datetime.combine(today, time(hour=req.end_dt))

    # 2. [중복 체크] 직접 SQL 실행 (ERD 명칭 ev_resevation 기준)
    check_query = text("""
        SELECT 1 FROM ev_reservation 
        WHERE stat_id = :stat_id 
        AND start_dt < :end_dt 
        AND end_dt > :start_dt
    """)
    
    conflict = db.execute(check_query, {
        "stat_id": req.stat_id,
        "start_dt": start_dt_obj,
        "end_dt": end_dt_obj
    }).first()

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="이미 해당 시간에 예약이 존재합니다."
        )

    # 3. [데이터 저장] 직접 INSERT (ULID 생성 및 status 'READY' 고정)c
    new_reserv_id = ulid.new().str
    insert_query = text("""
        INSERT INTO ev_reservation (reserv_id, user_id, status, stat_id, start_dt, end_dt)
        VALUES (:reserv_id, :user_id, 'READY', :stat_id, :start_dt, :end_dt)
    """)
    
    db.execute(insert_query, {
        "reserv_id": new_reserv_id,
        "user_id": req.user_id,
        "stat_id": req.stat_id,
        "start_dt": start_dt_obj,
        "end_dt": end_dt_obj
    })
    db.commit()

    # 4. [응답] 최종 결과 반환
    return {
        "reserv_id": new_reserv_id,
        "status": "READY"
    }

# 전기차 충전소 별 예약 조회
@router.get("/stations/{stat_id}/reservations", response_model=ReservationListResponse)
def list_reservations(stat_id: str, db: Session = Depends(get_pg)):
    query = text("""
        SELECT reserv_id, user_id, start_dt, end_dt, status
        FROM ev_reservation
        WHERE stat_id = :stat_id
        ORDER BY start_dt ASC
    """)

    rows = db.execute(query, {"stat_id": stat_id}).fetchall()

    reservations = []
    for r in rows:
        reservations.append({
            "reserv_id": str(r.reserv_id),
            "user_id": r.user_id,
            "start_dt": r.start_dt,
            "end_dt": r.end_dt,
            "status": r.status,
        })
    return {"stat_id": stat_id, "reservations": reservations}
